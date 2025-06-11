// == ACCESSIBILITY: Keyboard navigation ==
document.getElementById('mainContent').addEventListener('keydown', function(e) {
  if (e.key === "Tab") this.setAttribute('aria-live', 'polite');
});

// == PANEL LOGIC ==
window.showPanel = function(panel) {
  document.querySelectorAll('.modal-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + panel).classList.add('active');
};
window.closePanel = function(panel) {
  document.getElementById('panel-' + panel).classList.remove('active');
};
// Feedback, leaderboard, profile
document.getElementById('feedbackBtn').onclick = () => showPanel('feedback');
document.getElementById('leaderboardBtn').onclick = () => showPanel('leaderboard');
document.getElementById('profileBtn').onclick = () => showPanel('profile');

// == THEME ==
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

// == TOS MODAL ==
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

// == MUSIC ==
const audio = document.getElementById("bgMusic"), audioBtn = document.getElementById("audioBtn");
audioBtn.onclick = function() {
  if (audio.paused) { audio.play(); audioBtn.innerHTML = "⏸️"; audioBtn.classList.add("playing"); }
  else { audio.pause(); audioBtn.innerHTML = "🎵"; audioBtn.classList.remove("playing"); }
};
audio.addEventListener('ended', () => audio.play());

// == CANVAS LOGIC ==
const memeCanvas = document.getElementById('memeCanvas');
const videoPreview = document.getElementById('videoPreview');
const audioPreview = document.getElementById('audioPreview');
const fabricCanvas = new fabric.Canvas('memeCanvas', { preserveObjectStacking: true, backgroundColor: "#fff" });
fabricCanvas.setDimensions({ width: 360, height: 360 }, { cssOnly: true });
let isVideoMode = false, isAudioLoaded = false, audioURL = "";
let state = [], mods = 0;
let autoSaveTimer = null;

// == UNDO/REDO/History Panel ==
function updateHistoryPanel() {
  const historySteps = document.getElementById('historySteps');
  historySteps.innerHTML = "";
  for (let i = 0; i < state.length; ++i) {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    if (i === mods) btn.classList.add('selected');
    btn.onclick = () => {
      mods = i;
      fabricCanvas.loadFromJSON(state[i], fabricCanvas.renderAll.bind(fabricCanvas));
      updateHistoryPanel();
    };
    historySteps.appendChild(btn);
  }
}
function saveState() {
  if (mods < state.length - 1) state = state.slice(0, mods + 1);
  state.push(JSON.stringify(fabricCanvas));
  mods = state.length - 1;
  updateHistoryPanel();
  autoSaveDraft();
}
fabricCanvas.on("object:added", saveState);
fabricCanvas.on("object:modified", saveState);
fabricCanvas.on("object:removed", saveState);

// == AUTO-SAVE/DRAFTS ==
function autoSaveDraft() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    localStorage.setItem('memeDraft', JSON.stringify({canvas: state[mods], audio: audioURL}));
    document.getElementById('autoSaveStatus').textContent = "Draft auto-saved!";
    setTimeout(() => document.getElementById('autoSaveStatus').textContent = "", 2000);
  }, 1000);
}
window.onload = function() {
  if (localStorage.getItem('memeDraft')) {
    if (confirm('Restore your last meme draft?')) {
      const draft = JSON.parse(localStorage.getItem('memeDraft'));
      fabricCanvas.loadFromJSON(draft.canvas, fabricCanvas.renderAll.bind(fabricCanvas));
      if (draft.audio) {
        audioPreview.src = draft.audio;
        isAudioLoaded = true;
        audioPreview.style.display = "";
      }
    }
  }
};

// == VIDEO/IMAGE/AUDIO UPLOAD ==
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
document.getElementById("uploadAudio").onchange = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  audioURL = URL.createObjectURL(file);
  audioPreview.src = audioURL;
  isAudioLoaded = true;
  audioPreview.style.display = "";
  closePanel('upload');
};
document.getElementById("recordAudioBtn").onclick = function() {
  // Basic browser audio recording
  if (!navigator.mediaDevices) return alert('Audio recording not supported.');
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
    const recorder = new MediaRecorder(stream);
    let chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = e => {
      const blob = new Blob(chunks, {type:'audio/webm'});
      audioURL = URL.createObjectURL(blob);
      audioPreview.src = audioURL;
      isAudioLoaded = true;
      audioPreview.style.display = "";
    };
    recorder.start();
    setTimeout(() => {recorder.stop(); stream.getTracks().forEach(t=>t.stop());}, 5000); // 5s max
  });
};
document.getElementById("batchUpload").onchange = function(e) {
  // For batch meme creation, stub for now.
  alert('Batch meme creation stub! Select multiple images, and apply overlays/texts in a loop.');
};

