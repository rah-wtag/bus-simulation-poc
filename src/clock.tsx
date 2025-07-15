
import React, { useEffect, useState } from 'react';

// Utility to get Zurich time
function currentZurichTime(): string {
  const now = new Date();
  const zurichTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Zurich' })
  );
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(zurichTime.getHours())}:${pad(zurichTime.getMinutes())}:${pad(zurichTime.getSeconds())}`;
}

const ZurichClockPopup: React.FC = () => {
  const [time, setTime] = useState<string>(currentZurichTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(currentZurichTime());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '16px',
      zIndex: 9999,
    }}>
      Zurich Time: {time}
    </div>
  );
};

export default ZurichClockPopup;
