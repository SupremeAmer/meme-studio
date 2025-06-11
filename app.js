// --- Closable Panels ---
const openPanels = {};
window.showPanel = function(panel) {
  document.querySelectorAll('.modal-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + panel).classList.add('active');
  openPanels[panel] = true;
};
window.closePanel = function(panel) {
  document.getElementById('panel-' + panel).classList.remove('active');
  openPanels[panel] = false;
};
// Close on ESC
document.addEventListener('keydown', e => {
  if (e.key === "Escape") {
    document.querySelectorAll('.modal-panel.active').forEach(p => p.classList.remove('active'));
  }
});

// --- THEME TOGGLE ---
const themeToggle = document.getElementById('themeToggle');
function setTheme(mode) {
  if (mode === 'dark') {
    document.body.classList.add('dark');
    themeToggle.innerHTML = "🌞";
    themeToggle.setAttribute("data-mode", "🌞");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove('dark');
    themeToggle.innerHTML = "🌙";
    themeToggle.setAttribute("data-mode", "🌙");
    localStorage.setItem("theme", "light");
  }
}
themeToggle.onclick = () => {
  setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
};
if (localStorage.getItem('theme') === 'dark') setTheme('dark');

// --- TOS MODAL LOGIC ---
const acceptTOS = document.getElementById('acceptTOS');
const acceptTOSBtn = document.getElementById('acceptTOSBtn');
const tosModalBg = document.getElementById('tosModalBg');
acceptTOS.addEventListener('change', function() {
  if (this.checked) {
    acceptTOSBtn.disabled = false;
    acceptTOSBtn.classList.add('enabled');
  } else {
    acceptTOSBtn.disabled = true;
    acceptTOSBtn.classList.remove('enabled');
  }
});
acceptTOSBtn.onclick = function() {
  sessionStorage.setItem('acceptedTOS', 'yes');
  tosModalBg.style.display = 'none';
};
if (!sessionStorage.getItem('acceptedTOS')) {
  tosModalBg.style.display = 'flex';
} else {
  tosModalBg.style.display = 'none';
}

// --- MUSIC CONTROLS ---
const audio = document.getElementById("bgMusic"), audioBtn = document.getElementById("audioBtn");
let musicFiles = [
  "your-default-music.mp3"
];
function setMusicOfTheDay() {
  const idx = (Math.floor(Date.now() / (1000 * 60 * 60 * 24))) % musicFiles.length;
  audio.src = musicFiles[idx];
  audio.load();
}
setMusicOfTheDay();
audioBtn.onclick = function() {
  if (audio.paused) { audio.play(); audioBtn.innerHTML = "⏸️"; audioBtn.classList.add("playing"); }
  else { audio.pause(); audioBtn.innerHTML = "🎵"; audioBtn.classList.remove("playing"); }
};
audio.addEventListener('ended', () => audio.play());

// --- VIDEO/IMAGE FABRIC EDITOR ---
const memeCanvas = document.getElementById('memeCanvas');
const videoPreview = document.getElementById('videoPreview');
const fabricCanvas = new fabric.Canvas('memeCanvas', { preserveObjectStacking: true, backgroundColor: "#fff" });
fabricCanvas.setDimensions({ width: 360, height: 360 }, { cssOnly: true });
let isVideoMode = false;
let state = [], mods = 0;
function saveState() {
  if (mods < state.length - 1) state = state.slice(0, mods + 1);
  state.push(JSON.stringify(fabricCanvas));
  mods = state.length - 1;
}
fabricCanvas.on("object:added", saveState);
fabricCanvas.on("object:modified", saveState);
fabricCanvas.on("object:removed", saveState);

function drawVideoFrameOnCanvas() {
  if (!isVideoMode || !videoPreview.src) return;
  // Create a hidden canvas, draw video frame, then load as fabric image.
  let tempCanvas = document.createElement("canvas");
  tempCanvas.width = videoPreview.videoWidth;
  tempCanvas.height = videoPreview.videoHeight;
  let ctx = tempCanvas.getContext("2d");
  ctx.drawImage(videoPreview, 0, 0, tempCanvas.width, tempCanvas.height);
  let url = tempCanvas.toDataURL();
  fabric.Image.fromURL(url, function (img) {
    img.set({ selectable: false, evented: false, originX: "left", originY: "top" });
    fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
      scaleX: fabricCanvas.width / tempCanvas.width,
      scaleY: fabricCanvas.height / tempCanvas.height
    });
    fabricCanvas.renderAll();
    // Do not call saveState here - only on pause/seek to avoid state spam
  }, { crossOrigin: "anonymous" });
}

