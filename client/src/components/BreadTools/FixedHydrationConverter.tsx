import React from 'react';
import SimpleHydrationConverter from './SimpleHydrationConverter';
import './hydration-converter-fix.css';

export default function FixedHydrationConverter() {
  return (
    <div className="w-full">
      <div className="hydration-converter-wrapper">
        <SimpleHydrationConverter />
      </div>
    </div>
  );
}