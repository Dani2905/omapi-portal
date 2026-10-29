import React from 'react';
import { User } from '../../types';
import { UserPlusIcon, PencilSquareIcon, TrashIcon, UsersIcon, CheckIcon } from './AdminIcons';

interface AdminUsersManagerProps {
  users: User[];
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (id: number | string) => void;
}

const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({ users, onAdd, onEdit, onDelete }) => {
  
  const getRoleBadge = (role: string) => {
    return role === 'Admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getStatusBadge = (status: string) => {
    return status === 'Actif'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Gestion des utilisateurs</h2>
            <button 
                onClick={onAdd}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-sm border border-slate-900 flex items-center"
            >
                <UserPlusIcon className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter un utilisateur</span>
            </button>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Utilisateur
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Rôle
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Statut
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-9 w-9">
                                            <div className="h-9 w-9 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{user.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold uppercase tracking-widest rounded-sm border ${user.role === 'Admin' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold uppercase tracking-widest rounded-sm border ${user.status === 'Actif' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => onEdit(user)}
                                        className="text-slate-400 hover:text-blue-600 mr-3"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(user.id)}
                                        className="text-slate-400 hover:text-red-600"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {users.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                    Aucun utilisateur
                </div>
            )}
        </div>
    </div>
  );
};

export default AdminUsersManager;