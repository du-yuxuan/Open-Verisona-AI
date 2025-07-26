import React from 'react';

interface VerisonaLogoProps {
  className?: string;
  size?: number;
}

export function VerisonaLogo({ className = "", size = 32 }: VerisonaLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Verisona AI Logo"
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain'
      }}
    />
  );
}

export default VerisonaLogo;