import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Clock, User, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Alert from './Alert';
import CommentHistory from './CommentHistory';

const CommentSection = ({ page, permissions }) => {
  const { token, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [page]);

  const fetchComments = async () => {
    setLoading(true);
    const result = await api.getComments(page, token);
    if (result.success) {
      setComments(result.data);
    } else {
      setAlert({ type: 'error', message: 'Failed to load comments' });
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newComment.trim()) return;
    
    setLoading(true);
    const result = await api.createComment({ page, content: newComment }, token);
    if (result.success) {
      setNewComment('');
      setAlert({ type: 'success', message: 'Comment added successfully' });
      fetchComments(); 
    } else {
      setAlert({ type: 'error', message: result.error });
    }
    setLoading(false);
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    
    setLoading(true);
    const result = await api.updateComment(id, { content: editText }, token);
    if (result.success) {
      setEditingId(null);
      setEditText('');
      setAlert({ type: 'success', message: 'Comment updated successfully' });
      setComments(prev => prev.map(comment => 
        comment.id === id 
          ? { ...comment, content: editText, updated_at: new Date().toISOString() }
          : comment
      ));
    } else {
      setAlert({ type: 'error', message: result.error });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    const originalComments = [...comments];
    
    setComments(prev => prev.filter(comment => comment.id !== id));
    setDeletingId(id);
    
    const result = await api.deleteComment(id, token);
    setDeletingId(null);
    
    if (!result.success) {
      setComments(originalComments);
      setAlert({ type: 'error', message: result.error });
    } else {
      setAlert({ type: 'success', message: 'Comment deleted successfully' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <div className="space-y-4">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {permissions?.create && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows="3"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !newComment.trim()}
            className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {loading && comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No comments yet.</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {editingId === comment.id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{comment.user_name || comment.user_email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                      {comment.created_at !== comment.updated_at && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Edited
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isSuperAdmin && comment.user && (
                        <button
                          onClick={() => setShowHistory(comment.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      )}
                      {permissions?.edit && (
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditText(comment.content);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Comment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {permissions?.delete && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Delete Comment"
                        >
                          {deletingId === comment.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showHistory && (
        <CommentHistory
          commentId={showHistory}
          onClose={() => setShowHistory(null)}
        />
      )}
    </div>
  );
};

export default CommentSection;