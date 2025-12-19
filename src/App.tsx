// src/App.tsx - Main Application Controller
// Versi Final: Integrasi Database + UI Modal Modern + Responsive Mobile Navbar

import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Zap, User, TrendingUp, Settings, Database as DatabaseIcon, Menu, X } from 'lucide-react';
// Impor Tipe Data
import { Worker, Device, AlertLogEntry, RiskStatus } from './models/types'; 
// Impor Logika Bisnis
import { determineRiskStatus, generateRandomSensorData, getPrimaryTrigger, RISK_STATUS } from './models/riskLogic';
// Impor Komponen View
import { DashboardPanel } from './components/DashboardPanel';
import { DeviceManagementPanel } from './components/ManagementPanel';
import { WorkerDetailModal } from './components/WorkerDetailModal';
import { StatusModal } from './components/StatusModal';
// IMPOR MODAL KONFIRMASI (Pastikan file ini ada)
import { ConfirmationModal } from './components/ConfirmationModal';

// Impor Service Database
import { 
    fetchWorkers, fetchDevices, addWorkerToDB, deleteWorkerFromDB, 
    registerDeviceToDB, pairDeviceInDB, unpairDeviceInDB 
} from './services/dbServices'; 

// Tipe data historis
interface HistoricalDataEntry {
    workerId: string;
    timestamp: string;
    gsr: number;
    imu: number;
    spo2: number;
}

