// src/components/ManagementPanel.tsx
import React, { useState } from 'react';
import { Cpu, UserPlus, Trash, Edit, Link, PlusCircle, Search } from 'lucide-react';
import { Worker, Device } from '../models/types';

interface DeviceManagementPanelProps {
    handleRegisterDevice: (e: React.FormEvent) => void;
    newDeviceId: string;
    setNewDeviceId: (id: string) => void;
    selectedWorkerId: string;
    setSelectedWorkerId: (id: string) => void;
    workerData: Worker[];
    deviceData: Device[];
    handleUnpairDevice: (workerId: string, deviceId: string) => void;
    handleAddWorker: (name: string, job: string, age: number) => void;
    handleDeleteWorker: (workerId: string) => void;
}

export const DeviceManagementPanel: React.FC<DeviceManagementPanelProps> = ({
    handleRegisterDevice,
    newDeviceId,
    setNewDeviceId,
    selectedWorkerId,
    setSelectedWorkerId,
    workerData,
    deviceData,
    handleUnpairDevice,
    handleAddWorker,
    handleDeleteWorker
}) => {
    const assignedWorkers = workerData.filter(w => w.isPaired);
    const availableWorkers = workerData.filter(w => !w.isPaired);
    const deviceMap = Object.fromEntries(deviceData.map(d => [d.id, d]));

    // State lokal untuk form tambah pekerja baru
    const [newWorkerName, setNewWorkerName] = useState('');
    const [newWorkerJob, setNewWorkerJob] = useState('');
    const [newWorkerAge, setNewWorkerAge] = useState<number | ''>('');

    const handleNewWorkerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWorkerName && newWorkerJob && newWorkerAge) {
            handleAddWorker(newWorkerName, newWorkerJob, newWorkerAge as number);
            setNewWorkerName('');
            setNewWorkerJob('');
            setNewWorkerAge('');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Halaman */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Cpu className="w-6 h-6 text-indigo-600" /> Manajemen Sistem
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Kelola inventaris alat dan data personil proyek.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
                    Total Alat Terhubung: {assignedWorkers.length}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BAGIAN 1: Form Registrasi Alat (Kiri) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2 border-b pb-2">
                        <Link className="w-5 h-5 text-indigo-500" /> Pairing Alat Baru
                    </h3>
                    
                    <form onSubmit={handleRegisterDevice} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Perangkat (Device ID)</label>
                            <div className="relative">
                                <Cpu className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Contoh: SGT-007G" 
                                    // FIX: Menambahkan text-gray-900 dan placeholder-gray-400
                                    className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition uppercase text-gray-900 placeholder-gray-400 bg-white"
                                    value={newDeviceId}
                                    onChange={(e) => setNewDeviceId(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pekerja</label>
                            <select 
                                // FIX: Menambahkan text-gray-900
                                className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                value={selectedWorkerId}
                                onChange={(e) => setSelectedWorkerId(e.target.value)}
                                required
                            >
                                <option value="" className="text-gray-500">-- Pilih Pekerja yang Tersedia --</option>
                                {availableWorkers.map(w => <option key={w.id} value={w.id} className="text-gray-900">{w.nama} (ID: {w.id})</option>)}
                            </select>
                            {availableWorkers.length === 0 && (
                                <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                                    * Semua pekerja sudah memiliki alat. Tambahkan pekerja baru terlebih dahulu.
                                </p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            disabled={availableWorkers.length === 0}
                        >
                            <Link className="w-4 h-4" />
                            Hubungkan & Aktifkan
                        </button>
                    </form>
                </div>

                {/* BAGIAN 2: Form Tambah Pekerja (Kanan) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-emerald-500">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2 border-b pb-2">
                        <UserPlus className="w-5 h-5 text-emerald-500" /> Registrasi Personil
                    </h3>
                    
                    <form onSubmit={handleNewWorkerSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input 
                                type="text" 
                                placeholder="Masukkan nama pekerja..." 
                                // FIX: Menambahkan text-gray-900 dan placeholder-gray-400
                                className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-gray-900 placeholder-gray-400 bg-white"
                                value={newWorkerName}
                                onChange={(e) => setNewWorkerName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                                <input 
                                    type="text" 
                                    placeholder="Tukang Las..." 
                                    // FIX: Menambahkan text-gray-900 dan placeholder-gray-400
                                    className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-gray-900 placeholder-gray-400 bg-white"
                                    value={newWorkerJob}
                                    onChange={(e) => setNewWorkerJob(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usia (Thn)</label>
                                <input 
                                    type="number" 
                                    placeholder="45" 
                                    // FIX: Menambahkan text-gray-900 dan placeholder-gray-400
                                    className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-gray-900 placeholder-gray-400 bg-white"
                                    value={newWorkerAge}
                                    onChange={(e) => setNewWorkerAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                    min="18"
                                    max="80"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition shadow-md flex justify-center items-center gap-2"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Simpan Data Pekerja
                        </button>
                    </form>
                </div>
            </div>

            {/* BAGIAN 3: Tabel Data Gabungan */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-500" /> Direktori Pekerja & Status Alat
                    </h3>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pekerja</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jabatan/Usia</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Koneksi</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Detail Alat</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {workerData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                        Belum ada data pekerja. Silakan tambahkan pekerja baru.
                                    </td>
                                </tr>
                            ) : (
                                workerData.map(w => {
                                    const device = w.deviceId ? deviceMap[w.deviceId] : null;
                                    return (
                                        <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                        {w.nama.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{w.nama}</div>
                                                        <div className="text-xs text-gray-500">ID: {w.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{w.pekerjaan}</div>
                                                <div className="text-xs text-gray-500">{w.usia} Tahun</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {w.isPaired ? (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                        Aktif Terhubung
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                                        Tidak Ada Alat
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {device ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-700">{device.id}</span>
                                                        <span className={`text-xs ${device.battery < 20 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                                                            Bat: {device.battery.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {w.isPaired ? (
                                                    <button 
                                                        onClick={() => handleUnpairDevice(w.id, w.deviceId!)}
                                                        className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-md transition border border-orange-200"
                                                    >
                                                        Putus Koneksi
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleDeleteWorker(w.id)}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-full transition"
                                                        title="Hapus Data Pekerja"
                                                    >
                                                        <Trash className="w-4 h-4"/>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};