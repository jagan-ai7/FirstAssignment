import Multiselect from 'multiselect-react-dropdown';
import './Side.css'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Main } from './Chat';
import { Welcome } from '../welcome/Welcome';
export const Side = () => {
    const token = localStorage.getItem('token');
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/users/get-users', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const users = response.data.data;
                setUsers(users);
            } catch (error) {
                if (error.response) {
                    console.error(`Failed : ${error.response.data.message}`);
                } else {
                    console.error('Unexpected error:', error.message);
                }
            }
        }
        fetchUsers();
    }, []);

    const selectUser = async (id) => {

        navigate(`/chat/${id}`);

    }

    return (
        <>
            <div className="side-container">

                {
                    users.map((user, i) => (
                        <div className='user-container' key={i} onClick={(e) => (e.preventDefault(), selectUser(user.id))}>
                            <p className='user-name'>{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p>
                            <p className='user-email'>{user.email}</p>
                        </div>
                    ))
                }

            </div>
        </>
    )
};