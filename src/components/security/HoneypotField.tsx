
import React from 'react';

interface HoneypotFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export const HoneypotField = ({ name, value, onChange }: HoneypotFieldProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        opacity: 0,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
      />
    </div>
  );
};
