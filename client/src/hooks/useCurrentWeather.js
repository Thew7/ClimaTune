// src/hooks/useCurrentWeather.js
import { useState, useEffect, useRef } from 'react';

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

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        // 1. Check Cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const { condition, timestamp } = JSON.parse(cachedData);
            const age = Date.now() - timestamp;
            
            if (age < CACHE_DURATION) {
                console.log("Using cached weather data");
                setWeather(condition);
                setLoading(false);
                return; // Exit early using cache
            }
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported');
            setLoading(false);
            return;
        }

        const fetchWeather = async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );

                if (!response.ok) throw new Error('Failed to fetch weather');

                const data = await response.json();
                const mainCondition = data.weather[0]?.main;
                const mappedCondition = mapWeatherCondition(mainCondition);

                // 2. Save to Cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    condition: mappedCondition,
                    timestamp: Date.now()
                }));

                setWeather(mappedCondition);
            } catch (err) {
                console.error("Weather API Error:", err);
                setError(err.message);
                setWeather('Cloudy'); 
            } finally {
                setLoading(false);
            }
        };

        const handleError = (err) => {
            console.error("Geolocation Error:", err);
            setError('Location denied');
            setWeather('Cloudy'); 
            setLoading(false);
        };

        navigator.geolocation.getCurrentPosition(fetchWeather, handleError);

    }, []);

    return { weather, loading, error };
}