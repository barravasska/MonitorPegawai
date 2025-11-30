import { supabase } from '../lib/supabaseClient';
import { Worker, Device, RiskStatus } from '../models/types';

// --- SERVICE WORKER ---

export const fetchWorkers = async (): Promise<Worker[]> => {
    const { data, error } = await supabase
        .from('workers')
        .select('*');
    
    if (error) {
        console.error('Error fetching workers:', error);
        return [];
    }

    // Mapping dari DB (snake_case) ke App (camelCase)
    // Sensor & Status di-init default karena belum ada hardware
    return data.map((w: any) => ({
        id: w.id,
        nama: w.nama,
        usia: w.usia,
        pekerjaan: w.pekerjaan,
        deviceId: w.device_id,
        isPaired: w.is_paired,
        initialStatus: 'Aman' as RiskStatus,
        status: 'Aman' as RiskStatus,
        sensors: { gsr: 0, imu: 0, spo2: 0, timestamp: '' }
    }));
};

export const addWorkerToDB = async (worker: { nama: string, pekerjaan: string, usia: number }) => {
    // Generate ID sederhana (W + timestamp) untuk unik
    const id = `W${Date.now().toString().slice(-4)}`;
    
    const { data, error } = await supabase
        .from('workers')
        .insert([{
            id,
            nama: worker.nama,
            pekerjaan: worker.pekerjaan,
            usia: worker.usia,
            is_paired: false
        }])
        .select();

    if (error) throw error;
    return data?.[0];
};

export const deleteWorkerFromDB = async (id: string) => {
    const { error } = await supabase.from('workers').delete().eq('id', id);
    if (error) throw error;
};

// --- SERVICE DEVICE ---

export const fetchDevices = async (): Promise<Device[]> => {
    const { data, error } = await supabase.from('devices').select('*');
    if (error) return [];
    
    return data.map((d: any) => ({
        id: d.id,
        status: d.status,
        battery: d.battery
    }));
};

export const registerDeviceToDB = async (deviceId: string) => {
    const { data, error } = await supabase
        .from('devices')
        .insert([{ id: deviceId, status: 'Aktif', battery: 100 }])
        .select();
    
    if (error) throw error;
    return data?.[0];
};

// --- SERVICE PAIRING (Update Worker & Device) ---

export const pairDeviceInDB = async (workerId: string, deviceId: string) => {
    // 1. Update Worker
    const { error: wError } = await supabase
        .from('workers')
        .update({ device_id: deviceId, is_paired: true })
        .eq('id', workerId);
    
    if (wError) throw wError;

    // 2. Update Device Status
    await supabase.from('devices').update({ status: 'Aktif' }).eq('id', deviceId);
};

export const unpairDeviceInDB = async (workerId: string, deviceId: string) => {
    // 1. Update Worker
    const { error: wError } = await supabase
        .from('workers')
        .update({ device_id: null, is_paired: false })
        .eq('id', workerId);

    if (wError) throw wError;

    // 2. Update Device Status
    await supabase.from('devices').update({ status: 'Non-aktif' }).eq('id', deviceId);
};