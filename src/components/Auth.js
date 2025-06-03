import React, { useState } from "react";
import { account } from "../appwrite";

const Auth = ({ onAuth }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await account.createEmailSession(email, password);
      } else {
        await account.create("unique()", email, password);
        await account.createEmailSession(email, password);
      }
      const user = await account.get();
      onAuth(user);
    } catch (err) {
      setError(err.message || "Error");
    }
  };

  return (
    <div style={{ margin: "2rem auto", maxWidth: 320 }}>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          required value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          required value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      </form>
      <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ marginTop: 8 }}>
        {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
      </button>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default Auth;
