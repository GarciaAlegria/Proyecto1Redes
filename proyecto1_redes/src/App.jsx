import React, { useEffect, useState } from 'react';
import { client, xml } from '@xmpp/client';
import './index.css';

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
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-600 to-blue-500 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-6">XMPP Chat App</h1>
      <p className={`mb-6 ${connected ? 'text-green-300' : 'text-red-300'}`}>
        Status: {connected ? 'Connected' : 'Disconnected'}
      </p>

      <div className="flex h-96 w-full max-w-5xl bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden text-black">
        {/* Sección de contactos */}
        <div className="bg-indigo-700 p-4 w-1/4 border-r border-gray-300 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Contactos</h2>
          <div className="w-full bg-white border border-gray-300 rounded-lg p-2 overflow-y-auto max-h-80">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <div key={contact.jid} className="p-2 border-b border-gray-200 hover:bg-indigo-100">
                  <p className="font-medium">{contact.name}</p>
                  <p className={`text-sm ${contact.presenceType === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                    {contact.presenceType}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center">No contacts available</p>
            )}
          </div>
        </div>

        {/* Sección de chat */}
        <div className="flex flex-col w-3/4 p-4 bg-gray-50">
          <div className="flex-grow bg-gray-100 border border-gray-300 rounded-lg p-4 overflow-auto">
            {/* Aquí se mostrarían los mensajes */}
          </div>
          <div className="flex items-center mt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow p-3 border border-gray-300 rounded-lg mr-2 bg-white text-black"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
