/*
 * Placeholder homepage
 * Also testing backend communication with API layer 
 */

import { useEffect, useState } from "react";
import { getTestMessage } from "../services/testService";

function HomePage() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function loadMessage() {
      try {
        const data = await getTestMessage();
        console.log("Backend response:", data);
        setMessage(data.message);
      } catch (err) {
        console.error("Error connecting to backend:", err);
        setMessage("Error connecting to backend");
      }
    }

    loadMessage();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Password Manager</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default HomePage;