import React from "react";
import Dropdown from "./Dropdown";
import Card from "./Card";

const CLIENT_ID = "85b930d6091120a6e6f0";
const REDIRECT_URI = "http://localhost:3000/dashboard";

const Login: React.FC = () => {
  const handleLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user,repo&redirect_uri=${REDIRECT_URI}`;
  };

  return (
    <div className={"login-container"}>
      <Card>
        <h1 className={"title"}>Welcome to Creative Login</h1>
        {/* <input
          className={"input-field"}
          type="text"
          placeholder="Username or email address"
        />
        <input
          className={"input-field"}
          type="password"
          placeholder="Password"
        /> */}
        <button onClick={handleLogin} className={"github-button"}>
          <span className={"icon"}>🔗</span>
          Continue with GitHub
        </button>
      </Card>

      {/* <div className={"login-card "}></div> */}
    </div>
    // <div className='login_page'>
    //   <div className='login_container'>
    //   <h1>Login with GitHub</h1>
    //   <button >Login</button>
    // </div>
    // </div>
  );
};

export default Login;
