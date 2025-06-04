import React, { useState } from "react";
import AdminStats from "./AdminStats";
import Dashboard from "./Dashboard";
import UserManagement from "./UserManagement";
import AdminSnackbar from "./AdminSnackbar";

export default function AdminPage({ user }) {
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  return (
    <div>
      <AdminStats />
      <Dashboard user={user} setSnack={setSnack} />
      <UserManagement setSnack={setSnack} />
      <AdminSnackbar {...snack} onClose={() => setSnack(s => ({ ...s, open: false }))} />
    </div>
  );
}
