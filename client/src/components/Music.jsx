// src/components/Music.jsx

import React, { useState, useEffect, useRef } from 'react'; 
import { PlayCircle, Sun, Cloud, CloudRain, CloudSnow, Zap, Wind } from 'lucide-react'; 

const PLAYLIST_ENDPOINT = 'https://api.spotify.com/v1/me/playlists'; 
const PLAYLIST_MAPPING_KEY = 'weatherPlaylistMapping'; 
const NONE_PLAYLIST_ID = 'NONE'; 

// CHANGED: Added specific colors for icons
const WEATHER_TYPES = [
    { name: 'Sunny', icon: Sun, key: 'Sunny', color: 'text-yellow-400' },
    { name: 'Cloudy', icon: Cloud, key: 'Cloudy', color: 'text-gray-400' },
    { name: 'Rainy', icon: CloudRain, key: 'Rainy', color: 'text-blue-400' },
    { name: 'Snowy', icon: CloudSnow, key: 'Snowy', color: 'text-white' },
    { name: 'Thunderstorm', icon: Zap, key: 'Thunderstorm', color: 'text-yellow-500' },
    { name: 'Windy', icon: Wind, key: 'Windy', color: 'text-teal-300' },
];

const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const pkceChallengeFromVerifier = async (v) => {
    const hashed = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
    return btoa(String.fromCharCode(...new Uint8Array(hashed)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

const Music = ({ activeTab, token }) => {
    if (activeTab !== 'Music') return null;
    
    const CLIENT_ID = 'a887e836c9bf4bf1a5ce6f2cb037c865'; 
    const REDIRECT_URI = 'http://127.0.0.1:5173'; 
    const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'; 
    const RESPONSE_TYPE = 'code'; 
    const SCOPE = 'playlist-read-private user-read-playback-state user-modify-playback-state'; 

    const [playlists, setPlaylists] = useState([]);
    const [playlistMapping, setPlaylistMapping] = useState(() => {
        const savedMapping = localStorage.getItem(PLAYLIST_MAPPING_KEY);
        return savedMapping ? JSON.parse(savedMapping) : {};
    });

    const hasFetchedPlaylists = useRef(false);

    const handleLogin = async () => {
        const codeVerifier = generateRandomString(96); 
        const codeChallenge = await pkceChallengeFromVerifier(codeVerifier);
        localStorage.setItem('spotifyCodeVerifier', codeVerifier);
        const url = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
        window.location.href = url;
    };

    useEffect(() => {
        if (token && !hasFetchedPlaylists.current) {
            hasFetchedPlaylists.current = true; 
            fetch(PLAYLIST_ENDPOINT, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if (!res.ok) {
                    localStorage.removeItem('spotifyAccessToken');
                    window.location.reload(); 
                    return { items: [] }; 
                }
                return res.json();
            })
            .then(data => setPlaylists(data.items || []))
            .catch(error => console.error("Error fetching playlists:", error));
        }
    }, [token]);

    const handleMappingChange = (weatherKey, playlistId) => {
        setPlaylistMapping(prev => ({ ...prev, [weatherKey]: playlistId }));
    };

    const handleSaveMapping = () => {
        localStorage.setItem(PLAYLIST_MAPPING_KEY, JSON.stringify(playlistMapping));
        alert('Playlist mapping saved successfully!');
    };

    if (token) {
        return (
            <div className="min-h-screen pt-12 pb-24 px-4 bg-black text-white">
                <h1 className="text-3xl font-bold mb-4 text-center">Weather Playlist Mapping</h1>
                <p className="text-md text-ios-text-gray mb-8 text-center">
                    Link a Spotify playlist to each weather condition.
                </p>

                <div className="space-y-4 max-w-xl mx-auto">
                    {WEATHER_TYPES.map(({ name, icon: Icon, key, color }) => (
                        <div key={key} className="flex justify-between items-center px-4 py-3 bg-ios-gray/50 rounded-xl">
                            <div className="flex items-center space-x-3">
                                {/* CHANGED: Using specific colors */}
                                <Icon size={24} className={color} />
                                <span className="text-lg text-white">{name}</span>
                            </div>
                            
                            <select
                                value={playlistMapping[key] || NONE_PLAYLIST_ID}
                                onChange={(e) => handleMappingChange(key, e.target.value)}
                                className="bg-transparent text-right text-ios-accent text-lg border-none focus:ring-0 p-0 w-1/2 appearance-none cursor-pointer outline-none"
                            >
                                <option value={NONE_PLAYLIST_ID} className="bg-ios-gray text-white">None</option>
                                {playlists.map(playlist => (
                                    <option key={playlist.id} value={playlist.uri} className="bg-ios-gray text-white">
                                        {playlist.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                <div className="mt-10 max-w-xl mx-auto space-y-4">
                    <button
                        onClick={handleSaveMapping}
                        className="w-full py-3 bg-ios-accent text-white rounded-xl hover:bg-ios-accent/80 transition-colors font-semibold shadow-lg shadow-blue-900/10"
                    >
                        Save Mapping
                    </button>
                    
                    <button
                        onClick={() => { 
                            localStorage.removeItem('spotifyAccessToken'); 
                            localStorage.removeItem('spotifyCodeVerifier'); 
                            window.location.reload(); 
                        }}
                        className="w-full py-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600/30 transition-colors font-semibold"
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center pt-20 pb-24 px-4 bg-black text-white">
            <h1 className="text-4xl font-bold mb-10">Music Playback</h1>
            <div className="w-full max-w-sm bg-ios-gray/30 p-6 rounded-xl shadow-lg text-center backdrop-blur-sm border border-white/5">
                <p className="text-lg text-ios-text-gray mb-6">Link your Spotify account to enable music features.</p>
                <button
                    onClick={handleLogin}
                    className="w-full py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors"
                >
                    Log in with Spotify
                </button>
            </div>
        </div>
    );
};

export default Music;