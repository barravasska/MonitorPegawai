// src/components/StatusModal.tsx
// Style: shadcn/ui + Tailwind CSS

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';

interface StatusModalProps {
    isOpen: boolean;
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    onClose: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ isOpen, type, title, message, onClose }) => {
    if (!isOpen) return null;

    // Konfigurasi Gaya ala shadcn/ui
    let iconColor, Icon, buttonClass;

    switch (type) {
        case 'success':
            iconColor = 'text-green-600'; // Success foreground
            Icon = CheckCircle2;
            // Button variant: default (black)
            buttonClass = 'bg-slate-900 text-white hover:bg-slate-800 shadow hover:shadow-md';
            break;
        case 'error':
            iconColor = 'text-red-600'; // Destructive foreground
            Icon = XCircle;
            // Button variant: destructive (red)
            buttonClass = 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md';
            break;
        case 'warning':
            iconColor = 'text-amber-500'; // Warning foreground
            Icon = AlertTriangle;
            // Button variant: outline/secondary but emphasized
            buttonClass = 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md';
            break;
    }

    return (
        // Overlay / Backdrop (bg-background/80 backdrop-blur-sm)
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            
            {/* Modal Content (Card) */}
            <div className="relative w-full max-w-[400px] gap-4 border bg-white p-6 shadow-lg duration-200 rounded-lg sm:rounded-xl animate-in zoom-in-95 slide-in-from-bottom-2">
                
                {/* Close Button (Ghost variant) */}
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-md p-1 opacity-70 ring-offset-white transition-opacity hover:opacity-100 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <div className="flex flex-col items-center text-center sm:text-left sm:flex-row sm:items-start gap-4">
                    {/* Icon Wrapper */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 sm:mx-0 sm:h-10 sm:w-10`}>
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                    </div>

                    <div className="flex-1 space-y-2">
                        {/* Title */}
                        <h3 className="text-lg font-semibold leading-none tracking-tight text-slate-900">
                            {title}
                        </h3>
                        {/* Description */}
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <button
                        onClick={onClose}
                        className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white ${buttonClass}`}
                    >
                        {type === 'success' ? 'Selesai' : 'Tutup'}
                    </button>
                </div>
            </div>
        </div>
    );
};