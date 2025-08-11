import axios from "axios";
import { useEffect, useState } from "react";
import '../register/Register.css';
import { Link } from "react-router-dom";

export const Welcome = () => {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState('');

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users/protected', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const { firstName, lastName } = response.data.data;
      console.log(firstName);
      setUser(firstName + " " + lastName);

    } catch (error) {
      console.error('Access denied:', error.response?.data.error);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
      <div style={{display: 'flex', backgroundColor: 'skyblue', border: '1px solid black', borderRadius: '5px'}}>
        <h2 style={{marginLeft: '40px'}}>Welcome : {user}</h2>
        <Link className="linkfp" to={"/changepassword"}>Change Password</Link>
      </div>
  )
}