import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";


const socket = io('http://localhost:5000');

export const MessageExample = () => {
    const [userId, setUserId] = useState('');
    const [toId, setToId] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const hasLoggedIn = useRef(false);

    useEffect(() => {
        if (userId && !hasLoggedIn.current) {
            socket.emit('login', userId);
            hasLoggedIn.current = true;
        }
    }, [userId]);

    useEffect(() => {
        socket.on('private_message', ({ from, message }) => {
            setMessages((msgs) => [...msgs, `${from} says: ${message}`]);
        });

        // Clean up on component unmount
        return () => {
            socket.off('private_message');
        };
    }, []);

    function sendMessage() {
        if (userId && toId && message) {
            socket.emit('private_message', { from: userId, to: toId, message });
            setMessages((msgs) => [...msgs, `You to ${toId}: ${message}`]);
            setMessage('');
        }
    }

    return (
        <div>
            <h2>One-to-One Chat</h2>

            <input
                type="text"
                placeholder="Your user ID"
                value={userId}
                onChange={(e) => {
                    setUserId(e.target.value.trim());
                    hasLoggedIn.current = false; // reset login flag to re-login if changed
                }}
            />

            <input
                type="text"
                placeholder="Send to user ID"
                value={toId}
                onChange={(e) => setToId(e.target.value)}
            />

            <input
                type="text"
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                }}
            />

            <button onClick={sendMessage}>Send</button>

            <ul>
                {messages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                ))}
            </ul>
        </div>
    )
}










// export const Message = () => {
//   const [username, setUsername] = useState('');
//   const [content, setContent] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   useEffect(() => {
//     socket.on('receive_message', (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socket.on('error_message', (errorMsg) => {
//       toast.error(errorMsg);
//       setError(errorMsg); // store it in state (can also use toast/alert)
//       setSuccess(null);

//       socket.on('success_message', (msg) => {
//         toast.success(msg);
//         setSuccess(msg);
//         setError(null); // Clear any old error
//       });
//     });

//     return () => {
//       socket.off('receive_message');
//       socket.off('error_message');
//       socket.off('success_message');
//     };
//   }, []);

//   const sendMessage = () => {
//     const token = localStorage.getItem('token');
//     if (token && username && content) {
//       socket.emit('send_message', { token, username, content });
//       setContent('');
//       setError(null);
//     }
//   };

//   return (
//     <div className='message-container'>
//       <h2>Real-time Chat</h2>
//       <input
//         className='inputText'
//         type="text"
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />
//       <br />
//       <textarea
//         className='inputContent'
//         type="text"
//         placeholder="Message"
//         value={content}
//         onChange={(e) => setContent(e.target.value)}
//       />
//       <button className='message-button' onClick={sendMessage}>Send</button>

//       <div>
//         <h3>Messages:</h3>
//         {messages.map((msg, i) => (
//           <div key={i}>
//             <strong>{msg.username}</strong>: {msg.content}
//           </div>
//         ))}
//       </div>
//       <ToastContainer />
//     </div>
//   );
// };
