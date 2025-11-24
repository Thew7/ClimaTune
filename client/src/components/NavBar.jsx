// src/components/NavBar.jsx
import React from 'react';
import { Music, Clock, Watch, Timer, Terminal } from 'lucide-react';

// CHANGED: Added Dev Menu
const navItems = [
  { name: 'Music', icon: Music },
  { name: 'Alarms', icon: Clock },
  { name: 'Stopwatch', icon: Watch },
  { name: 'Timer', icon: Timer },
  { name: 'Dev', icon: Terminal }, 
];

export default function NavBar({ activeTab, onTabChange }) {
  const currentTabName = activeTab === 'Alarm' ? 'Alarms' : activeTab;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ios-black/95 backdrop-blur-md border-t border-white/10 pt-2 pb-6">
      <div className="flex justify-around w-full max-w-xl mx-auto h-12 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTabName === item.name;
          
          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.name)}
              className="group flex flex-col items-center justify-center text-[10px] font-medium w-full h-full transition-colors"
            >
              <Icon 
                size={24} 
                className={`${isActive ? 'text-ios-accent' : 'text-ios-text-gray/80 group-hover:text-white'} transition-colors`}
              />
              <span 
                className={`mt-1 ${isActive ? 'text-ios-accent' : 'text-ios-text-gray/80 group-hover:text-white'} transition-colors`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}