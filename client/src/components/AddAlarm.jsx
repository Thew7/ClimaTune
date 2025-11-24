// src/components/AddAlarm.jsx
import React, { useState, useRef, useLayoutEffect } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { Check } from 'lucide-react';
import Toggle from './Toggle'; 

const ITEM_HEIGHT = 48; 
const VISIBLE_ITEMS = 5; 
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2); 
const PADDING_HEIGHT = PADDING_ITEMS * ITEM_HEIGHT; 

const HourMinuteSelector = ({ type, value, onChange, options }) => {
    const scrollListRef = useRef(null);
    const isMinute = type === 'minute';
    const isPeriod = type === 'period';
    const REPEAT_COUNT = isPeriod ? 1 : 50; 
    const extendedOptions = Array.from({ length: REPEAT_COUNT }).flatMap(() => options);
    const middleSetIndex = Math.floor(REPEAT_COUNT / 2);
    const valueIndexInOriginal = options.indexOf(value);
    const initialIndex = (middleSetIndex * options.length) + valueIndexInOriginal;

    useLayoutEffect(() => {
        if (scrollListRef.current && initialIndex >= 0) {
            const initialScrollTop = initialIndex * ITEM_HEIGHT;
            scrollListRef.current.scrollTop = initialScrollTop;
        }
    }, []); 

    const handleScroll = () => {
        if (scrollListRef.current) {
            const scrollTop = scrollListRef.current.scrollTop;
            const index = Math.round(scrollTop / ITEM_HEIGHT);
            const safeIndex = index % options.length; 
            const newValue = options[safeIndex];
            if (newValue !== undefined && newValue !== value) {
                onChange(newValue);
            }
        }
    };
    
    useLayoutEffect(() => {
        const list = scrollListRef.current;
        if (list) {
            list.addEventListener('scroll', handleScroll);
            return () => list.removeEventListener('scroll', handleScroll);
        }
    }, [options, value]);
    
    const formatLabel = (val) => {
        if (isMinute) return val.toString().padStart(2, '0');
        return val.toString();
    };
    
    let widthClass = isPeriod ? 'w-1/4' : 'w-1/3';

    return (
        <div className={`relative ${widthClass}`}> 
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none">
                <div style={{ top: PADDING_HEIGHT }} className="absolute left-0 right-0 h-[1px] bg-white/20"/>
                <div style={{ bottom: PADDING_HEIGHT }} className="absolute left-0 right-0 h-[1px] bg-white/20"/>
            </div>
            <div ref={scrollListRef} className="h-60 overflow-y-scroll hide-scrollbar">
                <div style={{ height: PADDING_HEIGHT }} />
                {extendedOptions.map((option, i) => {
                    const label = formatLabel(option);
                    const isSelected = option === value;
                    return (
                        <div key={i} style={{ height: ITEM_HEIGHT }} className={`w-full text-2xl font-medium flex items-center justify-center transition-colors duration-100 ease-in-out ${isSelected ? 'text-ios-accent font-bold text-4xl' : 'text-white/60 text-3xl font-light'} ${isPeriod ? 'text-xl' : ''}`}>
                            {label}
                        </div>
                    );
                })}
                <div style={{ height: PADDING_HEIGHT }} /> 
            </div>
        </div>
    );
};

