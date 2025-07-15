
import React from 'react';

const Legend: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px 14px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 9999,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
        <span style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          backgroundColor: 'red',
          borderRadius: '50%',
          marginRight: '8px'
        }} />
        Bus
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          backgroundColor: 'green',
          borderRadius: '50%',
          marginRight: '8px'
        }} />
        Stop
      </div>
    </div>
  );
};

export default Legend;
