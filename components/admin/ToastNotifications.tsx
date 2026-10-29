import React from 'react';
import { Notification } from '../../types';
import { CheckIcon, ExclamationTriangleIcon, XMarkIcon, InformationCircleIcon } from './AdminIcons';

interface ToastNotificationsProps {
  notifications: Notification[];
  removeNotification: (id: number) => void;
}

const ToastNotifications: React.FC<ToastNotificationsProps> = ({ notifications, removeNotification }) => (
  <div
    className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
    aria-live="polite"
    aria-relevant="additions text"
    aria-atomic="false"
  >
    {notifications.map((notification) => {
      const isError = notification.type === 'error';
      const title = isError
        ? 'Action non effectuée'
        : notification.type === 'success' ? 'Action terminée' : 'Information';

      return (
        <div
          key={notification.id}
          role={isError ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border bg-white animate-slideIn ${
            isError ? 'border-l-4 border-l-red-500' :
              notification.type === 'success' ? 'border-l-4 border-l-green-500' :
                'border-l-4 border-l-blue-500'
          }`}
        >
          <div className="flex-shrink-0 mr-3" aria-hidden="true">
            {isError && <div className="bg-red-100 rounded-full p-1"><ExclamationTriangleIcon className="w-5 h-5 text-red-600" /></div>}
            {notification.type === 'success' && <div className="bg-green-100 rounded-full p-1"><CheckIcon className="w-5 h-5 text-green-600" /></div>}
            {notification.type === 'info' && <div className="bg-blue-100 rounded-full p-1"><InformationCircleIcon className="w-5 h-5 text-blue-600" /></div>}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-600 mt-1 break-words">{notification.message}</p>
          </div>

          <button
            type="button"
            aria-label="Fermer la notification"
            title="Fermer"
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-700 transition-colors rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      );
    })}
  </div>
);

export default ToastNotifications;
