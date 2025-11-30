// src/components/ConfirmationModal.tsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    type?: 'danger' | 'warning' | 'info'; // ← Tambahkan ini (opsional dengan default 'danger')
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen,
    type = 'danger', // ← Default value
    title, 
    message, 
    onConfirm, 
    onCancel 
}) => {
    if (!isOpen) return null;

    // Styling berdasarkan type
    const typeStyles = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonBg: 'bg-red-600 hover:bg-red-700',
            buttonRing: 'focus-visible:ring-red-500'
        },
        warning: {
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
            buttonRing: 'focus-visible:ring-yellow-500'
        },
        info: {
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
            buttonRing: 'focus-visible:ring-blue-500'
        }
    };

    const style = typeStyles[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-[400px] bg-white p-6 shadow-lg rounded-xl animate-in zoom-in-95 slide-in-from-bottom-2 border border-gray-100">
                
                {/* Close Button */}
                <button 
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Icon Wrapper - Styling dinamis */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${style.iconBg}`}>
                        <AlertTriangle className={`h-6 w-6 ${style.iconColor}`} />
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                        {/* Title */}
                        <h3 className="text-lg font-semibold leading-none tracking-tight text-gray-900">
                            {title}
                        </h3>
                        {/* Description */}
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 ring-offset-white transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${style.buttonBg} ${style.buttonRing}`}
                    >
                        Ya, Hapus Permanen
                    </button>
                </div>
            </div>
        </div>
    );
};