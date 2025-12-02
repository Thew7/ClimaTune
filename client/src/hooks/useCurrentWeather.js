// src/hooks/useCurrentWeather.js
import { useState, useEffect, useCallback, useRef } from 'react';

const API_KEY = '8f1109f6f97e43c44a2ec57ec9212c1e';
const CACHE_KEY = 'weatherCache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 Minutes in milliseconds

const mapWeatherCondition = (apiCondition) => {
    if (!apiCondition) return 'Cloudy'; 
    const condition = apiCondition.toLowerCase();
    
    if (condition.includes('clear')) return 'Sunny';
    if (condition.includes('cloud')) return 'Cloudy';
    if (condition.includes('rain') || condition.includes('drizzle')) return 'Rainy';
    if (condition.includes('snow')) return 'Snowy';
    if (condition.includes('thunder')) return 'Thunderstorm';
    if (condition.includes('wind') || condition.includes('mist') || condition.includes('fog')) return 'Windy';
    return 'Cloudy'; 
};

export function useCurrentWeather() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasFetched = useRef(false);

    // Added options to getCurrentPosition for reliability/debugging
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 5000, // 5 seconds to get a location
        maximumAge: 0 // Do not use a cached position
    };

    // Wrapped in useCallback to allow manual triggering
    const fetchWeather = useCallback((bypassCache = false) => {
        setLoading(true);

        // 1. Check Cache (only if NOT bypassing)
        if (!bypassCache) {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const { condition, timestamp } = JSON.parse(cachedData);
                const age = Date.now() - timestamp;
                
                if (age < CACHE_DURATION) {
                    console.log("Using cached weather data. Age (ms):", age);
                    setWeather(condition);
                    setLoading(false);
                    return; // Exit early using cache
                }
            }
        } else {
            console.log("Forcing Weather Refresh: Bypassing Cache...");
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported');
            setLoading(false);
            return;
        }

        // START GEOLOCATION REQUEST
        console.log('Attempting to retrieve geolocation...');
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            // SUCCESS: Now we make the OpenWeatherMap API call.
            try {
                const { latitude, longitude } = position.coords;
                
                // CRITICAL: This is the call that shows up in the Network tab.
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&_t=${Date.now()}`
                );

                if (!response.ok) throw new Error('Failed to fetch weather');

                const data = await response.json();
                console.log("✅ Weather API Call Successful:", data); // Proof of call

                const mainCondition = data.weather[0]?.main;
                const mappedCondition = mapWeatherCondition(mainCondition);

                // 2. Save to Cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    condition: mappedCondition,
                    timestamp: Date.now()
                }));

                setWeather(mappedCondition);
                setError(null);
            } catch (err) {
                console.error("❌ Weather API Error:", err);
                setError(err.message);
                if (!weather) setWeather('Cloudy'); 
            } finally {
                setLoading(false);
            }
        }, (err) => {
            // FAILURE: This runs if Geolocation is denied or times out.
            console.error("❌ Geolocation Error Code:", err.code, "Message:", err.message);
            
            let message = 'Geolocation failed.';
            if (err.code === 1) {
                 message = 'Location access denied by user. Cannot fetch live weather.';
            } else if (err.code === 3) {
                 message = 'Geolocation timed out.';
            }
            
            setError(message);
            setWeather('Cloudy'); 
            setLoading(false);
        }, geoOptions); // Pass the options object
    }, [weather]);

    // Initial Fetch (Run once on mount)
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchWeather(false); // Default: Use cache
    }, [fetchWeather]);

    return { 
        weather, 
        loading, 
        error, 
        refetch: () => fetchWeather(true) // Expose function to force refresh
    };
}
