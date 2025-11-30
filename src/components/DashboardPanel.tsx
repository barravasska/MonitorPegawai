// src/components/DashboardPanel.tsx
import React, { useState } from 'react';
import { Zap, Shield, AlertTriangle, User, LayoutDashboard, Database, BatteryCharging, TrendingUp, ChevronRight, Activity, Volume2, Check } from 'lucide-react';
import { Worker, Device, AlertLogEntry, RiskStatus } from '../models/types';
import { RISK_STATUS, getPrimaryTrigger } from '../models/riskLogic';

// Helper untuk ikon baterai
const getBatteryIcon = (percentage: number) => {
    if (percentage > 80) return <BatteryCharging className="w-4 h-4 text-green-600" />;
    if (percentage > 40) return <BatteryCharging className="w-4 h-4 text-yellow-600" />;
    if (percentage > 5) return <BatteryCharging className="w-4 h-4 text-red-600" />;
    return <BatteryCharging className="w-4 h-4 text-gray-400" />;
};

// --- KOMPONEN POPUP BUZZER (SweetAlert Style) ---
interface BuzzerAlertProps {
    workerName: string;
    onClose: () => void;
}

const BuzzerAlert: React.FC<BuzzerAlertProps> = ({ workerName, onClose }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                {/* Ikon Animasi Sukses */}
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-25"></div>
                    <Volume2 className="h-10 w-10 text-green-600" />
                    <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-1 border-2 border-green-100">
                        <Check className="w-4 h-4 text-green-600 bg-green-200 rounded-full p-0.5" />
                    </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Buzzer Aktif!</h3>
                <p className="text-gray-500 mb-6 text-sm">
                    Peringatan suara darurat telah dikirimkan ke perangkat milik <strong className="text-gray-800">{workerName}</strong>.
                </p>
                
                <button
                    onClick={onClose}
                    className="w-full inline-flex justify-center rounded-xl shadow-lg shadow-indigo-200 px-4 py-3 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 hover:shadow-indigo-300 transform active:scale-95 transition-all duration-200"
                >
                    OK, Mengerti
                </button>
            </div>
        </div>
    );
};

// --- Komponen Individual ---

// Komponen Worker Card
interface WorkerCardProps {
    worker: Worker;
    device?: Device;
    onDetailClick: (workerId: string) => void;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, device, onDetailClick }) => {
    const { status, sensors, isPaired } = worker;
    
    if (!isPaired) {
        return (
            <div className="h-full p-5 rounded-xl border-2 border-dashed border-gray-200 flex flex-col justify-center items-center text-center bg-gray-50 transition-all hover:border-gray-400 opacity-75 hover:opacity-100">
                <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-700">{worker.nama}</h3>
                <p className="text-xs text-gray-500 mt-1">Belum Terhubung</p>
                <div className="mt-4 text-xs font-medium text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                    Siap Pairing
                </div>
            </div>
        );
    }

    let borderClass = '';
    let textClass = '';
    let bgIconClass = '';
    let icon = null;
    let statusText = '';

    switch (status) {
        case RISK_STATUS.BAHAYA:
            borderClass = 'border-l-4 border-l-red-500';
            textClass = 'text-red-600';
            bgIconClass = 'bg-red-50';
            icon = <Zap className="w-5 h-5 text-red-600 animate-pulse" />;
            statusText = 'BAHAYA';
            break;
        case RISK_STATUS.WASAPADA:
            borderClass = 'border-l-4 border-l-yellow-500';
            textClass = 'text-yellow-600';
            bgIconClass = 'bg-yellow-50';
            icon = <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            statusText = 'WASPADA';
            break;
        case RISK_STATUS.AMAN:
        default:
            borderClass = 'border-l-4 border-l-emerald-500';
            textClass = 'text-emerald-600';
            bgIconClass = 'bg-emerald-50';
            icon = <Shield className="w-5 h-5 text-emerald-600" />;
            statusText = 'AMAN';
            break;
    }

    const batteryPercentage = device ? device.battery.toFixed(0) : 'N/A';
    const batteryIcon = device ? getBatteryIcon(device.battery) : null;

    return (
        <div className={`h-full bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col ${borderClass}`}>
            <div className="p-5 pb-3 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgIconClass}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 leading-tight text-lg">{worker.nama}</h3>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {worker.id}</div>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`text-xs font-black px-2 py-1 rounded uppercase tracking-wide ${bgIconClass} ${textClass}`}>
                        {statusText}
                    </span>
                </div>
            </div>

            <div className="px-5 py-2 flex-1">
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Dehidrasi (GSR)</p>
                        <p className="font-mono font-bold text-gray-800 text-lg">{sensors.gsr.toFixed(0)} <span className="text-xs font-normal text-gray-400">μS</span></p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Oksigen (SpO2)</p>
                        <p className="font-mono font-bold text-gray-800 text-lg">{sensors.spo2.toFixed(0)} <span className="text-xs font-normal text-gray-400">%</span></p>
                    </div>
                </div>
                
                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3 mt-1">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs">Tremor: <strong>{sensors.imu.toFixed(2)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {batteryIcon} {batteryPercentage}%
                    </div>
                </div>
            </div>

            <div className="p-4 pt-0 mt-2">
                <button 
                    className="w-full group flex justify-center items-center gap-2 text-sm font-semibold bg-white border border-gray-200 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all cursor-pointer active:scale-[0.98]"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDetailClick(worker.id);
                    }}
                >
                    Lihat Grafik
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};

