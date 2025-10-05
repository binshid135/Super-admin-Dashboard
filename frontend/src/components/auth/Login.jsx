import React, { useState } from 'react';
import LoginSelection from './LoginSelection';
import SuperAdminLogin from './SuperAdminLogin';
import UserLogin from './UserLogin';

const Login = () => {
  const [loginType, setLoginType] = useState('selection'); 

  const handleBackToSelection = () => {
    setLoginType('selection');
  };

  if (loginType === 'superadmin') {
    return (
      <SuperAdminLogin
        onSwitchToUser={() => setLoginType('user')}
        onBack={handleBackToSelection}
      />
    );
  }

  if (loginType === 'user') {
    return (
      <UserLogin
        onSwitchToSuperAdmin={() => setLoginType('superadmin')}
        onBack={handleBackToSelection}
      />
    );
  }

  return (
    <LoginSelection
      onSelectSuperAdmin={() => setLoginType('superadmin')}
      onSelectUser={() => setLoginType('user')}
    />
  );
};

export default Login;