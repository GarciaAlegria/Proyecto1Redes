import React, { useEffect, useState } from 'react';
import { client } from '@xmpp/client';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [clientInstance, setClientInstance] = useState(null);

  useEffect(() => {
    // Configura el cliente XMPP
    const xmppClient = client({
      service: 'ws://alumchat.lol:7070/ws/',
      domain: 'alumchat.lol',
      resource: 'web',
      username: 'gar21285',
      password: 'abner3210',
    });

    // Maneja los eventos
    xmppClient.on('online', () => {
      console.log('Connected to XMPP server');
      setConnected(true);
    });

    xmppClient.on('offline', () => {
      console.log('Disconnected from XMPP server');
      setConnected(false);
    });

    xmppClient.on('error', (error) => {
      console.error('XMPP error:', error);
      setConnected(false);
    });

    xmppClient.on('stanza', (stanza) => {
      console.log('Stanza received:', stanza);
    });

    // Inicia el cliente XMPP
    xmppClient.start().catch((error) => {
      console.error('Error starting XMPP client:', error);
    });

    // Limpiar al desmontar el componente
    setClientInstance(xmppClient);
    return () => {
      if (xmppClient) {
        xmppClient.stop().catch((error) => {
          console.error('Error stopping XMPP client:', error);
        });
      }
    };
  }, []);

  return (
    <div className="App">
      <h1>XMPP with React</h1>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
    </div>
  );
}

export default App;
