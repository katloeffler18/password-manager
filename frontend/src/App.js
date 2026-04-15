import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:5050/api/test")
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend response:", data);
        setMessage(data.message);
      })
      .catch((err) => {
        console.error("Error connecting to backend:", err);
        setMessage("Error connecting to backend");
      });
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Password Manager</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;