const App: React.FC = () => {
    // --- 1. STATE MANAGEMENT ---
    const [workerData, setWorkerData] = useState<Worker[]>([]);
    const [deviceData, setDeviceData] = useState<Device[]>([]); 
    const [alertLog, setAlertLog] = useState<AlertLogEntry[]>([]); 
    const [historicalData, setHistoricalData] = useState<HistoricalDataEntry[]>([]);
    const [selectedWorkerIdForDetail, setSelectedWorkerIdForDetail] = useState<string | null>(null);

    const [isSimulating, setIsSimulating] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true); 
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'management'>('dashboard');
    
    // State UI Mobile Menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // State Form
    const [newDeviceId, setNewDeviceId] = useState<string>('');
    const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

    // State untuk Modal Status (Success/Error)
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    // STATE BARU: Untuk Mengontrol Modal Konfirmasi Hapus
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);

    // Helper Modal Status
    const showModal = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
        setModalState({ isOpen: true, type, title, message });
    };

    // --- 2. INTEGRASI DATABASE ---
    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            try {
                const workersFromDB = await fetchWorkers();
                const devicesFromDB = await fetchDevices();

                const workersWithSensors = workersFromDB.map(w => ({
                    ...w,
                    initialStatus: RISK_STATUS.AMAN,
                    status: RISK_STATUS.AMAN, 
                    sensors: { gsr: 0, imu: 0, spo2: 0, timestamp: '-' }
                }));

                setWorkerData(workersWithSensors);
                setDeviceData(devicesFromDB);
                console.log("Data berhasil dimuat dari Supabase");
            } catch (error) {
                console.error("Gagal memuat data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initData();
    }, []);

    // --- 3. SIMULASI SENSOR REAL-TIME ---
    useEffect(() => {
        if (!isSimulating || isLoading || workerData.length === 0) return;

        const runSimulationStep = () => {
            const currentTimestamp = new Date().toLocaleTimeString('id-ID');
            const newHistoricalEntries: HistoricalDataEntry[] = [];

            setWorkerData(prevData => {
                return prevData.map(worker => {
                    if (!worker.isPaired) return worker; 

                    const newStatus: RiskStatus = Math.random() < 0.05
                        ? Object.values(RISK_STATUS)[Math.floor(Math.random() * 3)]
                        : worker.status;

                    const sensors = generateRandomSensorData(newStatus);
                    const determinedStatus = determineRiskStatus(sensors.gsr, sensors.imu, sensors.spo2);
                    
                    if (determinedStatus !== RISK_STATUS.AMAN && determinedStatus !== worker.status) {
                        const trigger = getPrimaryTrigger(sensors);
                        const action = determinedStatus === RISK_STATUS.WASAPADA 
                            ? 'Getaran Gelang' : 'Notifikasi Supervisor';

                        setAlertLog(prevLog => [
                            {
                                id: Date.now() + Math.random(), 
                                workerId: worker.id,
                                deviceId: worker.deviceId,
                                timestamp: currentTimestamp,
                                pemicu: trigger,
                                tingkatBahaya: determinedStatus,
                                aksi: action,
                            },
                            ...prevLog.slice(0, 19), 
                        ]);
                    }

                    newHistoricalEntries.push({
                        workerId: worker.id,
                        timestamp: currentTimestamp,
                        gsr: sensors.gsr,
                        imu: sensors.imu,
                        spo2: sensors.spo2,
                    });

                    return { ...worker, sensors: {...sensors, timestamp: currentTimestamp}, status: determinedStatus };
                });
            });

            setHistoricalData(prevHistory => {
                const newHistory = [...prevHistory, ...newHistoricalEntries];
                return newHistory.length > 200 ? newHistory.slice(newHistory.length - 200) : newHistory;
            });
            
            setDeviceData(prevDevices => prevDevices.map(d => {
                const statusActive: Device['status'] = 'Aktif';
                return {
                    ...d,
                    battery: d.status === statusActive && d.battery > 5 ? d.battery - (Math.random() * 0.5) : d.battery
                }
            }));
        };

        const interval = setInterval(runSimulationStep, 5000); 
        return () => clearInterval(interval);
    }, [isSimulating, isLoading, workerData.length]); 

    // --- 4. HANDLERS ---
    
    const { criticalWorkers, globalRiskMetrics } = useMemo(() => {
        const pairedWorkers = workerData.filter(w => w.isPaired);
        const critical = pairedWorkers.filter(w => w.status === RISK_STATUS.BAHAYA);
        const warning = pairedWorkers.filter(w => w.status === RISK_STATUS.WASAPADA);
        const safe = pairedWorkers.filter(w => w.status === RISK_STATUS.AMAN);
        const totalPaired = pairedWorkers.length;

        const metrics = [
            { name: 'Aman', count: safe.length, color: 'bg-green-500' },
            { name: 'Waspada', count: warning.length, color: 'bg-yellow-500' },
            { name: 'Bahaya', count: critical.length, color: 'bg-red-500' },
            { name: 'Total Dipantau', count: totalPaired, color: 'bg-blue-500' },
        ];

        return { 
        criticalWorkers: critical, 
        globalRiskMetrics: metrics 
        };
    }, [workerData]);

    const handleAddWorker = async (newWorkerName: string, newWorkerJob: string, newWorkerAge: number) => {
        try {
            const savedWorker = await addWorkerToDB({ 
                nama: newWorkerName, 
                pekerjaan: newWorkerJob, 
                usia: newWorkerAge 
            });

            const newWorker: Worker = {
                id: savedWorker.id,
                nama: savedWorker.nama,
                usia: savedWorker.usia,
                pekerjaan: savedWorker.pekerjaan,
                deviceId: null,
                isPaired: false,
                initialStatus: RISK_STATUS.AMAN,
                status: RISK_STATUS.AMAN,
                sensors: { gsr: 0, imu: 0, spo2: 0, timestamp: '-' }
            };
            setWorkerData(prev => [...prev, newWorker]);
            showModal('success', 'Berhasil', `Data pekerja ${newWorkerName} tersimpan.`);
        } catch (error) {
            console.error(error);
            showModal('error', 'Gagal', 'Gagal menyimpan data ke database.');
        }
    };

    // --- LOGIKA HAPUS DENGAN MODAL BARU ---
    
    // Langkah 1: Dipanggil saat tombol sampah diklik
    // Fungsi ini BUKAN menghapus, tapi MEMBUKA MODAL KONFIRMASI
    const initiateDeleteWorker = (workerId: string) => {
        setWorkerToDelete(workerId);
        setConfirmModalOpen(true); // Buka modal konfirmasi
    };

    // Langkah 2: Dipanggil saat user klik "Ya, Hapus" di modal
    const confirmDeleteWorker = async () => {
        if (!workerToDelete) return;
        setConfirmModalOpen(false); // Tutup modal dulu

        const worker = workerData.find(w => w.id === workerToDelete);
        if (worker?.isPaired && worker.deviceId) {
            await handleUnpairDevice(workerToDelete, worker.deviceId);
        }

        try {
            await deleteWorkerFromDB(workerToDelete);
            setWorkerData(prevData => prevData.filter(w => w.id !== workerToDelete));
            showModal('success', 'Terhapus', 'Data pekerja berhasil dihapus permanen.');
        } catch (error) {
            showModal('error', 'Gagal', 'Gagal menghapus data dari database.');
        } finally {
            setWorkerToDelete(null);
        }
    };

    const handleRegisterDevice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeviceId || !selectedWorkerId) return;

        const upperDeviceId = newDeviceId.toUpperCase();
        if (deviceData.some(d => d.id === upperDeviceId)) {
            showModal('error', 'Duplikasi', `Device ID ${upperDeviceId} sudah terdaftar.`);
            return;
        }

        try {
            await registerDeviceToDB(upperDeviceId);
            await pairDeviceInDB(selectedWorkerId, upperDeviceId);

            setDeviceData(prev => [...prev, { id: upperDeviceId, status: 'Aktif', battery: 100 } as Device]);
            setWorkerData(prev => prev.map(w => {
                if (w.id === selectedWorkerId) {
                    return { 
                        ...w, 
                        deviceId: upperDeviceId, 
                        isPaired: true, 
                        sensors: generateRandomSensorData(RISK_STATUS.AMAN),
                        status: RISK_STATUS.AMAN
                    };
                }
                return w;
            }));

            setNewDeviceId('');
            setSelectedWorkerId('');
            showModal('success', 'Terhubung', `Alat ${upperDeviceId} berhasil diaktifkan.`);
        } catch (error) {
            console.error(error);
            showModal('error', 'Gagal', 'Terjadi kesalahan saat pairing alat.');
        }
    };

    const handleUnpairDevice = async (workerId: string, deviceId: string) => {
        try {
            await unpairDeviceInDB(workerId, deviceId);
            setWorkerData(prev => prev.map(w => 
                w.id === workerId 
                ? { ...w, deviceId: null, isPaired: false, status: RISK_STATUS.AMAN, sensors: { gsr: 0, imu: 0, spo2: 0, timestamp: '-' } } 
                : w
            ));
            setDeviceData(prev => prev.map(d => 
                d.id === deviceId ? { ...d, status: 'Non-aktif' as Device['status'] } : d
            ));
        } catch (error) {
            showModal('error', 'Gagal', 'Gagal memutuskan koneksi alat.');
        }
    };

    // --- RENDER CONTENT ---

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <RefreshCw className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                    <p>Menghubungkan ke Basis Data...</p>
                </div>
            );
        }

        switch (currentPage) {
            case 'management':
                return <DeviceManagementPanel 
                    handleRegisterDevice={handleRegisterDevice}
                    newDeviceId={newDeviceId}
                    setNewDeviceId={setNewDeviceId}
                    selectedWorkerId={selectedWorkerId}
                    setSelectedWorkerId={setSelectedWorkerId}
                    workerData={workerData}
                    deviceData={deviceData}
                    handleUnpairDevice={handleUnpairDevice}
                    handleAddWorker={handleAddWorker}
                    handleDeleteWorker={initiateDeleteWorker} 
                />;
            case 'dashboard':
            default:
                return <DashboardPanel 
                    globalRiskMetrics={globalRiskMetrics} 
                    criticalWorkers={criticalWorkers} 
                    workerData={workerData} 
                    alertLog={alertLog} 
                    deviceData={deviceData}
                    onWorkerDetailClick={setSelectedWorkerIdForDetail} 
                />;
        }
    };

    const workerDetailData = workerData.find(w => w.id === selectedWorkerIdForDetail);
    const filteredHistoricalData = historicalData.filter(d => d.workerId === selectedWorkerIdForDetail);
    const workerDevice = workerDetailData ? deviceData.find(d => d.id === workerDetailData.deviceId) : undefined;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative">
            
            {/* 1. Modal Status (Sukses/Gagal) */}
            <StatusModal 
                isOpen={modalState.isOpen}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
            />

            {/* 2. Modal Konfirmasi Hapus */}
            <ConfirmationModal 
                isOpen={confirmModalOpen}
                type="danger"  // ← PASTIKAN INI ADA
                title="Hapus Data Pekerja?"
                message="Data ini akan dihapus secara permanen dari database. Tindakan ini tidak dapat dibatalkan."
                onCancel={() => setConfirmModalOpen(false)}
                onConfirm={confirmDeleteWorker}
            />

            {/* Header Responsif */}
            <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2 tracking-tight">
                            <Zap className="w-8 h-8 text-red-600 fill-red-600" /> 
                            <span>SMART-G <span className="hidden sm:inline text-gray-400 font-light">KELOMPOK 7</span></span>
                        </h1>
                        
                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-3">
                            <button 
                                onClick={() => setCurrentPage('dashboard')} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${currentPage === 'dashboard' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <TrendingUp className="w-4 h-4" /> Dashboard
                            </button>
                            <button 
                                onClick={() => setCurrentPage('management')} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${currentPage === 'management' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Settings className="w-4 h-4" /> Manajemen
                            </button>
                            
                            <div className="h-6 w-px bg-gray-200 mx-2"></div>

                            <button 
                                onClick={() => setIsSimulating(!isSimulating)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isSimulating ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                            >
                                <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
                                {isSimulating ? 'Live' : 'Paused'}
                            </button>
                        </div>

                        {/* Mobile Hamburger Button */}
                        <div className="md:hidden">
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden mt-4 pb-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col gap-2 pt-4">
                                <button 
                                    onClick={() => { setCurrentPage('dashboard'); setIsMobileMenuOpen(false); }} 
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${currentPage === 'dashboard' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <TrendingUp className="w-5 h-5" /> Dashboard
                                </button>
                                <button 
                                    onClick={() => { setCurrentPage('management'); setIsMobileMenuOpen(false); }} 
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${currentPage === 'management' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <Settings className="w-5 h-5" /> Manajemen Alat & Pekerja
                                </button>
                                
                                <div className="h-px bg-gray-200 my-2"></div>

                                <button 
                                    onClick={() => { setIsSimulating(!isSimulating); setIsMobileMenuOpen(false); }}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${isSimulating ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className={`w-5 h-5 ${isSimulating ? 'animate-spin' : ''}`} />
                                        Status Simulasi
                                    </span>
                                    <span>{isSimulating ? 'Live' : 'Paused'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {renderContent()}
            </main>

            {/* Modal Detail Grafik */}
            {selectedWorkerIdForDetail && workerDetailData && (
                <WorkerDetailModal 
                    worker={workerDetailData} 
                    device={workerDevice}
                    historicalData={filteredHistoricalData}
                    onClose={() => setSelectedWorkerIdForDetail(null)}
                />
            )}

            {/* Footer */}
            <footer className="py-6 mt-10 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
                <div className="flex justify-center items-center gap-2 mb-2">
                    <DatabaseIcon className="w-4 h-4" />
                    <span className="font-medium">
                        {isLoading ? 'Connecting...' : 'Connected to Supabase'}
                    </span>
                </div>
                <p>SMART-G © 2025 | PKM Karsa Cipta</p>
            </footer>
        </div>
    );
};

export default App;