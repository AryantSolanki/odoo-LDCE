import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
  className = '',
  noPadding = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-fade-in pointer-events-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-950/40 backdrop-blur-sm transition-opacity z-[1000] pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-[2rem] shadow-modal border border-surface-border overflow-hidden transform transition-all animate-slide-up z-[1100] pointer-events-auto flex flex-col ${className} max-h-[calc(100vh-40px)]`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || description) && (
          <div className="p-6 border-b border-surface-border flex items-start justify-between gap-4 shrink-0">
            <div>
              {title && (
                <h3 className="text-xl font-editorial font-bold text-brand-900 tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-brand-600 mt-1 font-medium">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-brand-400 hover:text-brand-900 hover:bg-surface-hover p-2 rounded-full transition-colors focus:outline-none shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* If no title/desc but need a close button, position absolute */}
        {!title && !description && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[1200] text-brand-400 hover:text-brand-900 hover:bg-surface-hover p-2 rounded-full transition-colors focus:outline-none shadow-sm bg-white/80 backdrop-blur-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className={`overflow-y-auto overflow-x-hidden ${noPadding ? '' : 'p-6'}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 bg-surface-card border-t border-surface-border flex items-center justify-end gap-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};
