import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PostComposer = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState('');
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAccounts();
    fetchUploads();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchPages();
    } else {
      setPages([]);
      setSelectedPage('');
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
      if (response.data.length > 0 && !selectedPage) {
        setSelectedPage(response.data[0]._id);
      }
    } catch (error) {
      setError('Failed to fetch pages');
    }
  };

  const fetchUploads = async () => {
    try {
      const response = await axios.get('/api/upload');
      setUploads(response.data);
      if (response.data.length > 0 && !selectedUpload) {
        setSelectedUpload(response.data[0]._id);
      }
    } catch (error) {
      setError('Failed to fetch uploads');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAccount || !selectedPage || !selectedUpload) {
      return setError('Please select an account, page, and video');
    }
    
    if (scheduleType === 'later' && !scheduledTime) {
      return setError('Please select a schedule time');
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const postData = {
        accountId: selectedAccount,
        pageId: selectedPage,
        uploadId: selectedUpload
      };
      
      if (scheduleType === 'later') {
        postData.scheduledTime = new Date(scheduledTime).toISOString();
      }
      
      await axios.post('/api/posts', postData);
      
      setSuccess(
        scheduleType === 'now' 
          ? 'Video posted successfully!' 
          : 'Video scheduled successfully!'
      );
      
      // Reset form
      setScheduleType('now');
      setScheduledTime('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create post');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Post to Facebook</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
              Select Account
            </label>
            <select
              id="account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="page" className="block text-sm font-medium text-gray-700 mb-1">
              Select Page
            </label>
            <select
              id="page"
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              disabled={!selectedAccount || pages.length === 0}
            >
              {pages.length === 0 ? (
                <option value="">No pages available</option>
              ) : (
                pages.map((page) => (
                  <option key={page._id} value={page._id}>
                    {page.name}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
              Select Video
            </label>
            <select
              id="video"
              value={selectedUpload}
              onChange={(e) => setSelectedUpload(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              disabled={uploads.length === 0}
            >
              {uploads.length === 0 ? (
                <option value="">No videos available</option>
              ) : (
                uploads.map((upload) => (
                  <option key={upload._id} value={upload._id}>
                    {upload.originalName}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="now"
                  checked={scheduleType === 'now'}
                  onChange={() => setScheduleType('now')}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Post Now</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="later"
                  checked={scheduleType === 'later'}
                  onChange={() => setScheduleType('later')}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Schedule Later</span>
              </label>
            </div>
          </div>
          
          {scheduleType === 'later' && (
            <div>
              <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Time
              </label>
              <input
                type="datetime-local"
                id="scheduledTime"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required={scheduleType === 'later'}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
        >
          {loading ? 'Posting...' : scheduleType === 'now' ? 'Post Now' : 'Schedule Post'}
        </button>
      </form>
    </div>
  );
};

export default PostComposer;
