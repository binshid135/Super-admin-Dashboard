import React, { useState, useEffect } from 'react';
import { User, LogOut, Bell, Search, Filter, Settings, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PAGES } from '../../constants/pages';
import CommentSection from '../common/CommentSection';
import Alert from '../common/Alert';
import ProfileSettings from './ProfileSettings';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState(null);
  const [userPages, setUserPages] = useState([]);
  const [userPermissions, setUserPermissions] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    const result = await api.getMyPermissions(token);
    if (result.success) {
      setUserPermissions(result.data);

      // Filter pages based on user permissions
      const accessiblePages = PAGES.filter(page => {
        return result.data[page.id]?.view;
      });
      setUserPages(accessiblePages);

      // Set first accessible page as active
      if (accessiblePages.length > 0 && !activePage) {
        setActivePage(accessiblePages[0]);
      }
    } else {
      setAlert({ type: 'error', message: 'Failed to load permissions' });
    }
    setLoading(false);
  };

  const getPagePermissions = (pageId) => {
    return userPermissions[pageId] || {};
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (userPages.length === 0) {
    return (
      <>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Access Granted</h1>
            <p className="text-gray-600 mb-4">
              You don't have access to any pages yet. Please contact your administrator to request access.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowProfile(true)}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Profile Settings
              </button>
              <button
                onClick={logout}
                className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
        {/* Profile Settings Modal */}
        {showProfile && (
          <ProfileSettings onClose={() => setShowProfile(false)} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">User Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="font-semibold text-white text-sm uppercase tracking-wide">Your Pages</h2>
                <p className="text-blue-100 text-xs mt-1">{userPages.length} accessible</p>
              </div>

              {/* Pages List */}
              <div className="p-4 space-y-1">
                {userPages.map(page => {
                  const perms = getPagePermissions(page.id);
                  const activeCount = Object.values(perms).filter(Boolean).length;
                  const isActive = activePage?.id === page.id;

                  return (
                    <button
                      key={page.id}
                      onClick={() => setActivePage(page)}
                      className={`group w-full text-left px-4 py-3.5 rounded-lg transition-all duration-200 relative overflow-hidden ${
                        isActive
                          ? 'bg-blue-50 shadow-sm'
                          : 'hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        {/* Page icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        
                        {/* Page info */}
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm truncate ${
                            isActive ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {page.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs ${
                              isActive ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              {activeCount} permission{activeCount !== 1 ? 's' : ''}
                            </span>
                            {isActive && (
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Permissions Summary */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  Quick Summary
                </h3>
                <div className="space-y-3">
                  {Object.entries(userPermissions).map(([pageId, perms]) => {
                    const page = PAGES.find(p => p.id === pageId);
                    if (!page) return null;

                    const activePerms = Object.entries(perms)
                      .filter(([_, value]) => value)
                      .map(([key]) => key);

                    if (activePerms.length === 0) return null;

                    return (
                      <div key={pageId} className="space-y-1.5">
                        <div className="text-xs font-medium text-gray-700">
                          {page.name}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {activePerms.map(perm => (
                            <span
                              key={perm}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 capitalize"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activePage ? (
              <div className="space-y-6">
                {/* Page Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{activePage.name}</h2>
                      <p className="text-gray-600 mt-1">
                        Manage {activePage.name.toLowerCase()} Comments
                      </p>
                    </div>
                   
                  </div>

                  <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-200">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {activePage.name} Comments
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                   
                      You have {Object.values(getPagePermissions(activePage.id)).filter(Boolean).length} permissions for this page.
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {Object.entries(getPagePermissions(activePage.id)).map(([perm, hasPerm]) =>
                        hasPerm && (
                          <span
                            key={perm}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full capitalize"
                          >
                            {perm}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                    <div className="text-sm text-gray-500">
                      {getPagePermissions(activePage.id).create ? 'You can add comments' : 'Read-only access'}
                    </div>
                  </div>
                  <CommentSection
                    page={activePage.id}
                    permissions={getPagePermissions(activePage.id)}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Page</h3>
                <p className="text-gray-600">Choose a page from the sidebar to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProfile && (
        <ProfileSettings onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default UserDashboard;