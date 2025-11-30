// src/components/WorkerDetailModal.tsx
import React, { useMemo } from 'react';
import { X, Cpu, BatteryCharging } from 'lucide-react';
import { Worker, Device } from '../models/types';
import { THRESHOLDS } from '../models/riskLogic';

// Tipe data historis
interface HistoricalDataEntry {
    workerId: string;
    timestamp: string;
    gsr: number;
    imu: number;
    spo2: number;
}

interface WorkerDetailModalProps {
    worker: Worker;
    device?: Device;
    historicalData: HistoricalDataEntry[];
    onClose: () => void;
}

// --- 1. KOMPONEN CHART CARD ---
interface ChartCardProps {
    title: string;
    batasAmanLabel: string;
    batasAmanValue: number;
    unit: string;
    currentValue: number;
    chart: React.ReactNode;
    color?: 'blue' | 'yellow' | 'red' | 'emerald';
}

const ChartCard: React.FC<ChartCardProps> = ({
    title,
    batasAmanLabel,
    batasAmanValue,
    unit,
    currentValue,
    chart,
    color = "blue",
}) => {
    const colorMap: any = {
        blue: "text-blue-600 bg-blue-50 border-blue-200",
        yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
        red: "text-red-600 bg-red-50 border-red-200",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Batas Aman: <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded">{batasAmanLabel}</span>
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-3xl font-black text-gray-900 leading-none">
                        {currentValue}
                        <span className="text-sm font-medium text-gray-400 ml-1">{unit}</span>
                    </p>
                </div>
            </div>

            {/* Garis Pembatas */}
            <div className="my-4 border-b border-gray-100"></div>

            {/* Chart Area */}
            <div className="w-full h-40 relative">
                {chart}

                {/* Threshold Badge (Overlay) */}
                <div className="absolute top-0 right-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${colorMap[color]}`}>
                        Batas {batasAmanValue}
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- 2. KOMPONEN SPARKLINE ---
interface SparkLineProps {
    data: number[];
    maxVal: number;
    threshold: number;
    colorHex: string;
    isSpO2?: boolean;
}

const SparkLine: React.FC<SparkLineProps> = ({ data, maxVal, threshold, colorHex, isSpO2 = false }) => {
    const WIDTH = 500;
    const HEIGHT = 160; 
    const padding = 10;
    const chartWidth = WIDTH - 2 * padding;
    const chartHeight = HEIGHT - 2 * padding;

    const points = data.map((value, index) => {
        const x = padding + (index / (Math.max(data.length - 1, 1))) * chartWidth;
        const clampedVal = Math.min(Math.max(value, 0), maxVal); 
        const y = padding + chartHeight - (clampedVal / maxVal) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    const thresholdY = padding + chartHeight - (threshold / maxVal) * chartHeight;

    return (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full overflow-visible">
            <line x1={padding} y1={HEIGHT - padding} x2={WIDTH - padding} y2={HEIGHT - padding} stroke="#f3f4f6" strokeWidth="2" />
            
            <line 
                x1={padding} y1={thresholdY} 
                x2={WIDTH - padding} y2={thresholdY} 
                stroke={isSpO2 ? '#ef4444' : '#f59e0b'} 
                strokeDasharray="6,4" 
                strokeWidth="1.5"
                opacity="0.6"
            />

            {data.length > 1 && (
                <>
                    <defs>
                        <linearGradient id={`grad-${colorHex}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={colorHex} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={colorHex} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path 
                        d={`M ${padding} ${HEIGHT - padding} L ${points.split(' ')[0]} ${points.replace(/ /g, ' L ')} L ${points.split(' ').pop()?.split(',')[0]} ${HEIGHT - padding} Z`} 
                        fill={`url(#grad-${colorHex})`} 
                    />
                    <polyline 
                        fill="none" 
                        stroke={colorHex} 
                        strokeWidth="3" 
                        points={points} 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="drop-shadow-sm"
                    />
                </>
            )}
        </svg>
    );
};

// --- 3. KOMPONEN MODAL UTAMA ---
export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({ worker, device, historicalData, onClose }) => {
    
    const chartData = useMemo(() => {
        const lastEntries = historicalData.slice(-50); 
        return {
            gsr: lastEntries.map(d => d.gsr),
            imu: lastEntries.map(d => d.imu),
            spo2: lastEntries.map(d => d.spo2),
        };
    }, [historicalData]);

    const battery = device ? device.battery.toFixed(0) : 'N/A';
    
    const headerColorClass = worker.status === 'Bahaya' ? 'bg-red-600' : worker.status === 'Waspada' ? 'bg-yellow-500' : 'bg-emerald-600';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <style>
                {`
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
                `}
            </style>

            <div 
                className="absolute inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-slide-up">
                
                {/* Header Modal */}
                <div className={`${headerColorClass} p-6 flex justify-between items-start shrink-0 text-white shadow-md z-10`}>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
                                <span className={`text-xl font-black ${worker.status === 'Bahaya' ? 'text-red-600' : worker.status === 'Waspada' ? 'text-yellow-500' : 'text-emerald-600'}`}>
                                    {worker.nama.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{worker.nama}</h2>
                                <p className="text-white text-opacity-90 text-sm flex items-center gap-2 mt-1">
                                    {/* FIX: Mengubah warna text menjadi abu-abu gelap (gray-800) agar terbaca di atas bg-white */}
                                    <span className="bg-white text-gray-800 font-bold px-2 py-0.5 rounded text-xs font-mono shadow-sm">ID: {worker.id}</span>
                                    <span>•</span>
                                    <span className="font-medium">{worker.pekerjaan}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition shadow-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Info Bar */}
                <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center gap-6 text-sm shrink-0">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Device:</span> 
                        {/* FIX: Memperjelas teks Device ID */}
                        <span className="border px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-800 font-bold">{worker.deviceId || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BatteryCharging className={`w-4 h-4 ${Number(battery) < 20 ? 'text-red-500' : 'text-green-500'}`} />
                        <span className="font-medium text-gray-700">Baterai:</span> 
                        <span className="font-bold text-gray-800">{battery}%</span>
                    </div>
                    <div className="flex-1 text-right text-gray-400 text-xs italic">
                        Menampilkan 50 titik data terakhir (Real-time)
                    </div>
                </div>

                {/* Scrollable Charts Area */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 gap-4">
                        
                        <ChartCard
                            title="Tingkat Dehidrasi (GSR)"
                            batasAmanLabel="< 150 μS"
                            batasAmanValue={THRESHOLDS.GSR_WARNING}
                            unit="μS"
                            currentValue={chartData.gsr.length > 0 ? parseFloat(chartData.gsr[chartData.gsr.length - 1].toFixed(1)) : 0}
                            color="blue"
                            chart={
                                <SparkLine 
                                    data={chartData.gsr} 
                                    maxVal={250} 
                                    threshold={THRESHOLDS.GSR_WARNING} 
                                    colorHex="#2563eb" 
                                />
                            }
                        />

                        <ChartCard
                            title="Stabilitas Motorik / Tremor (IMU)"
                            batasAmanLabel="< 0.9 g"
                            batasAmanValue={THRESHOLDS.IMU_WARNING}
                            unit="g"
                            currentValue={chartData.imu.length > 0 ? parseFloat(chartData.imu[chartData.imu.length - 1].toFixed(2)) : 0}
                            color="yellow"
                            chart={
                                <SparkLine 
                                    data={chartData.imu} 
                                    maxVal={3.0} 
                                    threshold={THRESHOLDS.IMU_WARNING} 
                                    colorHex="#ca8a04" 
                                />
                            }
                        />

                        <ChartCard
                            title="Saturasi Oksigen (SpO2)"
                            batasAmanLabel="> 97 %"
                            batasAmanValue={THRESHOLDS.SPO2_WARNING}
                            unit="%"
                            currentValue={chartData.spo2.length > 0 ? parseFloat(chartData.spo2[chartData.spo2.length - 1].toFixed(1)) : 0}
                            color="emerald"
                            chart={
                                <SparkLine 
                                    data={chartData.spo2} 
                                    maxVal={100} 
                                    threshold={THRESHOLDS.SPO2_WARNING} 
                                    colorHex="#059669" 
                                    isSpO2={true}
                                />
                            }
                        />

                    </div>
                </div>

                {/* Footer Modal */}
                <div className="p-4 border-t border-gray-200 bg-white shrink-0 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};