export default function AddAlarm({ onClose, onSave, defaultTime, alarmToEdit }) {
  const isEditing = !!alarmToEdit;

  const getInitialState = () => {
    let targetTime = defaultTime; 
    if (isEditing) targetTime = alarmToEdit.rawTime;
    if (!targetTime) return { h12: 12, m: 0, period: 'AM' };
    const [h24, m] = targetTime.split(':').map(Number);
    const period = h24 < 12 ? 'AM' : 'PM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return { h12, m, period };
  };

  const initialState = getInitialState();
  const [hour, setHour] = useState(initialState.h12); 
  const [minute, setMinute] = useState(initialState.m); 
  const [period, setPeriod] = useState(initialState.period); 

  const [snoozeDuration, setSnoozeDuration] = useState(isEditing ? (alarmToEdit.snoozeDuration || 5) : 5);
  const [label, setLabel] = useState(isEditing ? alarmToEdit.label : 'Alarm');
  const [snoozeEnabled, setSnoozeEnabled] = useState(isEditing ? (alarmToEdit.snoozeEnabled ?? true) : true);
  
  const durationOptions = Array.from({ length: 30 }, (_, i) => i + 1); 
  
  const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  const handleSave = () => {
    let rawHour = hour;
    if (period === 'PM' && rawHour !== 12) rawHour += 12;
    else if (period === 'AM' && rawHour === 12) rawHour = 0;

    const displayMinuteString = minute.toString().padStart(2, '0');
    
    const alarmData = {
      id: isEditing ? alarmToEdit.id : Date.now(), 
      time: `${hour}:${displayMinuteString}`,
      period: period,
      isActive: true, 
      label: label,
      rawTime: `${rawHour.toString().padStart(2, '0')}:${displayMinuteString}`,
      snoozeEnabled: snoozeEnabled,
      snoozeDuration: snoozeEnabled ? snoozeDuration : 0, 
    };
    onSave(alarmData);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-6 py-4 bg-black/90 backdrop-blur-md sticky top-0 border-b border-white/10">
        <button onClick={onClose} className="text-ios-accent text-lg font-normal hover:opacity-80">Cancel</button>
        <h2 className="text-lg font-semibold tracking-wide">{isEditing ? 'Edit Alarm' : 'Add Alarm'}</h2>
        <button onClick={handleSave} className="text-ios-accent text-lg font-bold hover:opacity-80">Save</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center hide-scrollbar">
        <div className="relative flex justify-center items-center w-full max-w-sm mt-4 mb-10"> 
            <div className="flex items-center justify-center w-full bg-ios-gray/50 rounded-xl py-2">
                <HourMinuteSelector type="hour" value={hour} onChange={setHour} options={hours12} />
                <span className="w-8 flex justify-center items-center text-ios-accent text-4xl font-bold py-2 select-none pointer-events-none">:</span>
                <HourMinuteSelector type="minute" value={minute} onChange={setMinute} options={minutes} />
                <HourMinuteSelector type="period" value={period} onChange={setPeriod} options={periods} />
            </div>
        </div>

        {/* Added gap for separation */}
        <div className="w-full space-y-4 max-w-sm">
            <div className="flex justify-between items-center px-4 py-3 bg-ios-gray/50 rounded-lg">
                <label htmlFor="label" className="text-white font-medium">Label</label>
                <input
                    id="label"
                    type="text"
                    value={label}
                    onFocus={(e) => e.target.select()} 
                    onChange={(e) => setLabel(e.target.value)}
                    // INVISIBLE INPUT STYLE
                    className="bg-transparent text-right text-ios-accent text-lg border-none focus:ring-0 p-0 w-3/5 outline-none placeholder-gray-500"
                    placeholder="Alarm"
                />
            </div>
            
            <div className="flex justify-between items-center px-4 py-3 bg-ios-gray/50 rounded-lg">
                <span className="text-white font-medium">Snooze</span>
                <Toggle checked={snoozeEnabled} onChange={setSnoozeEnabled} />
            </div>

            {snoozeEnabled && (
                <div className="flex justify-between items-center px-4 py-3 bg-ios-gray/50 rounded-lg relative">
                    <span className="text-white font-medium">Snooze Duration</span>
                    
                    <div className="w-2/5">
                        <Listbox value={snoozeDuration} onChange={setSnoozeDuration}>
                            <ListboxButton className="relative w-full cursor-default rounded-lg py-2 pl-3 pr-2 text-right focus:outline-none sm:text-sm">
                                <span className="block truncate text-ios-accent text-lg">{snoozeDuration} min</span>
                            </ListboxButton>
                            
                            <ListboxOptions 
                                anchor="bottom end"
                                className="w-40 rounded-xl bg-ios-gray/95 border border-white/10 p-1 focus:outline-none backdrop-blur-md z-[60] max-h-60 overflow-y-auto hide-scrollbar"
                            >
                                {durationOptions.map((option) => (
                                    <ListboxOption
                                        key={option}
                                        value={option}
                                        className={({ focus, selected }) =>
                                            `group flex cursor-pointer items-center gap-2 rounded-lg py-1.5 px-3 select-none ${
                                                focus ? 'bg-white/10' : ''
                                            }`
                                        }
                                    >
                                        <Check className={`invisible size-4 text-ios-accent group-data-[selected]:visible`} />
                                        <div className="text-white/90 text-md">{option} min</div>
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}