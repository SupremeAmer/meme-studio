import React, { useEffect, useState } from 'react';
import { databases } from '../appwrite';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { allowedAdmins } from './allowedAdmins';
import { useNavigate } from "react-router-dom";

const DATABASE_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.REACT_APP_APPWRITE_MEMES_COLLECTION_ID;

export default function Dashboard({ user, setSnack }) {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !allowedAdmins.includes(user.email)) {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchMemes = async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        ['orderDesc(createdAt)']
      );
      setMemes(res.documents);
    } catch (err) {
      setSnack({ open: true, severity: "error", message: "Failed to load memes" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchMemes(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meme?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      setSnack({ open: true, severity: "success", message: "Meme deleted" });
      fetchMemes();
    } catch {
      setSnack({ open: true, severity: "error", message: "Delete failed" });
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Admin Dashboard: All Memes</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Caption</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memes.map(row => (
              <TableRow key={row.$id}>
                <TableCell>{row.userId}</TableCell>
                <TableCell>{row.caption}</TableCell>
                <TableCell>{(new Date(row.createdAt)).toLocaleString()}</TableCell>
                <TableCell>
                  <Button color="error" variant="contained" size="small" onClick={() => handleDelete(row.$id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {memes.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">No memes found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
