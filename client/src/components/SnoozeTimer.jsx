// src/components/SnoozeTimer.jsx
import React, { useState, useEffect } from 'react';
import { BellRing } from 'lucide-react';

export default function SnoozeTimer({ targetTime, onCancel, onComplete }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const diff = targetTime - now;

            if (diff <= 0) {
                // Time is up
                setTimeLeft('00:00');
                clearInterval(interval);
                // CHANGED: Explicitly tell App.jsx the timer is finished
                if(onComplete) onComplete();
            } else {
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 500); // Check faster to catch 0 closer to the edge

        return () => clearInterval(interval);
    }, [targetTime, onComplete]);

    if (!targetTime) return null;

    return (
        <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 bg-ios-gray/90 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center space-x-4 min-w-[200px] justify-between">
            <div className="flex items-center space-x-3">
                <BellRing size={20} className="text-ios-accent animate-pulse" />
                <div className="flex flex-col">
                    <span className="text-xs text-ios-text-gray uppercase font-bold">Snoozing</span>
                    <span className="text-xl font-mono font-medium text-white">{timeLeft}</span>
                </div>
            </div>
            {onCancel && (
                <button 
                    onClick={onCancel}
                    className="text-xs font-bold text-ios-red bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors"
                >
                    Cancel
                </button>
            )}
        </div>
    );
}