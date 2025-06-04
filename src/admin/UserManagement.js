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

const DB_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.REACT_APP_APPWRITE_USERS_COLLECTION_ID;

export default function UserManagement({ setSnack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DB_ID, USERS_COLLECTION_ID, []);
      setUsers(res.documents);
    } catch {
      setSnack({ open: true, severity: "error", message: "Failed to load users" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete user?")) return;
    try {
      await databases.deleteDocument(DB_ID, USERS_COLLECTION_ID, id);
      setSnack({ open: true, severity: "success", message: "User deleted" });
      fetchUsers();
    } catch {
      setSnack({ open: true, severity: "error", message: "Delete failed" });
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>User Management</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(row => (
              <TableRow key={row.$id}>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.$id}</TableCell>
                <TableCell>
                  <Button color="error" onClick={() => handleDelete(row.$id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !loading && (
              <TableRow><TableCell colSpan={3} align="center">No users found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
