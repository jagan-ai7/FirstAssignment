import { useState } from "react";
import { Chat } from "./side/Chat";
import { Side } from "./side/Side";
import { Welcome } from "./welcome/Welcome";

export const Layout = () => {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        height: "100vh",
      }}
    >
      <Welcome />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "2px",
          overflow: "hidden",
        }}
      >
        <Side onSelectUser={setSelectedId} />
        <Chat selectedId={selectedId} />
      </div>
    </div>
  );
};
