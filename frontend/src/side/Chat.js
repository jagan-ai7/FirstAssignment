import { useEffect, useRef, useState } from 'react';
import { Welcome } from '../welcome/Welcome.js';
import { Side } from './Side.js';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from "socket.io-client";


const socket = io('http://localhost:5000');

export const Chat = () => {
    const token = localStorage.getItem('token');
    const { id } = useParams();
    const [name, setName] = useState();
    const userId = localStorage.getItem('id');

    const [toId, setToId] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState({});

    const hasLoggedIn = useRef(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/users/get-user/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const resData = response.data.data;
                setToId(resData.id);
                setName(`${resData.firstName} ${resData.lastName}`);
            } catch (error) {
                if (error.response) {
                    console.error(`Failed : ${error.response.data.message}`);
                } else {
                    console.error('Unexpected error:', error.message);
                }
            }
        }
        fetchUser();
    }, [id]);

    useEffect(() => {
        if (userId && !hasLoggedIn.current) {
            socket.emit('login', userId);
            hasLoggedIn.current = true;
        }
    }, [userId]);

    // Helper to add message to the correct chat in state
    const addMessage = (newMsg) => {
        // Determine chat partner's id (the "other" user in conversation)
        const otherUserId = newMsg.from === userId ? newMsg.to : newMsg.from;
        setMessages((prev) => {
            const userMessages = prev[otherUserId] || [];
            return {
                ...prev,
                [otherUserId]: [...userMessages, newMsg],
            };
        });
    };

    // Listen for incoming private messages
    useEffect(() => {
        socket.on('private_message', (newMsg) => {
            addMessage(newMsg);
        });

        // Listen for updated online users list (new addition)
        socket.on('users_update', (onlineUsers) => {
            console.log('Online users:', onlineUsers);
            // Optionally, update state here if you want to display online users
        });

        return () => {
            socket.off('private_message');
            socket.off('users_update');
        };
    }, []);

    const sendMessage = () => {
        if (userId && toId && message.trim()) {
            const newMsg = { from: userId, to: toId, message: message.trim() };
            socket.emit('private_message', newMsg);
            addMessage(newMsg);
            setMessage('');
        }
    };

    const chatMessages = messages[toId] || [];

    return (
        <div>
            <Welcome />
            <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                <Side />
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: '9', gap: '5px' }}>
                    <div style={{ display: 'flex', border: '1px solid black', backgroundColor: '#d1ffd6', borderRadius: '5px' }}>
                        <h2 style={{ marginLeft: '20px' }}>{name}</h2>
                    </div>

                    <div style={{ flexGrow: 9, padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
                        {chatMessages.map((msg, i) => {
                            const isSender = msg.from === userId;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        justifyContent: isSender ? 'flex-end' : 'flex-start',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: isSender ? '#d1ffd6' : 'skyblue',
                                            padding: '8px 12px',
                                            borderRadius: '12px',
                                            maxWidth: '70%',
                                            wordWrap: 'break-word',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            textAlign: isSender ? 'right' : 'left',
                                        }}
                                    >
                                        <strong>{isSender ? 'You' : name}</strong>
                                        <span>{msg.message}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex' }}>
                        <input type='text' onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} style={{ width: '100%', height: '40px', fontSize: '18px', borderRadius: '5px' }} onChange={(e) => {setMessage(e.target.value);}} value={message} />
                        <button style={{borderRadius: '5px'}} onClick={(e) => { e.preventDefault(); sendMessage(); }}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    )
}