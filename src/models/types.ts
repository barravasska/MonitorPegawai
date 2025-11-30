// Definisi Status Risiko
export type RiskStatus = 'Aman' | 'Waspada' | 'Bahaya';
export const __TEST__ = true;
// Struktur data sensor real-time
export interface SensorData {
    gsr: number; // Galvanic Skin Response (Dehidrasi/Stres)
    imu: number; // Inertial Measurement Unit (Tremor/Kestabilan)
    spo2: number; // Saturasi Oksigen
    timestamp: string;
}

// Struktur data Perangkat Gelang
export interface Device {
    id: string;
    status: 'Aktif' | 'Non-aktif' | 'Maintenance';
    battery: number; // Persentase baterai
}

// Struktur data Pekerja
export interface Worker {
    id: string;
    nama: string;
    usia: number;
    pekerjaan: string;
    deviceId: string | null;
    isPaired: boolean;
    initialStatus: RiskStatus;
    // Data yang diperbarui secara real-time
    sensors: SensorData;
    status: RiskStatus;
}

// Struktur data Log Peringatan (sesuai Flowchart)
export interface AlertLogEntry {
    id: number;
    workerId: string;
    deviceId: string | null;
    timestamp: string;
    pemicu: string;
    tingkatBahaya: RiskStatus;
    aksi: string;
}