import React, { useState } from 'react';
import { client, xml } from '@xmpp/client';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // create XMPP client
  const xmppClient = client({
    service: 'ws://alumchat.lol:7070/ws/', 
    domain: 'alumchat.lol', 
    resource: 'client', 
    username, 
    password, 
  });
  // Register event listeners
  xmppClient.on('error', err => {
    console.error('XMPP Error:', err);
    alert('Credenciales incorrectas o error en el servidor XMPP');
  });
  // Event listener for successful login
  xmppClient.on('online', address => {
    console.log('Conectado como:', address.toString());
    // Guardar en sessionStorage
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('password', password);
    navigate('/Home'); // navigate to Home page after successful login
  });
  // Event listener for failed login
  const handleLogin = async () => {
    try {
      await xmppClient.start(); // start the XMPP client
    } catch (err) {
      console.error('Login failed:', err);
      alert('No se pudo iniciar sesión, revisa tus credenciales');
    }
  };
  // Event listener for Register button
  const handleRegister = () => {
    navigate('/Register'); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        <input
          type="text"
          placeholder="Username without @alumchat.lol"
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
        <div className="flex justify-between">
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white w-full p-2 rounded-lg hover:bg-blue-600 mr-2"
          >
            Login
          </button>
          <button
            onClick={handleRegister}
            className="bg-gray-500 text-white w-full p-2 rounded-lg hover:bg-gray-600"
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
