
export const tokenManager = {
  getToken: () => localStorage.getItem('access_token'),
  setToken: (token) => localStorage.setItem('access_token', token),
  removeToken: () => localStorage.removeItem('access_token'),
  
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setRefreshToken: (token) => localStorage.setItem('refresh_token', token),
  removeRefreshToken: () => localStorage.removeItem('refresh_token'),
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('user'),
  
  clearAll: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

// Session management
export const sessionManager = {
  lastActivity: Date.now(),
  
  init: () => {
    // Reset activity timer on user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => {
        sessionManager.lastActivity = Date.now();
      });
    });
    
    // Check session every minute
    setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - sessionManager.lastActivity;
      const oneHour = 60 * 60 * 1000; 
      
      if (inactiveTime > oneHour) {
        sessionManager.logout();
      }
    }, 60000); // Check every minute
  },
  
  logout: () => {
    tokenManager.clearAll();
    window.location.href = '/login';
  }
};