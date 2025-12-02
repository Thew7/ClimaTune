// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Cloud, Sun, CloudRain, CloudSnow, Zap, Wind } from 'lucide-react';
import { useCurrentTime } from './hooks/useCurrentTime';
import { useCurrentWeather } from './hooks/useCurrentWeather'; 
import AlarmItem from './components/AlarmItem';
import AddAlarm from './components/AddAlarm';
import RingingScreen from './components/RingingScreen';
import NavBar from './components/NavBar';
import Timer from './components/Timer'; 
import Music from './components/Music'; 
import Stopwatch from './components/Stopwatch';
import SnoozeTimer from './components/SnoozeTimer'; 
import DevMenu from './components/DevMenu'; // New Component

const STORAGE_KEY = 'alarmAppAlarms';
const TOKEN_KEY = 'spotifyAccessToken';

const WeatherIcon = ({ condition }) => {
    switch (condition) {
        case 'Sunny': return <Sun size={20} className="text-yellow-400" />;
        case 'Rainy': return <CloudRain size={20} className="text-blue-400" />;
        case 'Snowy': return <CloudSnow size={20} className="text-white" />;
        case 'Thunderstorm': return <Zap size={20} className="text-yellow-400" />;
        case 'Windy': return <Wind size={20} className="text-teal-300" />;
        default: return <Cloud size={20} className="text-gray-400" />;
    }
};

const DEFAULT_ALARMS = [
  { id: 1, time: '6:30', period: 'AM', isActive: true, label: 'Wake Up', rawTime: '06:30', snoozeEnabled: true, snoozeDuration: 5 },
  { id: 2, time: '7:00', period: 'AM', isActive: false, label: 'Gym', rawTime: '07:00', snoozeEnabled: false, snoozeDuration: 0 },
  { id: 3, time: '8:15', period: 'AM', isActive: true, label: 'Work', rawTime: '08:15', snoozeEnabled: true, snoozeDuration: 5 },
];

const initializeAlarms = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_ALARMS;
  } catch (e) { return DEFAULT_ALARMS; }
};

const ALL_TABS = ['Alarms', 'Stopwatch', 'Timer', 'Music', 'Dev'];
const initializeActiveTab = () => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab && ALL_TABS.includes(savedTab) ? savedTab : 'Alarms';
};

const CLIENT_ID = 'a887e836c9bf4bf1a5ce6f2cb037c865'; 
const REDIRECT_URI = 'http://127.0.0.1:5173';
const TOKEN_PROXY_PATH = '/spotify-token'; 

