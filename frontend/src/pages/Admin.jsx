import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [storedAdminPassword, setStoredAdminPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/api/admin/login', { adminPassword });
      setIsAuthenticated(true);
      setStoredAdminPassword(adminPassword);
      setAdminPassword('');
      fetchUsers(adminPassword);
    } catch (error) {
      setError('Invalid admin password');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (password = storedAdminPassword) => {
    try {
      setLoading(true);
      const response = await api.post('/api/admin/users', { adminPassword: password });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/admin/users/${userId}`, {
        data: { adminPassword: storedAdminPassword }
      });

      // Remove user from local state
      setUsers(users.filter(user => user.id !== userId));

      // Show success feedback
      alert(`User "${username}" has been deleted successfully.`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAllProgress = async () => {
    if (resetConfirmText !== 'RESET ALL') {
      setError('Please type "RESET ALL" to confirm');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/api/admin/reset-all-progress', {
        adminPassword: storedAdminPassword
      });

      setSuccess('All player progress and leaderboards have been reset successfully! All players can now start fresh from verse 1.');
      setShowResetConfirm(false);
      setResetConfirmText('');

      // Refresh user list to see updated progress
      fetchUsers();
    } catch (error) {
      console.error('Failed to reset all progress:', error);
      setError('Failed to reset all progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="font-title text-4xl font-bold text-mystery-gold">
              Mystery Verse
            </Link>
            <p className="text-gray-300 mt-2">Admin Access</p>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-center">Admin Login</h2>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Access Admin Panel'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-title text-4xl font-bold text-mystery-gold mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-300">Monitor user registrations and progress</p>
          </div>
          <Link to="/" className="btn-secondary">
            Exit Admin
          </Link>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={() => { setError(''); }} className="float-right">×</button>
          </div>
        )}

        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
            {success}
            <button onClick={() => { setSuccess(''); }} className="float-right">×</button>
          </div>
        )}

        {/* Reset All Progress Section */}
        <div className="mb-8">
          <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">⚠️</span>
              <h2 className="text-2xl font-semibold text-red-300">Danger Zone</h2>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">Reset All Player Progress</h3>
            <p className="text-gray-300 mb-6">
              This will reset ALL players back to verse 1 and clear ALL leaderboards.
              This gives everyone a fresh start. This action cannot be undone, but a backup will be created first.
            </p>

            {!showResetConfirm ? (
              <button
                onClick={() => {
                  setShowResetConfirm(true);
                  setError('');
                  setSuccess('');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-medium transition-colors"
              >
                Reset All Progress & Leaderboards
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-yellow-300 font-medium">
                  Are you absolutely sure? This will affect ALL {users.length} players. Type "RESET ALL" to confirm:
                </p>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Type RESET ALL"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleResetAllProgress}
                    disabled={loading || resetConfirmText !== 'RESET ALL'}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-medium transition-colors"
                  >
                    {loading ? 'Resetting...' : 'Confirm Reset All'}
                  </button>
                  <button
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetConfirmText('');
                      setError('');
                    }}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Management Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-mystery-gold mb-2">User Management</h2>
          <p className="text-gray-300">Monitor player registrations and progress ({users.length} total users)</p>
        </div>

        {/* Users List */}
        <div>
          {users.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400 text-lg">No users found</p>
              <p className="text-gray-500 text-sm mt-2">Users will appear here when they register</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="card">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{user.username}</h3>
                      <p className="text-mystery-gold text-sm">
                        Current Verse: {user.currentVerse}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm text-gray-400">
                        <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;