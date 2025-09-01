import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PagesManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [pages, setPages] = useState([]);
  const [name, setName] = useState('');
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [pageToken, setPageToken] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchPages();
    } else {
      setPages([]);
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/api/accounts');
      setAccounts(response.data);
      if (response.data.length > 0 && !selectedAccount) {
        setSelectedAccount(response.data[0]._id);
      }
    } catch (error) {
      setError('Failed to fetch accounts');
    }
  };

  const fetchPages = async () => {
    try {
      const response = await axios.get(`/api/pages/${selectedAccount}`);
      setPages(response.data);
    } catch (error) {
      setError('Failed to fetch pages');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !appId.trim() || !appSecret.trim() || !pageToken.trim()) {
      return setError('All fields are required');
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (editingId) {
        await axios.put(`/api/pages/${editingId}`, {
          name,
          appId,
          appSecret,
          pageToken
        });
        setEditingId(null);
      } else {
        await axios.post('/api/pages', {
          accountId: selectedAccount,
          name,
          appId,
          appSecret,
          pageToken
        });
      }
      
      setName('');
      setAppId('');
      setAppSecret('');
      setPageToken('');
      fetchPages();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save page');
    }
    
    setLoading(false);
  };

  const handleEdit = (page) => {
    setName(page.name);
    setAppId(page.appId);
    setAppSecret(page.appSecret);
    setPageToken(page.pageToken);
    setEditingId(page._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    
    try {
      await axios.delete(`/api/pages/${id}`);
      fetchPages();
    } catch (error) {
      setError('Failed to delete page');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Facebook Pages</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
          Select Account
        </label>
        <select
          id="account"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {accounts.map((account) => (
            <option key={account._id} value={account._id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Page Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter page name"
            />
          </div>
          <div>
            <label htmlFor="appId" className="block text-sm font-medium text-gray-700 mb-1">
              App ID
            </label>
            <input
              type="text"
              id="appId"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter App ID"
            />
          </div>
          <div>
            <label htmlFor="appSecret" className="block text-sm font-medium text-gray-700 mb-1">
              App Secret
            </label>
            <input
              type="password"
              id="appSecret"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter App Secret"
            />
          </div>
          <div>
            <label htmlFor="pageToken" className="block text-sm font-medium text-gray-700 mb-1">
              Page Token
            </label>
            <input
              type="password"
              id="pageToken"
              value={pageToken}
              onChange={(e) => setPageToken(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter Page Token"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
          >
            {loading ? 'Saving...' : editingId ? 'Update' : 'Add Page'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName('');
                setAppId('');
                setAppSecret('');
                setPageToken('');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Pages for {accounts.find(a => a._id === selectedAccount)?.name} ({pages.length}/10)
        </h3>
        {pages.length === 0 ? (
          <p className="text-sm text-gray-500">No pages added yet for this account.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {pages.map((page) => (
              <li key={page._id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-900">{page.name}</span>
                  <p className="text-xs text-gray-500">App ID: {page.appId}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(page)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(page._id)}
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

export default PagesManager;
