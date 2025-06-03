import React, { useEffect, useState } from "react";
import { databases, storage } from "../appwrite";

const DB_ID = "683de6560007db2161b7"; // <-- Replace with your DB ID
const COLLECTION_ID = "comments"; // <-- Replace with your Collection ID
const BUCKET_ID = "Memesocially"; // <-- Replace with your Storage Bucket ID

const MemeFeed = () => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemes = async () => {
      const res = await databases.listDocuments(DB_ID, COLLECTION_ID, []);
      setMemes(res.documents);
      setLoading(false);
    };
    fetchMemes();
  }, []);

  const getImageUrl = (id) => storage.getFilePreview(BUCKET_ID, id).href;

  if (loading) return <p>Loading memes...</p>;

  return (
    <div>
      <h2>Latest Memes</h2>
      {memes.length === 0 && <p>No memes posted yet. Be the first!</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        {memes.map((meme, idx) => (
          <div key={idx} style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
            padding: "1rem",
            maxWidth: 300,
          }}>
            <img
              src={getImageUrl(meme.imageId)}
              alt={meme.caption || "meme"}
              style={{ maxWidth: "100%", borderRadius: "8px" }}
            />
            {meme.caption && <p style={{ marginTop: "0.5rem" }}>{meme.caption}</p>}
            <span style={{ fontSize: "0.8rem", color: "#888" }}>
              {new Date(meme.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemeFeed;
