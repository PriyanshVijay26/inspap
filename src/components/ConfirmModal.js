import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // danger, warning, info, success
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return 'fa-exclamation-triangle';
      case 'warning':
        return 'fa-exclamation-circle';
      case 'success':
        return 'fa-check-circle';
      case 'info':
        return 'fa-info-circle';
      default:
        return 'fa-question-circle';
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-modal-header confirm-modal-${type}`}>
          <i className={`fas ${getIcon()} confirm-modal-icon`}></i>
          <h2 className="confirm-modal-title">{title}</h2>
        </div>
        <div className="confirm-modal-body">
          <p className="confirm-modal-message">{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button onClick={onClose} className="confirm-modal-btn confirm-modal-btn-cancel">
            {cancelText}
          </button>
          <button onClick={handleConfirm} className={`confirm-modal-btn confirm-modal-btn-${type}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

