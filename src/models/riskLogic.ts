// src/models/riskLogic.ts
import { RiskStatus, SensorData } from './types';

export const RISK_STATUS: { [key: string]: RiskStatus } = {
    AMAN: 'Aman',
    WASAPADA: 'Waspada',
    BAHAYA: 'Bahaya',
};

export const THRESHOLDS = {
    GSR_CRITICAL: 180, 
    GSR_WARNING: 150,  
    IMU_CRITICAL: 1.2, 
    IMU_WARNING: 0.9,  
    SPO2_CRITICAL: 93, 
    SPO2_WARNING: 97,  
};
export const generateRandomSensorData = (status: RiskStatus = RISK_STATUS.AMAN): SensorData => {
    let gsr: number, imu: number, spo2: number;

    switch (status) {
        case RISK_STATUS.BAHAYA:
            gsr = (Math.random() * 20) + 180; 
            imu = (Math.random() * 0.4) + 1.2; 
            spo2 = (Math.random() * 2) + 90; 
            break;
        case RISK_STATUS.WASAPADA:
            gsr = (Math.random() * 30) + 150; 
            imu = (Math.random() * 0.3) + 0.9; 
            spo2 = (Math.random() * 4) + 93; 
            break;
        case RISK_STATUS.AMAN:
        default:
            gsr = (Math.random() * 50) + 100; 
            imu = (Math.random() * 0.5) + 0.4; 
            spo2 = (Math.random() * 3) + 97; 
            break;
    }

    return {
        gsr: parseFloat(gsr.toFixed(2)),
        imu: parseFloat(imu.toFixed(2)),
        spo2: parseFloat(spo2.toFixed(2)),
        timestamp: new Date().toLocaleTimeString('id-ID'),
    };
};

/**
 * [MODEL] Menentukan status risiko berdasarkan nilai sensor (Flowchart Logic).
 */
export const determineRiskStatus = (gsr: number, imu: number, spo2: number): RiskStatus => {
    const { GSR_CRITICAL, GSR_WARNING, IMU_CRITICAL, IMU_WARNING, SPO2_CRITICAL, SPO2_WARNING } = THRESHOLDS;

    // Bahaya Kritis (MERAH)
    if (gsr > GSR_CRITICAL || imu > IMU_CRITICAL || spo2 < SPO2_CRITICAL) {
        return RISK_STATUS.BAHAYA;
    }

    // Waspada (KUNING)
    if (gsr > GSR_WARNING || imu > IMU_WARNING || spo2 < SPO2_WARNING) {
        return RISK_STATUS.WASAPADA;
    }

    return RISK_STATUS.AMAN;
};

/**
 * [MODEL] Mendapatkan pemicu utama risiko.
 */
export const getPrimaryTrigger = (sensors: SensorData): string => {
    const { gsr, imu, spo2 } = sensors;
    const { GSR_CRITICAL, IMU_CRITICAL, SPO2_CRITICAL } = THRESHOLDS;

    if (gsr > GSR_CRITICAL) return 'Dehidrasi Tinggi (GSR)';
    if (imu > IMU_CRITICAL) return 'Tremor Ekstrem (IMU)';
    if (spo2 < SPO2_CRITICAL) return 'Oksigen Rendah (SpO2)';

    return 'Kelelahan Umum';
};

// Data awal simulasi
export const initialWorkersData = [
    { id: 'W001', nama: 'Bapak Rudi (61)', usia: 61, pekerjaan: 'Tukang Besi', initialStatus: RISK_STATUS.BAHAYA, deviceId: 'SGT-001A', isPaired: true },
    { id: 'W002', nama: 'Bapak Agung (55)', usia: 55, pekerjaan: 'Mandor', initialStatus: RISK_STATUS.WASAPADA, deviceId: 'SGT-002B', isPaired: true },
    { id: 'W003', nama: 'Pak Budi (65)', usia: 65, pekerjaan: 'Tukang Cat', initialStatus: RISK_STATUS.AMAN, deviceId: 'SGT-003C', isPaired: true },
    { id: 'W004', nama: 'Mas Taufiq (32)', usia: 32, pekerjaan: 'Kabel Listrik', initialStatus: RISK_STATUS.AMAN, deviceId: 'SGT-004D', isPaired: true },
    { id: 'W005', nama: 'Bapak Jaya (58)', usia: 58, pekerjaan: 'Tukang Kayu', initialStatus: RISK_STATUS.AMAN, deviceId: 'SGT-005E', isPaired: true },
    { id: 'W006', nama: 'Cadangan A', usia: 40, pekerjaan: 'Cadangan', initialStatus: RISK_STATUS.AMAN, deviceId: null, isPaired: false },
];

export const initialDevices = [
    { id: 'SGT-001A', status: 'Aktif', battery: 85 },
    { id: 'SGT-002B', status: 'Aktif', battery: 78 },
    { id: 'SGT-003C', status: 'Aktif', battery: 92 },
    { id: 'SGT-004D', status: 'Aktif', battery: 65 },
    { id: 'SGT-005E', status: 'Aktif', battery: 99 },
    { id: 'SGT-006F', status: 'Maintenance', battery: 100 },
    { id: 'SGT-007G', status: 'Non-aktif', battery: 50 },
];