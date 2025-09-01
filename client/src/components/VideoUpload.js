import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const VideoUpload = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await axios.get('/api/upload');
      setUploads(response.data);
    } catch (error) {
      setError('Failed to fetch uploads');
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('video', file);
    });

    try {
      await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchUploads();
    } catch (error) {
      setError('Failed to upload video');
    }
    
    setLoading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    multiple: true
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await axios.delete(`/api/upload/${id}`);
      fetchUploads();
    } catch (error) {
      setError('Failed to delete video');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Video Upload</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-indigo-600">Drop the videos here...</p>
        ) : (
          <div>
            <p className="text-gray-600">Drag & drop videos here, or click to select files</p>
            <p className="text-sm text-gray-500 mt-1">Supported formats: MP4, MOV, AVI, MKV</p>
          </div>
        )}
      </div>
      
      {loading && (
        <div className="mt-4 text-center">
          <p className="text-gray-600">Uploading...</p>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Videos</h3>
        {uploads.length === 0 ? (
          <p className="text-sm text-gray-500">No videos uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {uploads.map((upload) => (
              <li key={upload._id} className="py-3 flex justify-between items-center">
                <span className="text-sm text-gray-900">{upload.originalName}</span>
                <div className="flex space-x-2">
                  <span className="text-xs text-gray-500">
                    {Math.round(upload.size / 1024 / 1024)} MB
                  </span>
                  <button
                    onClick={() => handleDelete(upload._id)}
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

export default VideoUpload;
