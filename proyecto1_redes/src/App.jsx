import React, { useEffect, useState } from 'react';
import { client, xml } from '@xmpp/client';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const xmppClient = client({
      service: 'ws://alumchat.lol:7070/ws/',
      domain: 'alumchat.lol',
      resource: '',
      username: 'gar21285',
      password: 'abner3210',
    });

    xmppClient.on('online', async () => {
      console.log('Connected to XMPP server');
      setConnected(true);

      const rosterIq = xml(
        'iq',
        { type: 'get', id: 'roster_1' },
        xml('query', { xmlns: 'jabber:iq:roster' })
      );
      console.log('Sending roster request:', rosterIq.toString());
      xmppClient.send(rosterIq);
    });

    xmppClient.on('stanza', (stanza) => {
      console.log('Stanza received:', stanza.toString());

      if (stanza.is('iq') && stanza.getChild('query', 'jabber:iq:roster')) {
        const items = stanza.getChild('query').getChildren('item');
        const contactList = items.map((item) => ({
          jid: item.attrs.jid,
          name: item.attrs.name || item.attrs.jid,
          presenceType: 'unavailable',
        }));
        console.log('Roster received:', contactList);
        setContacts(contactList);
      } else if (stanza.is('presence')) {
        const from = stanza.attrs.from.split('/')[0];
        const presenceType = stanza.attrs.type || 'available';
        console.log(`Presence update for ${from}:`, presenceType);

        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.jid === from ? { ...contact, presenceType } : contact
          )
        );
        console.log('Updated contacts:', contacts);
      }
    });

    xmppClient.on('offline', () => {
      console.log('Disconnected from XMPP server');
      setConnected(false);
    });

    xmppClient.on('error', (error) => {
      console.error('XMPP error:', error);
      setConnected(false);
    });

    xmppClient.start().catch((error) => {
      console.error('Error starting XMPP client:', error);
    });

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

      <div className="chat-container">
        {/* Sección de botones */}
        <div className="section section-buttons">
          <h2>Buttons</h2>
          {/* Aquí se añadiran botones a futuro */}
        </div>

        {/* Sección de chats (ahora vacía) */}
        <div className="section section-chats">
          <h2>Chats</h2>
          {/* Aquí se mostrarían los chats */}
        </div>

        {/* Sección de mensajes y entrada de texto */}
        <div className="section section-messages">
          <div className="messages">
            {/* Aquí se mostrarían los mensajes */}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
            />
            <button>Send</button> {/* Botón de envío que no hace nada */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
