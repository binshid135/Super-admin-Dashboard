const API_BASE_URL = '/api';


const handleResponse = async (response) => {
  if (response.ok) {
    const data = await response.json();
    return { success: true, data };
  } else {
    const error = await response.json();
    return { success: false, error: error.detail || error.error || 'Something went wrong' };
  }
};

export const api = {
 
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    console.log('Login response:', response);
    return handleResponse(response);
  },
  
  register: async (userData, token) => {
    console.log('Registering user with data:', userData,token);
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    console.log('Register response:', response);
    return handleResponse(response);
  },
  
  refreshToken: async (refresh) => {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    return handleResponse(response);
  },


  changePassword: async (data, token) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  passwordResetRequest: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  passwordResetVerify: async (data) => {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset/verify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },


  getUsers: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  updateProfile: async (data, token) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },


  getPermissions: async (token) => {
    const response = await fetch(`${API_BASE_URL}/permissions/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  updateUserPermissions: async (userId, permissions, token) => {
    console.log('Updating permissions for user:', userId, permissions);
    const response = await fetch(`${API_BASE_URL}/permissions/update/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ user_id: userId, permissions })
    });
    console.log('Update permissions response:', response);
    return handleResponse(response);
  },

  getMyPermissions: async (token) => {
    console.log('Fetching my permissions with token:', token);
    const response = await fetch(`${API_BASE_URL}/permissions/my-permissions/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('My permissions response:', response);
    return handleResponse(response);
  },

 
  getComments: async (page, token) => {
    const response = await fetch(`${API_BASE_URL}/comments/?page=${page}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  createComment: async (data, token) => {
    const response = await fetch(`${API_BASE_URL}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateComment: async (id, data, token) => {
    console.log('Updating comment with id:', id, data);
    const response = await fetch(`${API_BASE_URL}/comments/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    console.log('Update comment response:', response);
    return handleResponse(response);
  },

  deleteComment: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/comments/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  getCommentHistory: async (commentId, token) => {
    const response = await fetch(`${API_BASE_URL}/comments/history/${commentId}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Comment history response:', response);
    return handleResponse(response);
  },

  deleteUser: async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/auth/users/delete/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ user_id: userId })
  });
  return handleResponse(response);
},


};