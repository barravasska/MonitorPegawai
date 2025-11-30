// app/page.tsx

// Ini adalah komponen sisi client karena menggunakan state, effect, dan handler
"use client";

import React from 'react';
import App from '../src/App'; // Impor komponen Controller Utama

/**
 * Komponen Page utama (Entry Point).
 * Ini adalah satu-satunya rute yang kita butuhkan, 
 * karena navigasi Dashboard/Management dikontrol oleh state di dalam komponen App.
 */
const MainPage: React.FC = () => {
    return (
        // Render komponen App yang merupakan Controller utama sistem SMART-G
        <App />
    );
};

export default MainPage;