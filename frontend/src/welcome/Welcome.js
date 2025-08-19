import axios from "axios";
import { useContext, useEffect, useState } from "react";
import "../register/Register.css";
import { Link } from "react-router-dom";
import Popup from "reactjs-popup";
import { UserContext } from "../UserContext";

export const Welcome = () => {
  const { token } = useContext(UserContext);
  // const token = localStorage.getItem('token');
  const [user, setUser] = useState("");

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/users/protected",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { firstName, lastName } = response.data.data;
      console.log(firstName);
      setUser(firstName + " " + lastName);
    } catch (error) {
      console.error("Access denied:", error.response?.data.error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#032d5d",
        color: "white",
        border: "1px solid black",
        borderRadius: "0 0 10px 10px",
        justifyContent: "space-between",
      }}
    >
      <h2
        style={{
          marginLeft: "40px",
          fontFamily: "Times New Roman, Times, serif",
          alignSelf: "center",
        }}
      >
        {user}
      </h2>
      {/* <Link className="linkfp" to={"/changepassword"}>Change Password</Link> */}
      <Popup
        trigger={<button className="popup-btn">Menu</button>}
        contentStyle={{
          display: "flex",
          flexDirection: "column",
          border: "none",
          borderRadius: "5px",
        }}
        overlayStyle={{ background: "rgba(0,0,0,0.4)" }}
      >
        <span className="popup-itm">
          <Link className="linkfp" to={"/changepassword"}>
            Change Password
          </Link>
        </span>
        <span className="popup-itm">
          <Link
            className="linkfp"
            to={"/login"}
            onClick={() => {
              localStorage.clear();
            }}
          >
            Logout
          </Link>
        </span>
      </Popup>
    </div>
  );
};
