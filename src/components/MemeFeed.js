import React from "react";

const MemeFeed = ({ memes }) => (
  <div>
    <h2>Latest Memes</h2>
    {memes.length === 0 && <p>No memes posted yet. Be the first!</p>}
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
      {memes.map((meme, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
            padding: "1rem",
            maxWidth: 300,
          }}
        >
          <img
            src={meme.image}
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

export default MemeFeed;
