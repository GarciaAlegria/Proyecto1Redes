import React, { useEffect, useState } from 'react';
import { client, xml } from '@xmpp/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const domain = 'alumchat.lol';
const service = 'ws://alumchat.lol:7070/ws/';

function App() {
  const [connected, setConnected] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactJid, setNewContactJid] = useState('');
  const [xmppClient, setXmppClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Offline');
  const [showPresenceInput, setShowPresenceInput] = useState(false);
  const [presenceMessage, setPresenceMessage] = useState('');

  useEffect(() => {
    const xmppClientInstance = client({
      service: service,
      domain: domain,
      username: 'gar21285', // Use your username
      password: 'abner3210', // Use your password
    });

    xmppClientInstance.on('online', async (main) => {
      console.log('Connected to XMPP server, Connected as', main.toString());
      setConnected(true);
      setXmppClient(xmppClientInstance);

      const roStanza = xml('iq', { type: 'get' }, xml('query', { xmlns: 'jabber:iq:roster' }));
      const Resultros = await xmppClientInstance.iqCaller.request(roStanza);
      const Itemsros = Resultros.getChild('query').getChildren('item');
      const Listcontac = Itemsros.map(item => ({
        jid: item.attr('jid'),
        name: item.attr('name') || item.attr('jid'),
        presenceType: 'unavailable',
        statusMessage: '',
      }));
      setContacts(Listcontac);

      Listcontac.forEach(contact => {
        const presenceStanza = xml('presence', { to: contact.jid, type: 'subscribe' });
        xmppClientInstance.send(presenceStanza);
      });

      await xmppClientInstance.send(xml('presence'));
      setStatus('Online');
    });

    xmppClientInstance.on('offline', () => {
      console.log('Disconnected from XMPP server');
      setConnected(false);
    });

    xmppClientInstance.on('stanza', async (stanza) => {
      if (stanza.is('message') && stanza.getChild('body')) {
        const froms = stanza.attr('from');
        const from = froms.split('/')[0];
        const body = stanza.getChild('body')?.text();
        
        // Mostrar notificación cuando se reciba un mensaje
        toast.info(`New message from ${from}: ${body}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setMessages((prevMessages) => [...prevMessages, { from, body }]);
      } else if (stanza.is('presence')) {
        const from = stanza.attr('from').split('/')[0];
        const type = stanza.attr('type');
        const show = stanza.getChild('show')?.text();
        const statusMessage = stanza.getChildText('status') || '';
        let presenceType;
        if (type === 'unavailable') {
          presenceType = 'unavailable';
        } else if (show) {
          presenceType = show;
        } else {
          presenceType = 'available';
        }
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.jid === from ? { ...contact, presenceType, statusMessage } : contact
          )
        );
      }
    });

    xmppClientInstance.start().catch(console.error);

    return () => {
      xmppClientInstance.stop().catch(console.error);
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (xmppClient && newMessage.trim() && selectedContact) {
      setMessages((prevMessages) => [...prevMessages, { from: 'gar21285', body: newMessage, to: selectedContact.jid }]);
      const message = xml(
        'message',
        { type: 'chat', to: selectedContact.jid },
        xml('body', {}, newMessage)
      );
      xmppClient.send(message);
      setNewMessage('');
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleSetPresence = () => {
    setShowPresenceInput(!showPresenceInput);
  };

  const handleSendPresence =  () => {
    if (client && presenceMessage.trim()) {
      const presence = xml('presence', {}, xml('status', {}, presenceMessage));
      xmppClient.send(presence);
      setPresenceMessage('');
      setShowPresenceInput(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white">
      <div className="w-full h-fit p-4 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden text-black">
        <h1 className="text-4xl font-bold mb-6 text-center">XMPP Chat App</h1>
        <p className={`mb-6 text-center ${connected ? 'text-green-300' : 'text-red-300'}`}>
          Status: {connected ? status : 'Disconnected'}
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
                <button
                  onClick={handleSetPresence}
                  className="ml-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-yellow-600">
                  😊
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
              {showPresenceInput && (
                <div className="w-full mb-4 bg-white p-2 rounded-lg">
                  <input
                    type="text"
                    placeholder="Enter presence message"
                    value={presenceMessage}
                    onChange={(e) => setPresenceMessage(e.target.value)}
                    className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleSendPresence}
                    className="w-full bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700">
                    Send
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
                      <button 
                        onClick={() => handleSelectContact(contact)} 
                        className="ml-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600">
                        i
                      </button>
                    </div>
                  ))
                ) : (  
                  <p className="text-center">No contacts available</p>
                )}
              </div>
            </div>

            <div className="flex flex-col w-3/4 p-4 bg-gray-50">
              <div className="flex-grow bg-gray-100 border border-gray-300 rounded-lg p-4 overflow-auto">
                {selectedContact ? (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Detalles del contacto</h2>
                    <p><strong>JID:</strong> {selectedContact.jid}</p>
                    <p><strong>Nombre:</strong> {selectedContact.name}</p>
                    <p><strong>Estado:</strong> {selectedContact.presenceType}</p>
                    <p><strong>Mensaje de estado:</strong> {selectedContact.statusMessage}</p>
                    <div className="mt-4">
                      <h3 className="text-xl font-semibold">Conversación</h3>
                      <div className="mt-2 bg-white border border-gray-300 rounded-lg p-2 max-h-80 overflow-y-auto">
                        {messages
                          .filter(msg => msg.from === selectedContact.jid || msg.to === selectedContact.jid).map((msg, index) => (
                            <div key={index} className={`mb-2 ${msg.from === 'gar21285' ?  'text-blue-700' : 'text-gray-700'}`}>
                              <p className="inline-block bg-gray-200 p-2 rounded-lg">
                              {msg.from}: {msg.body}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center">Select a contact to view conversation</p>
                )}
              </div>
              {selectedContact && (
                <form onSubmit={handleSendMessage} className="flex mt-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow p-2 border border-gray-300 rounded-l-lg"
                  />
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white rounded-r-lg p-2 hover:bg-blue-700">
                    Send
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default App;
