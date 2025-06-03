import React, { useState } from "react";

const MemeUpload = ({ onAddMeme }) => {
  const [memeCaption, setMemeCaption] = useState("");
  const [memeFile, setMemeFile] = useState(null);

  const handleFileChange = (e) => {
    setMemeFile(e.target.files[0]);
  };

  const handleCaptionChange = (e) => {
    setMemeCaption(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!memeFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onAddMeme({
        image: reader.result,
        caption: memeCaption,
        createdAt: new Date().toISOString(),
      });
      setMemeFile(null);
      setMemeCaption("");
      e.target.reset();
    };
    reader.readAsDataURL(memeFile);
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: "2rem 0" }}>
      <h2>Post a New Meme</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        required
        style={{ margin: "8px 0" }}
      />
      <br />
      <input
        type="text"
        placeholder="Add a caption (optional)"
        value={memeCaption}
        onChange={handleCaptionChange}
        style={{ width: "60%", margin: "8px 0", padding: "4px" }}
      />
      <br />
      <button type="submit" style={{ padding: "8px 16px" }}>
        Share Meme
      </button>
    </form>
  );
};

export default MemeUpload;
