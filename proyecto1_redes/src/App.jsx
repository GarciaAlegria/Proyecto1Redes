import React, { useEffect, useState } from 'react';
import { client, xml } from '@xmpp/client';
import './index.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactJid, setNewContactJid] = useState('');
  const [xmppClient, setXmppClient] = useState(null);

  useEffect(() => {
    const xmppClientInstance = client({
      service: 'ws://alumchat.lol:7070/ws/',
      domain: 'alumchat.lol',
      resource: '',
      username: 'gar21285',
      password: 'abner3210',
    });

    xmppClientInstance.on('online', async () => {
      console.log('Connected to XMPP server');
      setConnected(true);
      setXmppClient(xmppClientInstance);  // Set the client instance to state

      try {
        await xmppClientInstance.send(xml('presence'));
        console.log('Presence sent');
      } catch (error) {
        console.error('Error sending presence:', error);
      }

      const rosterIq = xml(
        'iq',
        { type: 'get', id: 'roster_1' },
        xml('query', { xmlns: 'jabber:iq:roster' })
      );
      console.log('Sending roster request:', rosterIq.toString());
      xmppClientInstance.send(rosterIq);
    });

    xmppClientInstance.on('stanza', (stanza) => {
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
        const type = stanza.attrs.type || 'available';
        const show = stanza.getChildText('show');

        let presenceType;
        if (type === 'unavailable') {
          presenceType = 'unavailable';
        } else if (show) {
          presenceType = show;
        } else {
          presenceType = 'available';
        }

        console.log(`Presence update for ${from}:`, presenceType);

        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.jid === from ? { ...contact, presenceType } : contact
          )
        );

        // Manejar la aceptación de la solicitud de amistad
        if (type === 'subscribed') {
          console.log(`${from} accepted your friend request.`);
        } else if (type === 'subscribe') {
          console.log(`${from} wants to be your friend.`);
          // Aquí podrías enviar una respuesta automática de aceptación
          const presenceSubscribed = xml('presence', { to: from, type: 'subscribed' });
          xmppClientInstance.send(presenceSubscribed);
        }
      }
    });

    xmppClientInstance.on('offline', () => {
      console.log('Disconnected from XMPP server');
      setConnected(false);
    });

    xmppClientInstance.on('error', (error) => {
      console.error('XMPP error:', error);
      setConnected(false);
    });

    xmppClientInstance.start().catch((error) => {
      console.error('Error starting XMPP client:', error);
    });

    return () => {
      if (xmppClientInstance) {
        xmppClientInstance.stop().catch((error) => {
          console.error('Error stopping XMPP client:', error);
        });
      }
    };
  }, []);

  const handleAddContact = () => {
    setShowAddContact(!showAddContact);
  };

  const handleSendContactRequest = async () => {
    if (newContactJid) {
      try {
        // Enviar solicitud de amistad (presencia tipo subscribe)
        const presenceSubscribe = xml('presence', { to: newContactJid, type: 'subscribe' });
        console.log(`Sending friend request to ${newContactJid}:`, presenceSubscribe.toString());
        await xmppClient.send(presenceSubscribe);
      } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Error sending friend request');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white">
      <div className="w-full h-fit p-4 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden text-black">
        <h1 className="text-4xl font-bold mb-6 text-center">XMPP Chat App</h1>
        <p className={`mb-6 text-center ${connected ? 'text-green-300' : 'text-red-300'}`}>
          Status: {connected ? 'Connected' : 'Disconnected'}
        </p>

        <div id="app">
          <div className="flex h-full w-full">
            <div className="bg-indigo-700 p-4 w-1/4 border-r border-gray-300 flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-4">
                <h2 className="text-xl font-semibold">Contactos</h2>
                <button 
                  onClick={handleAddContact} 
                  className="ml-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-green-600">
                  +
                </button>
              </div>

              {showAddContact && (
                <div className="w-full mb-4 bg-white p-2 rounded-lg">
                  <input
                    type="text"
                    placeholder="Enter contact JID"
                    value={newContactJid}
                    onChange={(e) => setNewContactJid(e.target.value)}
                    className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                  />
                  <button 
                    onClick={handleSendContactRequest} 
                    className="w-full bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700">
                    Enviar
                  </button>
                </div>
              )}

              <div className="w-full bg-white border border-gray-300 rounded-lg p-2 overflow-y-auto max-h-full">
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

            <div className="flex flex-col w-3/4 p-4 bg-gray-50">
              <div className="flex-grow bg-gray-100 border border-gray-300 rounded-lg p-4 overflow-auto">
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
      </div>
    </div>
  );
}

export default App;
