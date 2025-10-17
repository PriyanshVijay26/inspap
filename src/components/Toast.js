import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'info':
        return 'fa-info-circle';
      default:
        return 'fa-info-circle';
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <i className={`fas ${getIcon()} toast-icon`}></i>
        <p className="toast-message">{message}</p>
      </div>
      <button onClick={onClose} className="toast-close">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Toast;

