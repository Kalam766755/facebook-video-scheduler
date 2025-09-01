import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AccountsManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/api/accounts');
      setAccounts(response.data);
    } catch (error) {
      setError('Failed to fetch accounts');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return setError('Account name is required');
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (editingId) {
        await axios.put(`/api/accounts/${editingId}`, { name });
        setEditingId(null);
      } else {
        await axios.post('/api/accounts', { name });
      }
      
      setName('');
      fetchAccounts();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save account');
    }
    
    setLoading(false);
  };

  const handleEdit = (account) => {
    setName(account.name);
    setEditingId(account._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    
    try {
      await axios.delete(`/api/accounts/${id}`);
      fetchAccounts();
    } catch (error) {
      setError('Failed to delete account');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Facebook Accounts</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter account name"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
          >
            {loading ? 'Saving...' : editingId ? 'Update' : 'Add Account'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName('');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Your Accounts ({accounts.length}/5)</h3>
        {accounts.length === 0 ? (
          <p className="text-sm text-gray-500">No accounts added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <li key={account._id} className="py-3 flex justify-between items-center">
                <span className="text-sm text-gray-900">{account.name}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(account)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(account._id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AccountsManager;
