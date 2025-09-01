import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AccountsManager from '../components/AccountsManager';
import PagesManager from '../components/PagesManager';
import VideoUpload from '../components/VideoUpload';
import PostComposer from '../components/PostComposer';
import History from '../components/History';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const { currentUser, logout } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'accounts':
        return <AccountsManager />;
      case 'pages':
        return <PagesManager />;
      case 'upload':
        return <VideoUpload />;
      case 'post':
        return <PostComposer />;
      case 'history':
        return <History />;
      default:
        return <AccountsManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Facebook Video Scheduler</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Welcome, {currentUser?.email}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg mb-8">
          <nav className="flex flex-col sm:flex-row">
            {['accounts', 'pages', 'upload', 'post', 'history'].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
