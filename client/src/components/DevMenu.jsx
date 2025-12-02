// src/components/DevMenu.jsx
import React from 'react';
import { Cloud, Zap, Sun, CloudRain, CloudSnow, Wind, BellRing, RefreshCw } from 'lucide-react'; // Added RefreshCw

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Thunderstorm', 'Windy'];

// CHANGED: Added onForceRefresh prop
export default function DevMenu({ onSetWeather, onTriggerAlarm, currentWeather, onForceRefresh }) {
  return (
    <div className="min-h-screen pt-12 pb-24 px-4 bg-black text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">Developer Tools</h1>
      <p className="text-ios-text-gray mb-8">Test your configurations.</p>

      {/* 1. Actions */}
      <div className="w-full max-w-sm mb-10 space-y-3">
        <h2 className="text-xl font-semibold mb-4 text-left">Actions</h2>
        
        <button
          onClick={onTriggerAlarm}
          className="w-full flex items-center justify-center space-x-2 py-4 bg-ios-red/20 text-ios-red rounded-xl border border-ios-red/50 hover:bg-ios-red/30 transition-all active:scale-95"
        >
          <BellRing size={24} />
          <span className="font-bold">TRIGGER ALARM NOW</span>
        </button>

        {/* NEW BUTTON: Force Weather Refresh */}
        <button
          onClick={onForceRefresh}
          className="w-full flex items-center justify-center space-x-2 py-4 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/50 hover:bg-blue-500/30 transition-all active:scale-95"
        >
          <RefreshCw size={24} />
          <span className="font-bold">FORCE WEATHER API CALL</span>
        </button>
      </div>

      {/* 2. Weather Overrides */}
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-left">Override Weather</h2>
        <div className="grid grid-cols-2 gap-3">
            {WEATHER_OPTIONS.map(weather => (
                <button
                    key={weather}
                    onClick={() => onSetWeather(weather)}
                    className={`
                        py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2
                        ${currentWeather === weather 
                            ? 'bg-ios-accent text-white shadow-lg shadow-blue-500/20' 
                            : 'bg-ios-gray/50 text-ios-text-gray hover:bg-ios-gray'}
                    `}
                >
                    <span>{weather}</span>
                </button>
            ))}
        </div>
        
        <button
            onClick={() => onSetWeather(null)} // Null means fetch from API
            className={`w-full mt-4 py-3 rounded-xl font-medium border border-white/10 ${!currentWeather ? 'bg-white/10 text-white' : 'text-ios-text-gray'}`}
        >
            Reset to Real API
        </button>
      </div>
    </div>
  );
}
