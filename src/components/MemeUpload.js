import React, { useState } from "react";
import { storage, databases } from "../appwrite";

const DB_ID = "683de6560007db2161b7"; // <-- Replace with your DB ID
const COLLECTION_ID = "comments"; // <-- Replace with your Collection ID
const BUCKET_ID = "Memesocially"; // <-- Replace with your Storage Bucket ID

const MemeUpload = ({ user, onNewMeme }) => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const upload = await storage.createFile(BUCKET_ID, "unique()", file);
      const memeDoc = await databases.createDocument(DB_ID, COLLECTION_ID, "unique()", {
        imageId: upload.$id,
        caption,
        userId: user.$id,
        createdAt: new Date().toISOString(),
      });
      onNewMeme && onNewMeme(memeDoc);
      setCaption(""); setFile(null); e.target.reset();
    } catch (err) {
      setError(err.message || "Upload failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: "2rem 0" }}>
      <h2>Post a New Meme</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} required /><br />
      <input
        type="text"
        placeholder="Add a caption (optional)"
        value={caption}
        onChange={e => setCaption(e.target.value)}
        style={{ width: "60%", margin: "8px 0", padding: "4px" }}
      /><br />
      <button type="submit" disabled={loading}>{loading ? "Uploading..." : "Share Meme"}</button>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
};

export default MemeUpload;