document.getElementById("uploadImageVideo").onchange = function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  if (file.type.startsWith("video/")) {
    videoPreview.src = url;
    videoPreview.style.display = "";
    memeCanvas.style.display = "";
    isVideoMode = true;
    videoPreview.onloadedmetadata = function () {
      videoPreview.currentTime = 0;
      drawVideoFrameOnCanvas();
    };
    videoPreview.onseeked = function () { drawVideoFrameOnCanvas(); saveState(); };
    videoPreview.onplay = function () {
      if (window._vFrameInterval) clearInterval(window._vFrameInterval);
      window._vFrameInterval = setInterval(drawVideoFrameOnCanvas, 350);
    };
    videoPreview.onpause = function () {
      if (window._vFrameInterval) clearInterval(window._vFrameInterval);
      drawVideoFrameOnCanvas(); saveState();
    };
  } else {
    isVideoMode = false;
    videoPreview.style.display = "none";
    fabric.Image.fromURL(url, function (img) {
      img.set({ selectable: false, evented: false, originX: "left", originY: "top" });
      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
        scaleX: fabricCanvas.width / img.width,
        scaleY: fabricCanvas.height / img.height
      });
      fabricCanvas.renderAll();
      saveState();
    });
  }
  closePanel('upload');
};

// --- Editing Tools ---
document.getElementById("addTextBox").onclick = function () {
  const text = new fabric.IText("Edit me!", {
    left: fabricCanvas.width / 2, top: 60 + Math.random() * 180,
    fill: "#fff", stroke: "#222", fontSize: 32, fontFamily: "Impact", strokeWidth: 3,
    originX: "center", originY: "center", fontWeight: "bold"
  });
  fabricCanvas.add(text).setActiveObject(text);
  saveState();
};
document.getElementById("fontBtn").onclick = function () {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    obj.fontFamily = obj.fontFamily === "Impact" ? "Arial" : "Impact";
    fabricCanvas.renderAll(); saveState();
  }
};
document.getElementById("fontSizeBtn").onclick = function () {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    obj.fontSize = (obj.fontSize || 32) + 6;
    if (obj.fontSize > 64) obj.fontSize = 18;
    fabricCanvas.renderAll(); saveState();
  }
};
document.getElementById("colorBtn").onclick = function () {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    obj.fill = obj.fill === "#fff" ? "#facc15" : "#fff";
    fabricCanvas.renderAll(); saveState();
  }
};
document.getElementById("boldBtn").onclick = function () {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    obj.fontWeight = obj.fontWeight === "bold" ? "normal" : "bold";
    fabricCanvas.renderAll(); saveState();
  }
};
document.getElementById("italicBtn").onclick = function () {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    obj.fontStyle = obj.fontStyle === "italic" ? "normal" : "italic";
    fabricCanvas.renderAll(); saveState();
  }
};
document.getElementById("undoBtn").onclick = function () {
  if (mods > 0) { mods--; fabricCanvas.loadFromJSON(state[mods], fabricCanvas.renderAll.bind(fabricCanvas)); }
};
document.getElementById("redoBtn").onclick = function () {
  if (mods < state.length - 1) { mods++; fabricCanvas.loadFromJSON(state[mods], fabricCanvas.renderAll.bind(fabricCanvas)); }
};
document.getElementById("deleteBtn").onclick = function () {
  let obj = fabricCanvas.getActiveObject();
  if (obj) { fabricCanvas.remove(obj); saveState(); }
};
document.getElementById("downloadBtn").onclick = function () {
  if (isVideoMode) alert("Only a snapshot of the current video frame with overlays will be saved. Full video export is not supported in-browser.");
  const url = fabricCanvas.toDataURL({ format: "png", quality: 1 });
  const a = document.createElement("a");
  a.href = url;
  a.download = "meme.png";
  a.click();
  showAdArea();
};
document.getElementById("shareBtn").onclick = function () {
  fabricCanvas.getElement().toBlob(blob => {
    const file = new File([blob], "meme.png", { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: "My Meme", text: "Check out my meme!" });
    } else {
      alert("Sharing not supported. Download and share manually!");
    }
    showAdArea();
  });
};