// == ADVANCED TEXT FX ==
const fontSelect = document.getElementById("fontSelect");
fontSelect.onchange = function() {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    obj.fontFamily = this.value;
    fabricCanvas.renderAll(); saveState();
  }
};
document.getElementById("customFontUpload").onchange = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const font = new FontFace(file.name, ev.target.result);
    font.load().then(loaded => {
      document.fonts.add(loaded);
      fontSelect.innerHTML += `<option value="${file.name}">${file.name.replace(/\..+$/, '')}</option>`;
      fontSelect.value = file.name;
    });
  };
  reader.readAsArrayBuffer(file);
};
document.getElementById("shadowBtn").onclick = function() {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    obj.shadow = "rgba(0,0,0,0.7) 2px 2px 5px";
    fabricCanvas.renderAll(); saveState();
  }
};
document.getElementById("outlineBtn").onclick = function() {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    obj.stroke = "#000";
    obj.strokeWidth = 4;
    fabricCanvas.renderAll(); saveState();
  }
};
document.getElementById("gradientBtn").onclick = function() {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    obj.fill = new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
      colorStops: [
        { offset: 0, color: '#facc15' },
        { offset: 1, color: '#6366f1' }
      ]
    });
    fabricCanvas.renderAll(); saveState();
  }
};
document.getElementById("removeEffectBtn").onclick = function() {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    obj.shadow = null;
    obj.stroke = null;
    obj.strokeWidth = 0;
    obj.fill = "#fff";
    fabricCanvas.renderAll(); saveState();
  }
};
document.getElementById("animateTextBtn").onclick = function() {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    let i = 0;
    const origTop = obj.top;
    function bounce() {
      obj.top = origTop + Math.sin(i/5)*15;
      fabricCanvas.renderAll();
      if (i++ < 50) requestAnimationFrame(bounce);
      else obj.top = origTop;
    }
    bounce();
  }
};

// == QR CODE/LINK STICKER ==
document.getElementById("addQRCodeBtn").onclick = function() {
  const link = prompt("Enter link or text for QR code:");
  if (!link) return;
  const qr = qrcode(0, 'L');
  qr.addData(link);
  qr.make();
  const qrImg = new Image();
  qrImg.src = qr.createDataURL();
  qrImg.onload = function() {
    fabric.Image.fromURL(qrImg.src, function(img) {
      img.set({ left: fabricCanvas.width-100, top: fabricCanvas.height-100, scaleX:0.5, scaleY:0.5 });
      fabricCanvas.add(img);
      saveState();
    });
  };
};

