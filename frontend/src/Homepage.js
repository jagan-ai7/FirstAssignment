import { useEffect, useState } from "react";
import { Multiselect } from "multiselect-react-dropdown";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "./Homepage.css";

export const Homepage = () => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndSkills = async () => {
      try {
        const token = localStorage.getItem("token");
        const resUser = await axios.get(
          "http://localhost:5000/users/protected",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(resUser?.data?.data);

        const resSkills = await axios.get(
          "http://localhost:5000/users/skills",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const formatted = resSkills?.data?.data.map((skill) => ({
          id: skill.id,
          name: skill.name,
        }));

        setOptions(formatted);
      } catch (err) {
        console.error("Auth failed or no skills:", err);
      }
    };

    fetchUserAndSkills();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const skillIds = selected.map((s) => s.id);

      await axios.post(
        "http://localhost:5000/users/user-skills",
        {
          userId: user.id,
          skillIds,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Skills saved successfully!");
    } catch (err) {
      console.error("Failed to save skills", err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "500px",
        padding: "20px",
      }}
    >
      <Multiselect
        className="multiselect-container"
        options={options}
        selectedValues={selected}
        onSelect={setSelected}
        onRemove={setSelected}
        displayValue="name"
        placeholder="Select your skills"
      />

      <button onClick={handleSave} className="saveButton">
        Save
      </button>
    </div>
  );
};
