import React from 'react';

export default function RouteLoader({ label = 'Yükleniyor...' }) {
  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#777777',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px'
      }}
    >
      {label}
    </div>
  );
}
