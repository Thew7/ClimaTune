import React from 'react';

export default function Toggle({ checked, onChange }) {
  return (
    <button 
      // MODIFIED: Call onChange directly, passing the new state value
      onClick={() => onChange(!checked)} 
      className={`
        relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75
        ${checked ? 'bg-ios-green' : 'bg-ios-gray/80'}
      `}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-lg ring-0 
          transition duration-200 ease-in-out
          ${checked ? 'translate-x-[20px]' : 'translate-x-0'}
        `}
      />
    </button>
  );
}