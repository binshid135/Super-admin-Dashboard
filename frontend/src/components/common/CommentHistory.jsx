import React, { useState, useEffect } from 'react';
import { X, User, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LoadingSpinner from './LoadingSpinner';

const CommentHistory = ({ commentId, onClose }) => {
  const { token, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (commentId && (user?.is_superuser || user?.role === 'superadmin')) {
      fetchHistory();
    }
  }, [commentId, user]);

  const fetchHistory = async () => {
    const result = await api.getCommentHistory(commentId, token);
    console.log("Comment History:", result);
    if (result.success) {
      setHistory(result.data);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user?.is_superuser && user?.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Comment History</h2>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <LoadingSpinner text="Loading history..." />
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No history available for this comment.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <div key={record.id} className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    <span>{record.modified_by_name || record.modified_by_email}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{formatDate(record.modified_at)}</span>
                  </div>
                  
                  {index === history.length - 1 ? (
                    <div>
                      <p className="text-gray-800 whitespace-pre-wrap">{record.new_content}</p>
                      <span className="text-xs text-green-600 font-medium">Created</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-red-600 font-medium">Before:</span>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap line-through">
                          {record.old_content}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-green-600 font-medium">After:</span>
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">
                          {record.new_content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentHistory;