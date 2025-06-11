// Theme Toggle
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

// Responsive Mobile Section Panel Logic
window.showPanel = function(panel) {
  document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('btn'+panel.charAt(0).toUpperCase()+panel.slice(1)).classList.add('active');
  document.getElementById('panel-'+panel).classList.add('active');
}

// MEME TEMPLATES
const MEME_TEMPLATES = [
  {src: "https://i.imgflip.com/1ur9b0.jpg", name: "Distracted Boyfriend"},
  {src: "https://i.imgflip.com/26am.jpg", name: "Grumpy Cat"},
  {src: "https://i.imgflip.com/2wifvo.jpg", name: "Oprah You Get A"},
  {src: "https://i.imgflip.com/2fm6x.jpg", name: "Distracted Cat"},
  {src: "https://i.imgflip.com/3si4.jpg", name: "One Does Not Simply"},
  {src: "https://i.imgflip.com/9ehk.jpg", name: "Laughing Leo"},
  {src: "https://i.imgflip.com/2cp1.jpg", name: "Matrix Morpheus"},
  {src: "https://i.imgflip.com/1bhw.jpg", name: "Drake Hotline Bling"},
  {src: "https://i.imgflip.com/1otk96.jpg", name: "Woman Yelling at Cat"},
  {src: "https://i.imgflip.com/30b1gx.jpg", name: "Expanding Brain"},
  {src: "https://i.imgflip.com/3tx4.jpg", name: "Ancient Aliens"},
  {src: "https://i.imgflip.com/3vzej.jpg", name: "Batman Slapping Robin"},
  {src: "https://i.imgflip.com/265k.jpg", name: "Bad Luck Brian"},
  {src: "https://i.imgflip.com/39t1o.jpg", name: "Futurama Fry"},
  {src: "https://i.imgflip.com/1g8my4.jpg", name: "Boardroom Suggestion"},
];
let showAllTemplates = false;
function renderTemplates(showAll=false) {
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
      div.animate([
        { boxShadow: "0 0 0 0 #facc15aa", transform: "scale(1)" },
        { boxShadow: "0 0 0 12px #facc1500", transform: "scale(1.08)" },
        { boxShadow: "0 0 0 0 #facc1500", transform: "scale(1)" }
      ], { duration: 400, easing: "cubic-bezier(.4,0,.2,1)" });
      fabric.Image.fromURL(tpl.src, function(img) {
        img.set({ selectable: false, evented: false, originX: "left", originY:"top" });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height
        });
        canvas.renderAll();
        saveState();
      }, { crossOrigin: "anonymous" });
    };
    grid.appendChild(div);
  });
  document.getElementById("seeMoreBtn").style.display =
    (!showAll && MEME_TEMPLATES.length > 10) ? "" : "none";
}
document.getElementById("seeMoreBtn").onclick = function() {
  showAllTemplates = true;
  renderTemplates(true);
};
renderTemplates();

// Stickers/Emojis and GIFs
document.querySelectorAll('#stickers img,#gifs img').forEach(img => {
  img.onclick = function() {
    img.animate([
      { transform: "scale(1)", boxShadow: "0 0 0 0 #6366f180" },
      { transform: "scale(1.13)", boxShadow: "0 0 0 8px #6366f140" },
      { transform: "scale(1)", boxShadow: "0 0 0 0 #6366f100" }
    ], { duration: 320 });
    fabric.Image.fromURL(img.src, function(sticker) {
      sticker.set({ left:canvas.width/2, top:canvas.height/2, scaleX:0.35, scaleY:0.35, hasBorders: true, cornerColor:"#6366f1" });
      canvas.add(sticker).setActiveObject(sticker);
      saveState();
    }, { crossOrigin:"anonymous" });
  };
});

// Upload
document.getElementById("uploadImage").onchange = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  fabric.Image.fromURL(url, function(img) {
    img.set({ selectable: false, evented: false, originX: "left", originY:"top" });
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
      scaleX: canvas.width / img.width,
      scaleY: canvas.height / img.height
    });
    canvas.renderAll();
    saveState();
  });
};

// Fabric.js Editor
const canvas = new fabric.Canvas('memeCanvas', {preserveObjectStacking:true,backgroundColor:"#fff"});
canvas.setDimensions({width:360, height:360}, {cssOnly:true});
let state = [], mods = 0;
function saveState() {
  if (mods < state.length-1) state = state.slice(0,mods+1);
  state.push(JSON.stringify(canvas));
  mods = state.length-1;
}
canvas.on("object:added", saveState);
canvas.on("object:modified", saveState);
canvas.on("object:removed", saveState);
document.getElementById("undoBtn").onclick = function() {
  if (mods>0) {
    mods--;
    canvas.loadFromJSON(state[mods], canvas.renderAll.bind(canvas));
  }
};
document.getElementById("redoBtn").onclick = function() {
  if (mods<state.length-1) {
    mods++;
    canvas.loadFromJSON(state[mods], canvas.renderAll.bind(canvas));
  }
};
document.getElementById("addTextBox").onclick = function() {
  const text = new fabric.IText("Edit me!", {
    left: canvas.width/2, top: 60+Math.random()*180,
    fill: "#fff",
    stroke: "#222",
    fontSize: 32,
    fontFamily: "Impact",
    strokeWidth: 3,
    shadow: "",
    opacity: 1,
    originX: "center",
    originY: "center",
    editable: true,
    fontWeight: "bold"
  });
  canvas.add(text).setActiveObject(text);
  saveState();
};
// Download meme
document.getElementById("downloadBtn").onclick = function() {
  const url = canvas.toDataURL({ format: "png", quality: 1 });
  const a = document.createElement("a");
  a.href = url;
  a.download = "meme.png";
  a.click();
  showAdArea();
};
document.getElementById("shareBtn").onclick = function() {
  canvas.getElement().toBlob(blob => {
    const file = new File([blob], "meme.png", {type:"image/png"});
    if (navigator.share && navigator.canShare && navigator.canShare({files:[file]})) {
      navigator.share({files:[file], title:"My Meme", text:"Check out my meme!"});
    } else {
      alert("Sharing not supported. Download and share manually!");
    }
    showAdArea();
  });
};
// Music logic
const audio = document.getElementById("bgMusic"), audioBtn = document.getElementById("audioBtn");
let musicFiles = [
  "your-default-music.mp3"
  // Add more mp3 files for daily rotation
];
function setMusicOfTheDay() {
  const idx = (Math.floor(Date.now()/(1000*60*60*24))) % musicFiles.length;
  audio.src = musicFiles[idx];
  audio.load();
}
setMusicOfTheDay();
audioBtn.onclick = function() {
  if(audio.paused) { audio.play(); audioBtn.innerHTML = "⏸️"; audioBtn.classList.add("playing"); }
  else { audio.pause(); audioBtn.innerHTML = "🎵"; audioBtn.classList.remove("playing"); }
};
audio.addEventListener('ended',()=>audio.play());

// TERMS MODAL LOGIC: fix Accept button
const acceptTOS = document.getElementById('acceptTOS');
const acceptTOSBtn = document.getElementById('acceptTOSBtn');
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
  document.getElementById('tosModalBg').style.display = 'none';
};

if (!sessionStorage.getItem('acceptedTOS')) {
  document.getElementById('tosModalBg').style.display = 'flex';
} else {
  document.getElementById('tosModalBg').style.display = 'none';
}

// ADS AFTER MEME CREATION (Demo)
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