// == IMAGE FILTERS ==
const imageFiltersToolbar = document.getElementById("imageFiltersToolbar");
imageFiltersToolbar.querySelectorAll('button').forEach(btn => {
  btn.onclick = function() {
    const filter = btn.getAttribute('data-filter');
    if (!fabricCanvas.backgroundImage) return;
    let filters = [];
    switch(filter) {
      case "brightness": filters.push(new fabric.Image.filters.Brightness({brightness: 0.35})); break;
      case "contrast": filters.push(new fabric.Image.filters.Contrast({contrast: 0.5})); break;
      case "grayscale": filters.push(new fabric.Image.filters.Grayscale()); break;
      case "sepia": filters.push(new fabric.Image.filters.Sepia()); break;
      case "invert": filters.push(new fabric.Image.filters.Invert()); break;
      case "blur": filters.push(new fabric.Image.filters.Blur({blur: 0.35})); break;
      case "pixelate": filters.push(new fabric.Image.filters.Pixelate({blocksize: 8})); break;
      case "deepfry":
        filters.push(new fabric.Image.filters.Contrast({contrast: 1}));
        filters.push(new fabric.Image.filters.Brightness({brightness: 0.55}));
        filters.push(new fabric.Image.filters.Sepia());
        filters.push(new fabric.Image.filters.Blur({blur: 0.09}));
        break;
      case "clear": /* no filters */ break;
    }
    fabricCanvas.backgroundImage.filters = filters;
    fabricCanvas.backgroundImage.applyFilters();
    fabricCanvas.renderAll();
    saveState();
  }
};

// == WATERMARK ==
let watermarkObj = null;
document.getElementById("addWatermarkBtn").onclick = function() {
  if (watermarkObj) {
    fabricCanvas.remove(watermarkObj); watermarkObj = null;
    this.textContent = "Watermark";
  } else {
    watermarkObj = new fabric.Text('JohnLite-Tech Ltd', {
      fontSize: 18, fill: 'rgba(0,0,0,0.25)', left: 10, top: fabricCanvas.height - 30,
      selectable: false, evented: false
    });
    fabricCanvas.add(watermarkObj);
    this.textContent = "Remove Watermark";
  }
  saveState();
};

// == BASIC TOOLS ==
document.getElementById("addTextBox").onclick = function () {
  const text = new fabric.IText("Edit me!", {
    left: fabricCanvas.width / 2, top: 60 + Math.random() * 180,
    fill: "#fff", stroke: "#222", fontSize: 32, fontFamily: "Impact", strokeWidth: 3,
    originX: "center", originY: "center", fontWeight: "bold", shadow: null
  });
  fabricCanvas.add(text).setActiveObject(text);
  saveState();
};
document.getElementById("undoBtn").onclick = function () {
  if (mods > 0) { mods--; fabricCanvas.loadFromJSON(state[mods], fabricCanvas.renderAll.bind(fabricCanvas)); updateHistoryPanel(); }
};
document.getElementById("redoBtn").onclick = function () {
  if (mods < state.length - 1) { mods++; fabricCanvas.loadFromJSON(state[mods], fabricCanvas.renderAll.bind(fabricCanvas)); updateHistoryPanel(); }
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
    // Platform-specific sharing (stub: can use Web Share API or link APIs)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: "My Meme", text: "Check out my meme!" });
    } else {
      alert("Sharing not supported. Download and share manually!");
    }
    showAdArea();
  });
};

// == AI SUGGEST CAPTION / TEMPLATE (stub, connect to your AI API) ==
document.getElementById("aiSuggestBtn").onclick = function() {
  alert("AI caption suggestion stub.\nIntegrate with OpenAI, Replicate, etc. for full functionality.");
};
// == TTS (Text-to-Speech) ==
document.getElementById("ttsBtn").onclick = function() {
  const obj = fabricCanvas.getActiveObject();
  if (obj && obj.type === "i-text") {
    const utter = new SpeechSynthesisUtterance(obj.text);
    speechSynthesis.speak(utter);
  }
};

// == TEMPLATES, EMOJI, GIFS, COLLAGE, BATCH: stubs, can be expanded ==
function renderTemplates(showAll = false) {
  // ... as previous; add uploadTemplateBtn logic for user-uploaded templates ...
}
document.getElementById("uploadTemplateBtn").onclick = function() {
  alert("Template upload stub. Implement file upload and add to templates array.");
};
document.getElementById("uploadStickerBtn").onclick = function() {
  alert("Sticker upload stub. Implement file upload and add to stickers array.");
};
document.getElementById("uploadGifBtn").onclick = function() {
  alert("GIF upload stub. Implement file upload and add to gifs array.");
};
// Collage panel: user can select a layout/grid (stub)
document.getElementById("collageGrid").innerHTML = "<em>Collage layouts coming soon!</em>";

// == FEEDBACK/SURVEY/STUBS ==
document.getElementById("feedbackForm").onsubmit = function(e) {
  e.preventDefault();
  alert("Thank you for your feedback!\n(Stub: Connect to backend or email service)");
  closePanel('feedback');
};
// == COMMUNITY STUBS ==
document.getElementById("leaderboardList").innerHTML = "<em>Community leaderboard coming soon!</em>";
document.getElementById("profileArea").innerHTML = "<em>Profile, login, and community features coming soon!</em>";

// == AD AREA ==
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
};
