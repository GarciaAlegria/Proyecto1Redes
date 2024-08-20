import React, { useState } from 'react';
import { client, xml } from '@xmpp/client';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === 'gar21285' && password === 'abner3210') {
      navigate('/Home'); 
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white w-full p-2 rounded-lg hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
