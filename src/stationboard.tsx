import React, { useState } from 'react';
import type Bus from './utils/bus';

const StationBoard: React.FC<{ bus?: Bus }> = ({ bus }) => {
  const [current, setCurrent] = useState(0);
  if (!bus) {
    return <></>;
  }
  const stops = bus.stops;
  bus.addListener((index) => {
    setCurrent(index);
  });

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999,
      fontFamily: 'monospace',
      width: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
      backgroundColor: 'white',
      border: '1px solid #333',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        backgroundColor: '#222',
        color: '#fff',
        padding: '10px 15px',
        fontSize: '18px',
        fontWeight: 'bold',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px'
      }}>
        🚏 Station Board
      </div>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse'
      }}>
        <thead style={{ backgroundColor: '#eee', position: 'sticky', top: 0 }}>
          <tr>
            <th style={thStyle}>Stop Name</th>
            <th style={thStyle}>Arrival</th>
            <th style={thStyle}>Departure</th>
          </tr>
        </thead>
        <tbody>
          {stops.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ccc', backgroundColor: index === current ? "orangered" : index === (current + 1) ? "green" : "" }}>
              <td style={tdStyle}>{item.stop_name}</td>
              <td style={tdStyle}>{item.arrival_time}</td>
              <td style={tdStyle}>{item.departure_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid #ccc',
  backgroundColor: '#eee'
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px'
};

export default StationBoard;
