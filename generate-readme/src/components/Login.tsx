import React from 'react';

const CLIENT_ID = '85b930d6091120a6e6f0';
const REDIRECT_URI = 'http://localhost:3000/dashboard';

const Login: React.FC = () => {
  const handleLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user,repo&redirect_uri=${REDIRECT_URI}`;
  };

  return (
    <div>
      <h1>Login with GitHub</h1>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
