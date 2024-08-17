import React, { useEffect, useState } from 'react';
import { client, xml } from '@xmpp/client';
import './index.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chattingContact, setChattingContact] = useState(null);  // Nuevo estado para el contacto con el que se está chateando
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
      setXmppClient(xmppClientInstance);

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
          statusMessage: '',
        }));
        console.log('Roster received:', contactList);
        setContacts(contactList);
      } else if (stanza.is('presence')) {
        const from = stanza.attrs.from.split('/')[0];
        const type = stanza.attrs.type || 'available';
        const show = stanza.getChildText('show');
        const statusMessage = stanza.getChildText('status') || '';

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
            contact.jid === from ? { ...contact, presenceType, statusMessage } : contact
          )
        );

        if (type === 'subscribed') {
          console.log(`${from} accepted your friend request.`);
        } else if (type === 'subscribe') {
          console.log(`${from} wants to be your friend.`);
          const presenceSubscribed = xml('presence', { to: from, type: 'subscribed' });
          xmppClientInstance.send(presenceSubscribed);
        }
      } else if (stanza.is('message')) {
        const from = stanza.attrs.from.split('/')[0];
        const body = stanza.getChildText('body');

        if (body && from === chattingContact?.jid) {
          console.log(`Message from ${from}:`, body);
          setChattingContact((prev) => ({
            ...prev,
            messages: [...prev.messages, { from, body }],
          }));
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
        const presenceSubscribe = xml('presence', { to: newContactJid, type: 'subscribe' });
        console.log(`Sending friend request to ${newContactJid}:`, presenceSubscribe.toString());
        await xmppClient.send(presenceSubscribe);
      } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Error sending friend request');
      }
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setChattingContact(null); // Limpiar el chat si seleccionas detalles del contacto
  };

  const handleStartChat = (contact) => {
    setChattingContact({ ...contact, messages: [] });
    setSelectedContact(null); // Limpiar los detalles si seleccionas chatear
  };

  const handleSendMessage = async () => {
    if (chattingContact && newMessage) {
      const messageStanza = xml(
        'message',
        { to: chattingContact.jid, type: 'chat' },
        xml('body', {}, newMessage)
      );

      try {
        await xmppClient.send(messageStanza);
        setChattingContact((prev) => ({
          ...prev,
          messages: [...prev.messages, { from: 'me', body: newMessage }],
        }));
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
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
                    <div key={contact.jid} className="p-2 border-b border-gray-200 hover:bg-indigo-100 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className={`text-sm ${contact.presenceType === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                          {contact.presenceType}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSelectContact(contact)}
                          className="bg-blue-600 text-white rounded-lg px-2 py-1 hover:bg-blue-700">
                          i
                        </button>
                        <button
                          onClick={() => handleStartChat(contact)}
                          className="bg-green-600 text-white rounded-lg px-2 py-1 hover:bg-green-700">
                          Chat
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No contacts available</p>
                )}
              </div>
            </div>

            <div className="flex-1 p-4">
              {selectedContact && (
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-2">Detalles del Contacto</h2>
                  <p className="mb-2"><strong>JID:</strong> {selectedContact.jid}</p>
                  <p className="mb-2"><strong>Nombre:</strong> {selectedContact.name}</p>
                  <p className="mb-2"><strong>Estado:</strong> {selectedContact.presenceType}</p>
                  <p className="mb-2"><strong>Mensaje de estado:</strong> {selectedContact.statusMessage}</p>
                </div>
              )}

              {chattingContact && (
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full">
                  <h2 className="text-xl font-semibold mb-2">Chat con {chattingContact.name}</h2>
                  <div className="flex-1 overflow-y-auto mb-4 p-2 bg-gray-200 rounded-lg">
                    {chattingContact.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`p-2 my-1 rounded-lg ${message.from === 'me' ? 'bg-green-500 text-white self-end' : 'bg-blue-500 text-white'}`}>
                        {message.body}
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 p-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="ml-2 bg-blue-600 text-white rounded-lg px-4 hover:bg-blue-700">
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
