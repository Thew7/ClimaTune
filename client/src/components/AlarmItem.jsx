import React from 'react';
import Toggle from './Toggle';
import { ChevronRight, Trash2 } from 'lucide-react'; 

export default function AlarmItem({ alarm, onToggle, onDelete, isEditing, onEditClick }) {
  const handleToggle = () => {
    onToggle(alarm.id);
  };

  // 1. Handler for the parent row (opens edit modal when isEditing is true)
  const handleItemClick = () => {
      if (isEditing && onEditClick) {
          onEditClick(alarm);
      }
  };

  // 2. Handler for the delete button (stops click from bubbling up)
  const handleDeleteClick = (e) => {
    // CRUCIAL FIX: Stop the click event from propagating to the parent div
    e.stopPropagation(); 
    onDelete(alarm.id);
  };


  return (
    <div 
      onClick={handleItemClick}
      className={`
        group relative flex w-full items-center justify-between border-b border-white/10 py-4 pl-4 pr-4 transition-all hover:bg-white/5
        ${isEditing ? 'cursor-pointer' : ''}
      `}
    >
      
      {/* Delete Button (appears when editing) */}
      <div 
        className={`
          flex items-center overflow-hidden transition-all duration-300 ease-in-out
          ${isEditing ? 'mr-3 w-8 opacity-100' : 'w-0 opacity-0'}
        `}
      >
        <button 
          // Uses the handler with the stopPropagation fix
          onClick={handleDeleteClick}
          className="text-ios-red hover:text-red-400" 
        >
          <Trash2 size={24} /> 
        </button>
      </div>

      {/* Time & Label */}
      <div className="flex flex-col flex-1">
        <div className={`text-5xl font-light transition-opacity ${!alarm.isActive ? 'opacity-50' : 'opacity-100'}`}>
          {alarm.time}
          <span className="ml-1 text-2xl text-ios-text-gray font-normal">{alarm.period}</span>
        </div>
        <div className="text-sm text-ios-text-gray">
          {alarm.label || 'Alarm'}
        </div>
      </div>

      {/* Toggle Button / Chevron Right */}
      <div className="flex items-center space-x-2">
        {!isEditing && (
          <Toggle 
            checked={alarm.isActive} 
            onChange={handleToggle} 
          />
        )}
        {isEditing && (
          <ChevronRight size={24} className="text-ios-text-gray" />
        )}
      </div>
    </div>
  );
}