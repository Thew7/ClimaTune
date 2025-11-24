// src/components/RingingScreen.jsx
import React, { useEffect, useRef, useState } from 'react'; 
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const PLAYBACK_ENDPOINT = 'https://api.spotify.com/v1/me/player/play'; 
const PAUSE_ENDPOINT = 'https://api.spotify.com/v1/me/player/pause'; 
const PLAYLIST_MAPPING_KEY = 'weatherPlaylistMapping'; 
const NONE_PLAYLIST_ID = 'NONE';

const WeatherBackground = ({ weather }) => {
    if (weather === 'Sunny') {
        return (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="h-[500px] w-[500px] rounded-full bg-yellow-500/30 blur-3xl absolute"
                />
            </div>
        );
    }
    if (weather === 'Rainy') {
        return (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-blue-900/40">
                <motion.div 
                    animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-3xl absolute"
                />
            </div>
        );
    }
    // Default / Cloudy
    return (
         <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="h-96 w-96 rounded-full bg-ios-accent/30 blur-2xl absolute"
            />
        </div>
    );
};

export default function RingingScreen({ alarm, onStop, onSnooze, currentWeather, spotifyToken }) { 
    const hasTriggeredPlayback = useRef(false);
    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const playMusic = async () => {
        if (!spotifyToken || !currentWeather) return;
        const mappingString = localStorage.getItem(PLAYLIST_MAPPING_KEY);
        const playlistMapping = mappingString ? JSON.parse(mappingString) : {};
        const playlistURI = playlistMapping[currentWeather];
        if (!playlistURI || playlistURI === NONE_PLAYLIST_ID) return;
        
        try {
            await fetch(PLAYBACK_ENDPOINT, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${spotifyToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ context_uri: playlistURI, offset: { position: 0 }, position_ms: 0 }),
            });
        } catch (error) { console.error("Error playing music:", error); }
    };

    const pauseMusic = async () => {
        if (!spotifyToken) return;
        try {
             await fetch(PAUSE_ENDPOINT, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${spotifyToken}`, 'Content-Type': 'application/json' },
            });
        } catch (error) { console.error("Error pausing music:", error); }
    };
    
    useEffect(() => {
        if (hasTriggeredPlayback.current) return;
        if (currentWeather && spotifyToken) {
            hasTriggeredPlayback.current = true;
            playMusic();
        }
    }, [currentWeather, spotifyToken]); 

    const handleStopClick = () => { pauseMusic(); onStop(alarm); };
    const handleSnoozeClick = () => { pauseMusic(); onSnooze(alarm); };

    // CHANGED: Live clock with AM/PM
    const formattedTime = clock.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black pt-32 pb-16">
            <WeatherBackground weather={currentWeather} />

            <div className="z-10 flex flex-col items-center space-y-4">
                {/* CHANGED: Removed duplicate clock, now showing BIG Live Clock */}
                <div className="text-center">
                    <p className="text-7xl font-light text-white tracking-tighter">{formattedTime}</p>
                    {/* Kept "Alarm" label, changed label color */}
                    <p className="text-xl uppercase tracking-widest text-ios-accent mt-2 font-bold">Alarm</p>
                    <p className="text-lg text-white/70 mt-1">{alarm?.label}</p>
                </div>
            </div>

            <div className="z-10 flex w-full flex-col gap-5 px-8 max-w-md mb-8">
                {alarm?.snoozeEnabled && (
                    <button 
                        onClick={handleSnoozeClick}
                        className="w-full rounded-full bg-ios-gray/80 backdrop-blur-md py-4 text-xl font-semibold text-ios-accent active:bg-white/20 transition-all"
                    >
                        Snooze
                    </button>
                )}
                
                <button
                    onClick={handleStopClick}
                    className="w-full rounded-full bg-ios-red py-4 text-xl font-semibold text-white active:bg-red-700 shadow-lg shadow-red-900/20 transition-all"
                >
                    Stop
                </button>
            </div>
        </div>
    );
}