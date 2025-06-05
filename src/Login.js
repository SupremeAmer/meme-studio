import React from "react";
import { loginWithGoogle } from "./auth"; // adjust path if needed

export default function Login() {
  return (
    <div>
      <button onClick={loginWithGoogle}>Sign in with Google</button>
    </div>
  );
}