export default function App() {
  const now = useCurrentTime();
  const [alarms, setAlarms] = useState(initializeAlarms); 
  const [activeAlarm, setActiveAlarm] = useState(null); 
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalDefaultTime, setModalDefaultTime] = useState(null); 
  const [snoozeTargetTime, setSnoozeTargetTime] = useState(null);
  const [activeTab, setActiveTab] = useState(initializeActiveTab); 
  const [spotifyToken, setSpotifyToken] = useState(localStorage.getItem(TOKEN_KEY) || '');
  
  // Dev Override State
  const [weatherOverride, setWeatherOverride] = useState(null);
  const { weather: apiWeather, loading: weatherLoading } = useCurrentWeather();
  // Effective Weather (Override > API)
  const weather = weatherOverride || apiWeather;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  }, [alarms]); 

  // Spotify Auth Effect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (code && !storedToken) {
        const codeVerifier = localStorage.getItem('spotifyCodeVerifier');
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, '', newUrl);
        if (!codeVerifier) return;
        fetch(TOKEN_PROXY_PATH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ grant_type: 'authorization_code', code: code, redirect_uri: REDIRECT_URI, client_id: CLIENT_ID, code_verifier: codeVerifier }),
        })
        .then(async response => {
            if (!response.ok) throw new Error('Token failed');
            return response.json();
        })
        .then(data => {
            if (data.access_token) {
                localStorage.setItem(TOKEN_KEY, data.access_token);
                setSpotifyToken(data.access_token);
                localStorage.removeItem('spotifyCodeVerifier'); 
            }
        })
        .catch(e => console.error(e));
    } else if (storedToken && storedToken !== spotifyToken) {
        setSpotifyToken(storedToken);
    }
  }, []); 

  const handleTabChange = (newTab) => {
      if (isEditing) setIsEditing(false);
      setActiveTab(newTab);
      localStorage.setItem('activeTab', newTab); 
  };
  
  const closeAlarmModal = () => { setShowAddModal(false); setEditingAlarm(null); };

  const handleOpenAdd = () => {
      setIsEditing(false); 
      setEditingAlarm(null);
      const h = new Date().getHours().toString().padStart(2, '0');
      const m = new Date().getMinutes().toString().padStart(2, '0');
      setModalDefaultTime(`${h}:${m}`);
      setShowAddModal(true);
  };
  
  const openEditModal = (alarm) => { setEditingAlarm(alarm); setShowAddModal(true); setIsEditing(false); };
  
  const saveAlarm = (alarmData) => {
    setAlarms(prevAlarms => {
      if (alarmData.id && prevAlarms.some(a => a.id === alarmData.id)) {
        return prevAlarms.map(a => a.id === alarmData.id ? alarmData : a);
      }
      const newId = prevAlarms.length > 0 ? Math.max(...prevAlarms.map(a => a.id)) + 1 : 1;
      return [...prevAlarms, { ...alarmData, id: newId }];
    });
    closeAlarmModal();
  };

  const toggleAlarm = (id) => {
    setAlarms(prevAlarms => prevAlarms.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const deleteAlarm = (id) => {
    setAlarms(prevAlarms => prevAlarms.filter(a => a.id !== id));
  };
  
  const handleStop = (alarm) => {
    setActiveAlarm(null);
    setSnoozeTargetTime(null); 
    setAlarms(prevAlarms => 
      prevAlarms.map(a => {
        if (a.id === alarm.id) return { ...a, isSnoozed: false };
        return a;
      })
    );
  };

  const handleSnooze = (alarm) => {
    setActiveAlarm(null);
    if (alarm.snoozeEnabled && alarm.snoozeDuration > 0) {
      const visualTarget = new Date();
      visualTarget.setMinutes(visualTarget.getMinutes() + alarm.snoozeDuration);
      visualTarget.setSeconds(visualTarget.getSeconds()); 
      setSnoozeTargetTime(visualTarget);
    } else {
      handleStop(alarm);
    }
  };

  // CHANGED: Triggered when the visual timer hits 00:00
  const handleSnoozeComplete = () => {
      setSnoozeTargetTime(null);
      // Re-trigger the specific snoozed alarm immediately
      const snoozedAlarm = alarms.find(a => a.isSnoozed);
      if (snoozedAlarm) {
          setActiveAlarm(snoozedAlarm);
      }
  };

  const cancelSnooze = () => {
      setSnoozeTargetTime(null);
      setAlarms(prevAlarms => prevAlarms.map(a => {
            if (a.isSnoozed) return { ...a, isSnoozed: false, isActive: false };
            return a;
      }));
  };

  // Regular Scheduled Trigger
  useEffect(() => {
    if (snoozeTargetTime) return; // Don't double trigger if snoozing
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0'); 
    const currentTimeString = `${currentHours}:${currentMinutes}`;
    const triggered = alarms.find(a => a.isActive && a.rawTime === currentTimeString && now.getSeconds() === 0 && !weatherLoading);

    if (triggered && !activeAlarm) {
      setActiveAlarm(triggered);
    }
  }, [now, alarms, activeAlarm, weatherLoading, snoozeTargetTime]);

  // DEV Actions
  const handleDevTrigger = () => {
      setActiveAlarm({ id: 999, time: "NOW", label: "Dev Test", snoozeEnabled: true, snoozeDuration: 1 });
  };

  const sortedAlarms = [...alarms].sort((a, b) => {
    const timeA = a.rawTime.split(':').map(Number);
    const timeB = b.rawTime.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  return (
    <div className="bg-black h-screen w-full overflow-y-auto hide-scrollbar text-white"> 

      {(activeTab === 'Alarms' || activeTab === 'Alarm') && (
        <>
            <header className="sticky top-0 z-20 flex flex-col pt-4 pb-4 bg-black/95 backdrop-blur-md border-b border-white/5">
                <div className="flex justify-between items-center w-full px-4">
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-ios-accent text-lg font-normal hover:text-white transition-colors"
                    >
                        {isEditing ? 'Done' : 'Edit'}
                    </button>
                    
                    {!weatherLoading && weather && (
                        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                            <WeatherIcon condition={weather} />
                            <span className="text-sm font-medium">{weather}</span>
                        </div>
                    )}

                    <button onClick={handleOpenAdd} className="text-ios-accent hover:text-white transition-colors"><Plus size={30} /></button>
                </div>
                <h1 className="text-5xl font-bold text-white px-4 mt-6">Alarms</h1>
            </header>

            <main className="pb-24"> 
              <div className="flex flex-col mt-4">
                {sortedAlarms.map(alarm => (
                  <AlarmItem 
                    key={alarm.id} 
                    alarm={alarm} 
                    onToggle={toggleAlarm}
                    onDelete={deleteAlarm}
                    isEditing={isEditing}
                    onEditClick={openEditModal} 
                  />
                ))}
                {sortedAlarms.length === 0 && <div className="text-center text-ios-text-gray mt-10">No Alarms Set</div>}
              </div>
            </main>
        </>
      )}

      {/* CHANGED: Passing Props to Timer */}
      {activeTab === 'Timer' && <Timer spotifyToken={spotifyToken} weather={weather} />}
      {activeTab === 'Music' && <Music activeTab={activeTab} token={spotifyToken} />}
      {activeTab === 'Stopwatch' && <Stopwatch />}
      {/* CHANGED: Dev Menu */}
      {activeTab === 'Dev' && <DevMenu onSetWeather={setWeatherOverride} onTriggerAlarm={handleDevTrigger} currentWeather={weather} />}

      <NavBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* CHANGED: Passed onComplete to snooze timer */}
      {snoozeTargetTime && (activeTab === 'Alarms' || activeTab === 'Alarm') && (
          <SnoozeTimer targetTime={snoozeTargetTime} onCancel={cancelSnooze} onComplete={handleSnoozeComplete} />
      )}

      {showAddModal && (
        <AddAlarm 
          onClose={closeAlarmModal} 
          onSave={saveAlarm} 
          defaultTime={modalDefaultTime} 
          alarmToEdit={editingAlarm} 
        />
      )}

      {activeAlarm && (
        <RingingScreen 
          alarm={activeAlarm} 
          onStop={handleStop} 
          onSnooze={handleSnooze} 
          currentWeather={weather} 
          spotifyToken={spotifyToken} 
        />
      )}
    </div>
  );
}
