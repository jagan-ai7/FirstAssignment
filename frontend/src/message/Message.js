import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Message.css'
import { toast, ToastContainer } from 'react-toastify';

const socket = io('http://localhost:5000');

export const Message = () => {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('error_message', (errorMsg) => {
      toast.error(errorMsg);
      setError(errorMsg); // store it in state (can also use toast/alert)
      setSuccess(null);

      socket.on('success_message', (msg) => {
        toast.success(msg);
        setSuccess(msg);
        setError(null); // Clear any old error
      });
    });

    return () => {
      socket.off('receive_message');
      socket.off('error_message');
      socket.off('success_message');
    };
  }, []);

  const sendMessage = () => {
    const token = localStorage.getItem('token');
    if (token && username && content) {
      socket.emit('send_message', { token, username, content });
      setContent('');
      setError(null);
    }
  };

  return (
    <div className='message-container'>
      <h2>Real-time Chat</h2>
      <input
        className='inputText'
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <textarea
        className='inputContent'
        type="text"
        placeholder="Message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button className='message-button' onClick={sendMessage}>Send</button>

      <div>
        <h3>Messages:</h3>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.username}, {msg.id}</strong>: {msg.content}, {msg.id}
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
};
