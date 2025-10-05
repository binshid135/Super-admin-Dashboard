import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PAGES } from '../../constants/pages';
import { api } from '../../services/api';
import Alert from '../common/Alert';

const UserPermissionPanel = ({ user, onClose, onSave }) => {
  const { token } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (user) {
      const userPerms = {};
      PAGES.forEach(page => {
        userPerms[page.id] = user.permissions?.[page.id] || {
          view: false,
          edit: false,
          create: false,
          delete: false
        };
      });
      setPermissions(userPerms);
    }
  }, [user]);

  const handleToggle = (pageId, permission) => {
    setPermissions(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [permission]: !prev[pageId][permission]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setAlert(null);

    const result = await api.updateUserPermissions(user.id, permissions, token);
    
    if (result.success) {
      setAlert({ type: 'success', message: 'Permissions updated successfully!' });
      setTimeout(() => {
        onSave(user.id, permissions);
        onClose();
      }, 1000);
    } else {
      setAlert({ type: 'error', message: result.error });
      console.log('Error updating permissions:', result.error);
    }
    setLoading(false);
  };

  const getPermissionColor = (perm) => {
    const colors = {
      view: 'bg-blue-100 text-blue-800',
      edit: 'bg-yellow-100 text-yellow-800',
      create: 'bg-green-100 text-green-800',
      delete: 'bg-red-100 text-red-800'
    };
    return colors[perm] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Manage Permissions</h2>
              <p className="text-indigo-100 mt-1">{user?.email}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {alert && (
          <div className="px-6 pt-4">
            <Alert type={alert.type} message={alert.message} />
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PAGES.map(page => (
              <div key={page.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                  <span>{page.name}</span>
                  <div className="flex gap-1">
                    {Object.entries(permissions[page.id] || {}).map(([perm, value]) => 
                      value && (
                        <span key={perm} className={`text-xs px-2 py-1 rounded capitalize ${getPermissionColor(perm)}`}>
                          {perm}
                        </span>
                      )
                    )}
                  </div>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['view', 'create', 'edit', 'delete'].map(perm => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={permissions[page.id]?.[perm] || false}
                        onChange={() => handleToggle(page.id, perm)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className={`text-sm capitalize group-hover:text-indigo-600 transition-colors ${
                        permissions[page.id]?.[perm] ? 'text-indigo-600 font-medium' : 'text-gray-700'
                      }`}>
                        {perm}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Permissions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionPanel;