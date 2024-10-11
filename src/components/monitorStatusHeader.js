import React, { useEffect, useState } from 'react';
import config from '../../config.yaml';
import { locations } from '../functions/locations';

const classes = {
  green:
    'bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-200 border-green-300 dark:border-green-600',
  yellow:
    'bg-yellow-200 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600',
};

export default function MonitorStatusHeader({ kvMonitorsLastUpdate }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  let color = 'green';
  let text = config.settings.allmonitorsOperational;

  if (!kvMonitorsLastUpdate.allOperational) {
    color = 'yellow';
    text = config.settings.notAllmonitorsOperational;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (kvMonitorsLastUpdate.time) {
        setElapsedTime(Math.round((Date.now() - kvMonitorsLastUpdate.time) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [kvMonitorsLastUpdate.time]);

  const formatElapsedTime = (seconds) => {
    const years = Math.floor(seconds / (365 * 24 * 60 * 60));
    seconds %= (365 * 24 * 60 * 60);
    const months = Math.floor(seconds / (30 * 24 * 60 * 60));
    seconds %= (30 * 24 * 60 * 60);
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds %= (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds %= (60 * 60);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const timeParts = [];
    if (years > 0) timeParts.push(`${ years }年`);
    if (months > 0) timeParts.push(`${ months }個月`);
    if (days > 0) timeParts.push(`${ days }天`);
    if (hours > 0 || timeParts.length > 0) timeParts.push(`${ hours }小時`);
    if (minutes > 0 || timeParts.length > 0) timeParts.push(`${ minutes }分鐘`);
    if (remainingSeconds > 0 || timeParts.length === 0) timeParts.push(`${ remainingSeconds }秒`);

    return timeParts.join('');
  };

  return (
    <div className={`card mb-4 font-semibold ${ classes[color] }`}>
      <div className="flex flex-row justify-between items-center">
        <div>{text}</div>
        {kvMonitorsLastUpdate.time && (
          <div className="text-xs font-light">
            在 {formatElapsedTime(elapsedTime)} 前於 {locations[kvMonitorsLastUpdate.loc] || kvMonitorsLastUpdate.loc} 更新
          </div>
        )}
      </div>
    </div>
  );
}
