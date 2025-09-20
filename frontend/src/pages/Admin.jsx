import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { playClickSound } from '../utils/audio';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [storedAdminPassword, setStoredAdminPassword] = useState('');
  const [verses, setVerses] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('verses');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVerse, setEditingVerse] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clues: '',
    answer: '',
    orderIndex: '',
    isActive: true
  });

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/admin/login', { adminPassword });
      setIsAuthenticated(true);
      setStoredAdminPassword(adminPassword);
      setAdminPassword('');
      fetchData(adminPassword);
    } catch (error) {
      setError('Invalid admin password');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (password = storedAdminPassword) => {
    try {
      setLoading(true);
      console.log('Fetching admin data with password:', password);

      const [versesResponse, usersResponse] = await Promise.all([
        axios.post('/api/admin/verses-list', { adminPassword: password }),
        axios.post('/api/admin/users', { adminPassword: password })
      ]);

      console.log('Verses response:', versesResponse.data);
      console.log('Users response:', usersResponse.data);

      setVerses(versesResponse.data.verses);
      setUsers(usersResponse.data.users);

      console.log('Users set to:', usersResponse.data.users);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const requestData = {
        ...formData,
        adminPassword: process.env.ADMIN_PASSWORD,
        orderIndex: parseInt(formData.orderIndex)
      };

      if (editingVerse) {
        await axios.put(`/api/admin/verses/${editingVerse.id}`, requestData);
      } else {
        await axios.post('/api/admin/verses', requestData);
      }

      // Reset form and refresh data
      setFormData({
        title: '',
        description: '',
        clues: '',
        answer: '',
        orderIndex: '',
        isActive: true
      });
      setEditingVerse(null);
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save verse');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (verse) => {
    setEditingVerse(verse);
    setFormData({
      title: verse.title,
      description: verse.description,
      clues: verse.clues || '',
      answer: verse.answer,
      orderIndex: verse.orderIndex.toString(),
      isActive: verse.isActive
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (verseId) => {
    if (!confirm('Are you sure you want to delete this verse?')) return;

    try {
      setLoading(true);
      await axios.delete(`/api/admin/verses/${verseId}`, {
        data: { adminPassword: process.env.ADMIN_PASSWORD }
      });
      fetchData();
    } catch (error) {
      setError('Failed to delete verse');
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
            <p className="text-gray-300 mt-2">Admin Panel</p>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-center">Admin Access</h2>
            
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
            <p className="text-gray-300">Manage verses and monitor users</p>
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

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('verses')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'verses' 
                ? 'bg-mystery-gold text-white' 
                : 'text-gray-300 hover:text-mystery-gold'
            }`}
          >
            Verses ({verses.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-mystery-gold text-white' 
                : 'text-gray-300 hover:text-mystery-gold'
            }`}
          >
            Users ({users.length})
          </button>
        </div>

        {/* Verses Tab */}
        {activeTab === 'verses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manage Verses</h2>
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setEditingVerse(null);
                  setFormData({
                    title: '',
                    description: '',
                    clues: '',
                    answer: '',
                    orderIndex: '',
                    isActive: true
                  });
                }}
                className="btn-primary"
              >
                {showCreateForm ? 'Cancel' : 'Create New Verse'}
              </button>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
              <div className="card mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingVerse ? 'Edit Verse' : 'Create New Verse'}
                </h3>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Order Index</label>
                      <input
                        type="number"
                        value={formData.orderIndex}
                        onChange={(e) => setFormData({...formData, orderIndex: e.target.value})}
                        className="input-field"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="input-field"
                      rows="4"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Clues (Optional)</label>
                    <textarea
                      value={formData.clues}
                      onChange={(e) => setFormData({...formData, clues: e.target.value})}
                      className="input-field"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Answer</label>
                    <input
                      type="text"
                      value={formData.answer}
                      onChange={(e) => setFormData({...formData, answer: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm">Active</label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingVerse ? 'Update Verse' : 'Create Verse'}
                  </button>
                </form>
              </div>
            )}

            {/* Verses List */}
            <div className="grid gap-4">
              {verses.map((verse) => (
                <div key={verse.id} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm bg-mystery-gold text-white px-2 py-1 rounded">
                          #{verse.orderIndex}
                        </span>
                        <h3 className="text-lg font-semibold">{verse.title}</h3>
                        {!verse.isActive && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{verse.description}</p>
                      <p className="text-mystery-gold text-sm">Answer: {verse.answer}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(verse)}
                        className="btn-secondary py-1 px-3 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(verse.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">User Statistics</h2>
            {console.log('Rendering users tab, activeTab:', activeTab, 'users array:', users, 'users.length:', users.length)}

            {users.length === 0 ? (
              <p>No users found</p>
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
                    <div className="text-right text-sm text-gray-400">
                      <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;