// --- Templates, Emoji, GIFs ---
const MEME_TEMPLATES = [
  { src: "https://i.imgflip.com/1ur9b0.jpg", name: "Distracted Boyfriend" },
  { src: "https://i.imgflip.com/26am.jpg", name: "Grumpy Cat" },
  { src: "https://i.imgflip.com/2wifvo.jpg", name: "Oprah You Get A" },
  { src: "https://i.imgflip.com/2fm6x.jpg", name: "Distracted Cat" },
  { src: "https://i.imgflip.com/3si4.jpg", name: "One Does Not Simply" },
  { src: "https://i.imgflip.com/9ehk.jpg", name: "Laughing Leo" },
  { src: "https://i.imgflip.com/2cp1.jpg", name: "Matrix Morpheus" },
  { src: "https://i.imgflip.com/1bhw.jpg", name: "Drake Hotline Bling" },
  { src: "https://i.imgflip.com/1otk96.jpg", name: "Woman Yelling at Cat" },
  { src: "https://i.imgflip.com/30b1gx.jpg", name: "Expanding Brain" },
  { src: "https://i.imgflip.com/3tx4.jpg", name: "Ancient Aliens" },
  { src: "https://i.imgflip.com/3vzej.jpg", name: "Batman Slapping Robin" },
  { src: "https://i.imgflip.com/265k.jpg", name: "Bad Luck Brian" },
  { src: "https://i.imgflip.com/39t1o.jpg", name: "Futurama Fry" },
  { src: "https://i.imgflip.com/1g8my4.jpg", name: "Boardroom Suggestion" },
];
let showAllTemplates = false;
function renderTemplates(showAll = false) {
  const grid = document.getElementById("templateGrid");
  let templates = showAll ? MEME_TEMPLATES : MEME_TEMPLATES.slice(0, 10);
  grid.innerHTML = "";
  templates.forEach((tpl, i) => {
    const div = document.createElement("div");
    div.className = "template-select";
    div.innerHTML = `
      <img src="${tpl.src}" alt="${tpl.name}">
      <div class="template-name">${tpl.name}</div>
    `;
    div.onclick = () => {
      fabric.Image.fromURL(tpl.src, function (img) {
        img.set({ selectable: false, evented: false, originX: "left", originY: "top" });
        fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
          scaleX: fabricCanvas.width / img.width,
          scaleY: fabricCanvas.height / img.height
        });
        fabricCanvas.renderAll();
        saveState();
        closePanel('templates');
      }, { crossOrigin: "anonymous" });
    };
    grid.appendChild(div);
  });
  document.getElementById("seeMoreBtn").style.display =
    (!showAll && MEME_TEMPLATES.length > 10) ? "" : "none";
}
document.getElementById("seeMoreBtn").onclick = function () {
  showAllTemplates = true;
  renderTemplates(true);
};
renderTemplates();

document.querySelectorAll('#stickers img,#gifs img').forEach(img => {
  img.onclick = function () {
    fabric.Image.fromURL(img.src, function (sticker) {
      sticker.set({ left: fabricCanvas.width / 2, top: fabricCanvas.height / 2, scaleX: 0.35, scaleY: 0.35, hasBorders: true, cornerColor: "#6366f1" });
      fabricCanvas.add(sticker).setActiveObject(sticker);
      saveState();
      closePanel('emoji');
      closePanel('gift');
    }, { crossOrigin: "anonymous" });
  };
});

// --- Ad area demo ---
function showAdArea() {
  const adArea = document.getElementById("adArea");
  adArea.innerHTML = `
    <button class="close-ad" onclick="this.parentNode.style.display='none';return false;">×</button>
    <div>
      <div style="text-align:center;margin-bottom:0.5em;">Sponsored</div>
      <div style="padding:1.2em;background:rgba(255,255,255,0.8);border-radius:10px;">
        <span style="color:#6366f1;">AdSense</span> / <span style="color:#facc15;">AdsGram</span> Ad Here
      </div>
    </div>
  `;
  adArea.style.display = "";
}
