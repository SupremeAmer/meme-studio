import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import MemeUpload from "./components/MemeUpload";
import MemeFeed from "./components/MemeFeed";
import Auth from "./components/Auth";
import { account } from "./appwrite";
import AdminPage from "./admin/AdminPage";
import { allowedAdmins } from "./admin/allowedAdmins";

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    account
      .get()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  // Protects the admin route
  function RequireAdmin({ children }) {
    if (!authChecked) return null; // Wait for auth check
    if (!user) return <Navigate to="/" replace />;
    if (!allowedAdmins.includes(user.email)) return <Navigate to="/" replace />;
    return children;
  }

  if (!authChecked) return <div>Loading...</div>;

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src="/logo.svg" className="App-logo" alt="logo" />
          <h1>Meme Social</h1>
          <p>Share and discover memes with friends!</p>
          {user && <button onClick={handleLogout}>Logout</button>}
        </header>
        <main style={{ padding: "2rem" }}>
          <Routes>
            <Route
              path="/"
              element={
                !user ? (
                  <Auth onAuth={setUser} />
                ) : (
                  <>
                    <MemeUpload user={user} />
                    <MemeFeed />
                  </>
                )
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage user={user} />
                </RequireAdmin>
              }
            />
            {/* Optionally, add a catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
