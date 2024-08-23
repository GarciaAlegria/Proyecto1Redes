import React, { useState } from 'react';
import { client, xml } from '@xmpp/client';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async (username, fullName, email, password, onSuccess) => {
    try {
      const xmppClient = client({
        service: 'ws://alumchat.lol:7070/ws',
        resource: '',
      });

      return new Promise((resolve, reject) => {
        xmppClient.on('error', (err) => {
          if (err.code === 'ECONERROR') {
            console.error('Connection error', err);
            xmppClient.stop();
            xmppClient.removeAllListeners();
            reject({ status: false, message: 'Error in XMPP Client' });
          }
        });

        xmppClient.on('open', () => {
          console.log('Connection established');
          const iq = xml(
            'iq',
            { type: 'set', to: 'alumchat.lol', id: 'register' },
            xml(
              'query',
              { xmlns: 'jabber:iq:register' },
              xml('username', {}, username),
              xml('fullName', {}, fullName),
              xml('email', {}, email),
              xml('password', {}, password)
            )
          );
          xmppClient.send(iq);
        });

        xmppClient.on('stanza', async (stanza) => {
          if (stanza.is('iq') && stanza.getAttr('id') === 'register') {
            await xmppClient.stop();
            xmppClient.removeAllListeners();
            onSuccess();

            if (stanza.getAttr('type') === 'result') {
              resolve({ status: true, message: 'Successful register' });
            } else if (stanza.getAttr('type') === 'error') {
              console.log('Error in register', stanza);
              const error = stanza.getChild('error');
              if (error?.getChild('conflict')) {
                reject({ status: false, message: 'User already in use' });
              } else {
                reject({ status: false, message: 'An error occurred. Try again!' });
              }
            }
          }
        });

        xmppClient.start().catch((err) => {
          console.log(err);
        });
      });
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(username, fullName, email, password, () => {
        setStatusMessage('Registration successful!');
        alert('Registration successful!');
      });
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlereturnlogin = () => {
    navigate('/');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-400 to-pink-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input
              type="text"
              className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-pink-500 text-white w-full p-2 rounded-lg hover:bg-pink-600 mb-4"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          {statusMessage && (
            <p className="mt-4 text-center text-sm text-red-500">{statusMessage}</p>
          )}
          <button
            onClick={handlereturnlogin}
            className="bg-gray-500 text-white w-full p-2 rounded-lg hover:bg-gray-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
