
import React from 'react';
import { Notification } from '../../types';
import { CheckIcon, ExclamationTriangleIcon, XMarkIcon, InformationCircleIcon } from './AdminIcons';

interface ToastNotificationsProps {
  notifications: Notification[];
  removeNotification: (id: number) => void;
}

const ToastNotifications: React.FC<ToastNotificationsProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col space-y-3 w-80 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            pointer-events-auto transform transition-all duration-500 ease-in-out
            flex items-start p-4 rounded-xl shadow-lg border bg-white
            ${notification.type === 'success' ? 'border-l-4 border-l-green-500' : ''}
            ${notification.type === 'error' ? 'border-l-4 border-l-red-500' : ''}
            ${notification.type === 'info' ? 'border-l-4 border-l-blue-500' : ''}
            animate-slideIn
          `}
        >
          <div className="flex-shrink-0 mr-3">
            {notification.type === 'success' && <div className="bg-green-100 rounded-full p-1"><CheckIcon className="w-5 h-5 text-green-600" /></div>}
            {notification.type === 'error' && <div className="bg-red-100 rounded-full p-1"><ExclamationTriangleIcon className="w-5 h-5 text-red-600" /></div>}
            {notification.type === 'info' && <div className="bg-blue-100 rounded-full p-1"><InformationCircleIcon className="w-5 h-5 text-blue-600" /></div>}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-semibold text-gray-900">
                {notification.type === 'success' ? 'Succès' : notification.type === 'error' ? 'Erreur' : 'Information'}
            </p>
            <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotifications;
