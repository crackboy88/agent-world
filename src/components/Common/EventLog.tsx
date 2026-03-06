/**
 * 事件日志组件
 */

import React from 'react';

interface LogEntry {
  id: string;
  type: string;
  message: string;
  timestamp: number;
}

interface EventLogProps {
  logs: LogEntry[];
}

export const EventLog: React.FC<EventLogProps> = ({ logs }) => {
  return (
    <div className="event-log">
      {logs.length === 0 ? (
        <div className="empty-state">等待事件...</div>
      ) : (
        logs.map(log => (
          <div key={log.id} className={`log-item ${log.type}`}>
            <span className="log-content">{log.message}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default EventLog;
