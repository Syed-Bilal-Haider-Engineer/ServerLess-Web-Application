import React from 'react';
import { createPortal } from 'react-dom';
import './Model.css'

// 1. Define the shape of the Props
interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; 
}

const PortalModal: React.FC<PortalModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const target = document.getElementById('modal-root');

  if (!target) {
    console.warn("Target #modal-root not found in the DOM.");
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    target
  );
};

export default PortalModal;