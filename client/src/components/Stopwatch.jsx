// src/components/Stopwatch.jsx
import React, { useState, useRef, useEffect } from 'react';

export default function Stopwatch() {
    const [isRunning, setIsRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0); 
    const [laps, setLaps] = useState([]); 
    const timerRef = useRef(null); 
    const startTimeRef = useRef(0); 
    const lapTimeRef = useRef(0); 

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10); 
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        const mainDisplay = minutes > 0 ? `${formattedMinutes}:${formattedSeconds}` : `${seconds}`;
        const subDisplay = String(milliseconds).padStart(2, '0');
        return { mainDisplay, subDisplay, fullTime: ms };
    };

    useEffect(() => {
        if (isRunning) {
            startTimeRef.current = Date.now() - timeElapsed;
            timerRef.current = setInterval(() => { setTimeElapsed(Date.now() - startTimeRef.current); }, 10);
        } else { clearInterval(timerRef.current); }
        return () => clearInterval(timerRef.current);
    }, [isRunning, timeElapsed]); 

    const handleStartPause = () => { setIsRunning(prev => !prev); };

    const handleLapOrReset = () => {
        if (isRunning) {
            const currentLapTime = timeElapsed - lapTimeRef.current;
            setLaps(prevLaps => [{ id: prevLaps.length + 1, time: currentLapTime, totalTime: timeElapsed }, ...prevLaps]);
            lapTimeRef.current = timeElapsed; 
        } else {
            setTimeElapsed(0);
            setLaps([]);
            lapTimeRef.current = 0;
            startTimeRef.current = 0;
        }
    };
    
    const { mainDisplay, subDisplay } = formatTime(timeElapsed);
    const lapButtonColor = timeElapsed > 0 ? 'bg-ios-gray/30 text-white' : 'bg-ios-gray/10 text-ios-gray/40';
    const startPauseColor = isRunning ? 'bg-red-700/20 text-red-400 border border-red-900' : 'bg-green-700/20 text-green-400 border border-green-900';
    const lapButtonText = isRunning ? 'Lap' : 'Reset';

    return (
        <div className="flex flex-col items-center min-h-screen bg-black text-white p-4">
            <h1 className="text-[100px] font-thin tracking-tighter mt-20 mb-16 text-white">
                <span className="text-9xl">{mainDisplay}</span>
                <span className="text-6xl text-ios-accent">.{subDisplay}</span>
            </h1>

            <div className="flex justify-between w-full max-w-xs mb-10"> 
                <button
                    onClick={handleLapOrReset}
                    className={`w-24 h-24 rounded-full flex items-center justify-center ${lapButtonColor} font-semibold text-lg transition-colors duration-150 ease-in-out`}
                    disabled={timeElapsed === 0 && !isRunning}
                >
                    {lapButtonText}
                </button>
                <button
                    onClick={handleStartPause}
                    className={`w-24 h-24 rounded-full flex items-center justify-center ${startPauseColor} text-xl font-semibold transition-colors duration-150 ease-in-out`}
                >
                    {isRunning ? 'Stop' : 'Start'}
                </button>
            </div>

            {laps.length > 0 && (
                <div className="w-full max-w-sm border-t border-white/20 mt-4 pb-24">
                    {laps.map((lap, index) => {
                        const lapNumber = laps.length - index;
                        const { mainDisplay: lapDisplay, subDisplay: lapSub } = formatTime(lap.time);
                        const lapTimes = laps.map(l => l.time);
                        const minTime = Math.min(...lapTimes);
                        const maxTime = Math.max(...lapTimes);
                        let lapColor = 'text-white';
                        if (lap.time === minTime && laps.length > 1) lapColor = 'text-green-500'; 
                        else if (lap.time === maxTime && laps.length > 1) lapColor = 'text-red-500'; 
                        
                        return (
                            <div key={lap.id} className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-lg text-white/80">Lap {lapNumber}</span>
                                <span className={`text-lg font-mono ${lapColor}`}>
                                    {lapDisplay}.{lapSub}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
            <div className='pb-24'></div> 
        </div>
    );
}