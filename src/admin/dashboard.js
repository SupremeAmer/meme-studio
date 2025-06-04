import React, { useEffect, useState } from 'react';
import { databases } from '../appwrite'; // Adjust path if needed
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const DATABASE_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.REACT_APP_APPWRITE_MEMES_COLLECTION_ID;

export default function Dashboard() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMemes = async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        ['orderDesc(createdAt)'] // Make sure your field name matches Appwrite
      );
      setMemes(res.documents);
    } catch (err) {
      // Handle error (maybe show a toast)
    }
    setLoading(false);
  };

  useEffect(() => { fetchMemes(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meme?")) return;
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    fetchMemes();
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Admin Dashboard: All Memes</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Caption</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Likes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memes.map(row => (
              <TableRow key={row.$id}>
                <TableCell>{row.userId || "?"}</TableCell>
                <TableCell>{row.caption}</TableCell>
                <TableCell>{(new Date(row.createdAt)).toLocaleString()}</TableCell>
                <TableCell>{row.likes?.length || 0}</TableCell>
                <TableCell>
                  <Button color="error" variant="contained" size="small" onClick={() => handleDelete(row.$id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {memes.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">No memes found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
