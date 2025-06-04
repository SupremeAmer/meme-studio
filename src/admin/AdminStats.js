import React, { useEffect, useState } from "react";
import { databases } from "../appwrite";
import { Typography, Box, Paper } from "@mui/material";

const DB_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const MEMES_COLLECTION_ID = process.env.REACT_APP_APPWRITE_MEMES_COLLECTION_ID;
const USERS_COLLECTION_ID = process.env.REACT_APP_APPWRITE_USERS_COLLECTION_ID;

export default function AdminStats() {
  const [stats, setStats] = useState({ memes: 0, users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const memes = await databases.listDocuments(DB_ID, MEMES_COLLECTION_ID, []);
        let usersTotal = 0;
        try {
          const users = await databases.listDocuments(DB_ID, USERS_COLLECTION_ID, []);
          usersTotal = users.total;
        } catch {
          usersTotal = "N/A";
        }
        setStats({ memes: memes.total, users: usersTotal });
      } catch {
        setStats({ memes: "N/A", users: "N/A" });
      }
    };
    fetchStats();
  }, []);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Dashboard Analytics</Typography>
      <Box sx={{ display: "flex", gap: 4, mt: 2 }}>
        <Typography>Total Memes: <b>{stats.memes}</b></Typography>
        <Typography>Total Users: <b>{stats.users}</b></Typography>
      </Box>
    </Paper>
  );
}
