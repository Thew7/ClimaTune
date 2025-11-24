// src/components/Timer.jsx
import { useState, useEffect, useRef, useMemo } from 'react';

// Spotify Helpers
const PLAYBACK_ENDPOINT = 'https://api.spotify.com/v1/me/player/play'; 
const PLAYLIST_MAPPING_KEY = 'weatherPlaylistMapping'; 
const NONE_PLAYLIST_ID = 'NONE';

function formatTimer(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const formatPickerLabel = (val) => val.toString().padStart(2, '0');

const DropdownTimeSelector = ({ type, value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const componentRef = useRef(null);
    const labelText = type === 'hour' ? 'hr' : type === 'minute' ? 'min' : 'sec';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (componentRef.current && !componentRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => { onChange(option); setIsOpen(false); };

    return (
        <div ref={componentRef} className="relative w-1/3 text-center z-10">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-ios-accent text-4xl font-light py-2 appearance-none cursor-pointer focus:outline-none">{formatPickerLabel(value)}</button>
            <span className="text-white/60 text-base mt-[-4px] block">{labelText}</span>
            {isOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-32 max-h-60 overflow-y-auto bg-gray-700/90 backdrop-blur-sm rounded-lg shadow-xl z-20 border border-gray-600 hide-scrollbar">
                    {options.map((option) => (
                        <div key={option} onClick={() => handleSelect(option)} className={`py-2 px-4 text-white text-lg cursor-pointer transition-colors duration-75 ${option === value ? 'bg-ios-accent/30 font-bold' : 'hover:bg-gray-600/50'}`}>
                            {formatPickerLabel(option)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// CHANGED: Added props for music
function Timer({ spotifyToken, weather }) {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    // CHANGED: Default 30s
    const [seconds, setSeconds] = useState(30); 
    
    const initialTotal = useMemo(() => (hours * 3600) + (minutes * 60) + seconds, [hours, minutes, seconds]);
    const [totalSeconds, setTotalSeconds] = useState(initialTotal); 
    const [isActive, setIsActive] = useState(false);
    const [isPickerVisible, setIsPickerVisible] = useState(true);
    
    const intervalRef = useRef(null);
    const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []); 
    const minuteSecondOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []); 

    // Music Logic
    const playMusic = async () => {
        if (!spotifyToken || !weather) return;
        const mappingString = localStorage.getItem(PLAYLIST_MAPPING_KEY);
        const playlistMapping = mappingString ? JSON.parse(mappingString) : {};
        const playlistURI = playlistMapping[weather];
        if (!playlistURI || playlistURI === NONE_PLAYLIST_ID) return;
        try {
            await fetch(PLAYBACK_ENDPOINT, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${spotifyToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ context_uri: playlistURI, offset: { position: 0 }, position_ms: 0 }),
            });
        } catch (error) { console.error("Timer Music Error:", error); }
    };

    useEffect(() => {
        if (isActive && totalSeconds > 0) {
            intervalRef.current = setInterval(() => setTotalSeconds(prev => prev - 1), 1000);
        } else if (totalSeconds === 0 && isActive) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            // CHANGED: Trigger Spotify instead of Audio
            playMusic();
        }
        return () => clearInterval(intervalRef.current);
    }, [isActive, totalSeconds]);

    const handleStartPause = () => {
        if (initialTotal === 0 && isPickerVisible) return; 
        if (isActive) { setIsActive(false); } 
        else {
            if (isPickerVisible) { setTotalSeconds(initialTotal); setIsPickerVisible(false); }
            setIsActive(true);
        }
    };

    const handleCancel = () => {
        clearInterval(intervalRef.current);
        setIsActive(false);
        setIsPickerVisible(true);
        setTotalSeconds(initialTotal); 
    };
    
    const isTimerEnded = totalSeconds === 0 && !isPickerVisible && !isActive;
    const startPauseColor = isActive ? 'bg-red-700/20 text-red-400 border border-red-900' : 'bg-green-700/20 text-green-400 border border-green-900';
    const disableCancel = isPickerVisible && initialTotal === 0;
    const cancelButtonColor = disableCancel ? 'bg-ios-gray/10 text-ios-gray/40' : 'bg-ios-gray/30 text-white';
    const startPauseText = isTimerEnded ? 'Restart' : isActive ? 'Stop' : 'Start';
    const handleStartPauseForRender = isTimerEnded ? handleCancel : handleStartPause;

    return (
        <div className="flex flex-col items-center min-h-screen bg-black text-white p-4">
            <div className="flex flex-col items-center w-full max-w-lg mt-4 mb-10">
                {isPickerVisible ? (
                    <div className="flex justify-center items-center py-2 px-4 w-full bg-ios-gray/50 rounded-xl">
                        <DropdownTimeSelector type="hour" value={hours} onChange={setHours} options={hourOptions} />
                        <DropdownTimeSelector type="minute" value={minutes} onChange={setMinutes} options={minuteSecondOptions} />
                        <DropdownTimeSelector type="second" value={seconds} onChange={setSeconds} options={minuteSecondOptions} />
                    </div>
                ) : (
                    <div className={`text-center mt-20 mb-16 ${isTimerEnded ? 'animate-pulse' : ''}`}>
                        <div className="text-8xl font-thin tracking-tighter text-ios-accent">
                            {formatTimer(totalSeconds)}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-between w-full max-w-xs mb-10">
                <button onClick={handleCancel} className={`w-24 h-24 rounded-full flex items-center justify-center text-xl font-semibold ${cancelButtonColor} transition-colors duration-150 ease-in-out`} disabled={disableCancel}>Cancel</button>
                <button onClick={handleStartPauseForRender} disabled={isPickerVisible && initialTotal === 0} className={`w-24 h-24 rounded-full flex items-center justify-center ${startPauseColor} text-xl font-semibold transition-colors duration-150 ease-in-out`}>{startPauseText}</button>
            </div>
            <div className='pb-24'></div>
        </div>
    );
}
export default Timer;