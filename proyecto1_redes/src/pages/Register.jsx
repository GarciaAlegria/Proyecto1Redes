import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client as xmppClient } from '@xmpp/client'; // Necesitarás instalar esta librería

function Register() {
  const [server, setServer] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const jid = `${username}@${server}`;
      const client = xmppClient({
        service: `wss://${server}/ws`,
        domain: server,
        username: username,
        password: password,
      });

      client.start().catch(console.error);

      client.on('online', async (address) => {
        console.log('Connected as:', address.toString());
        alert('Account created successfully');
        client.stop();
      });

      client.on('error', (err) => {
        console.error(err);
        alert('Failed to create account');
      });
    } catch (error) {
      console.error('Error registering:', error);
      alert('Failed to create account');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-400 to-pink-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>
        <input
          type="text"
          placeholder="Server"
          value={server}
          onChange={(e) => setServer(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-6 p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleRegister}
          className="bg-pink-500 text-white w-full p-2 rounded-lg hover:bg-pink-600 mb-4"
        >
          Register
        </button>
        <button
          onClick={handleLoginRedirect}
          className="bg-gray-500 text-white w-full p-2 rounded-lg hover:bg-gray-600"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Register;