// Komponen Prioritas Peringatan
interface PriorityAlertPanelProps {
    criticalWorkers: Worker[];
    onIntervention: (workerName: string) => void; // Prop baru untuk handle klik
}
const PriorityAlertPanel: React.FC<PriorityAlertPanelProps> = ({ criticalWorkers, onIntervention }) => {
    if (criticalWorkers.length === 0) {
        return (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-emerald-100 rounded-full">
                    <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-medium text-emerald-800">Sistem berjalan normal. Semua pekerja aman.</span>
            </div>
        );
    }
    
    return (
        <div className="bg-white border-l-4 border-red-500 rounded-xl shadow-md overflow-hidden animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                    <Zap className="w-5 h-5 animate-pulse" />
                    PERINGATAN KRITIS ({criticalWorkers.length})
                </h2>
                <span className="text-xs font-semibold bg-red-200 text-red-800 px-2 py-1 rounded animate-pulse">TINDAKAN DIPERLUKAN</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criticalWorkers.map(w => (
                    <div key={w.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                        <div>
                            <p className="font-bold text-gray-800">{w.nama}</p>
                            <p className="text-xs text-red-600 font-medium mt-0.5">{getPrimaryTrigger(w.sensors)}</p>
                        </div>
                        {/* Tombol Intervensi dengan Aksi */}
                        <button 
                            onClick={() => onIntervention(w.nama)}
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-xs hover:bg-red-700 hover:shadow-lg active:scale-95 transition-all shadow-sm cursor-pointer flex items-center gap-1"
                        >
                            <Volume2 className="w-3 h-3" />
                            INTERVENSI
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Komponen Log Peringatan
interface AlertLogTableProps {
    log: AlertLogEntry[];
    workerData: Worker[];
}
const AlertLogTable: React.FC<AlertLogTableProps> = ({ log, workerData }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    <Database className="w-5 h-5 text-gray-400" /> Log Aktivitas Sistem
                </h2>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                    {log.length} Entri Terakhir
                </span>
            </div>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-white sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Waktu</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Pekerja</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Pemicu</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {log.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-3 whitespace-nowrap text-xs font-mono text-gray-500">{entry.timestamp}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                                    {workerData.find(w => w.id === entry.workerId)?.nama || entry.workerId}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${entry.tingkatBahaya === RISK_STATUS.BAHAYA ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                        {entry.tingkatBahaya}
                                    </span>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500">{entry.pemicu}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500">{entry.aksi}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Komponen Metrik Global
interface GlobalMetricsProps {
    metrics: { name: string; count: number; color: string }[];
}
const GlobalMetrics: React.FC<GlobalMetricsProps> = ({ metrics }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(metric => {
            let textColor = 'text-gray-800';
            let iconColor = 'bg-gray-100';
            
            if (metric.name === 'Bahaya') { textColor = 'text-red-600'; iconColor = 'bg-red-100 text-red-600'; }
            if (metric.name === 'Waspada') { textColor = 'text-yellow-600'; iconColor = 'bg-yellow-100 text-yellow-600'; }
            if (metric.name === 'Aman') { textColor = 'text-emerald-600'; iconColor = 'bg-emerald-100 text-emerald-600'; }
            if (metric.name.includes('Total')) { textColor = 'text-blue-600'; iconColor = 'bg-blue-100 text-blue-600'; }

            return (
                <div key={metric.name} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{metric.name}</p>
                        <div className={`text-3xl font-black ${textColor}`}>
                            {metric.count}
                        </div>
                    </div>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${iconColor}`}>
                        <User className="w-5 h-5" />
                    </div>
                </div>
            );
        })}
    </div>
);


// Komponen Dashboard Utama (Menggabungkan semua View)
interface DashboardPanelProps {
    globalRiskMetrics: { name: string; count: number; color: string }[];
    criticalWorkers: Worker[];
    workerData: Worker[];
    alertLog: AlertLogEntry[];
    deviceData: Device[];
    onWorkerDetailClick: (workerId: string) => void; 
}
export const DashboardPanel: React.FC<DashboardPanelProps> = (props) => {
    const { globalRiskMetrics, criticalWorkers, workerData, alertLog, deviceData, onWorkerDetailClick } = props;
    
    // State lokal untuk Alert Buzzer
    const [buzzerActiveWorker, setBuzzerActiveWorker] = useState<string | null>(null);

    // Sort workerData: Bahaya first, then Waspada, then Aman
    const sortedWorkers = [...workerData].sort((a, b) => {
        if (a.isPaired !== b.isPaired) return a.isPaired ? -1 : 1; 
        const priority = { [RISK_STATUS.BAHAYA]: 3, [RISK_STATUS.WASAPADA]: 2, [RISK_STATUS.AMAN]: 1 };
        return (priority[b.status] || 0) - (priority[a.status] || 0);
    });

    return (
        <div className="space-y-8">
            {/* Pop-up Buzzer Alert */}
            {buzzerActiveWorker && (
                <BuzzerAlert 
                    workerName={buzzerActiveWorker} 
                    onClose={() => setBuzzerActiveWorker(null)} 
                />
            )}

            {/* Bagian Atas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3">
                    <GlobalMetrics metrics={globalRiskMetrics} />
                </div>
                <div className="lg:col-span-3">
                    <PriorityAlertPanel 
                        criticalWorkers={criticalWorkers} 
                        onIntervention={(name) => setBuzzerActiveWorker(name)} 
                    />
                </div>
            </div>
            
            {/* Bagian Tengah */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-indigo-500"/> 
                        Live Monitoring
                    </h2>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Update Real-time (5s)
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                    {sortedWorkers.map(worker => {
                        const device = deviceData.find(d => d.id === worker.deviceId);
                        return (
                            <div key={worker.id} className="h-full">
                                <WorkerCard worker={worker} device={device} onDetailClick={onWorkerDetailClick} />
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Bagian Bawah */}
            <AlertLogTable log={alertLog} workerData={workerData} />
        </div>
    );
};