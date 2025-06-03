import React, { useState } from "react";
import "./App.css";
import MemeUpload from "./components/MemeUpload";
import MemeFeed from "./components/MemeFeed";

function App() {
  const [memes, setMemes] = useState([]);

  const handleAddMeme = (meme) => {
    setMemes([meme, ...memes]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="/logo.svg" className="App-logo" alt="logo" />
        <h1>Meme Social</h1>
        <p>Share and discover memes with friends!</p>
      </header>
      <main style={{ padding: "2rem" }}>
        <MemeUpload onAddMeme={handleAddMeme} />
        <MemeFeed memes={memes} />
      </main>
    </div>
  );
}

export default App;
