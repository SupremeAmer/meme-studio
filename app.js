// --- Template and sticker data ---
const MEME_TEMPLATES = [
  {src: "https://i.imgflip.com/1ur9b0.jpg", name: "Distracted Boyfriend"},
  {src: "https://i.imgflip.com/26am.jpg", name: "Grumpy Cat"},
  {src: "https://i.imgflip.com/9ehk.jpg", name: "Laughing Leo"},
  {src: "https://i.imgflip.com/3si4.jpg", name: "One Does Not Simply"},
  {src: "https://i.imgflip.com/2wifvo.jpg", name: "Oprah You Get A"},
  {src: "https://i.imgflip.com/1bhw.jpg", name: "Drake Hotline Bling"},
  {src: "https://i.imgflip.com/30b1gx.jpg", name: "Expanding Brain"},
  {src: "https://i.imgflip.com/39t1o.jpg", name: "Futurama Fry"},
  {src: "https://i.imgflip.com/2fm6x.jpg", name: "Distracted Cat"},
  {src: "https://i.imgflip.com/1otk96.jpg", name: "Woman Yelling at Cat"},
  {src: "https://i.imgflip.com/3vzej.jpg", name: "Batman Slapping Robin"},
  {src: "https://i.imgflip.com/265k.jpg", name: "Bad Luck Brian"},
  {src: "https://i.imgflip.com/1g8my4.jpg", name: "Boardroom Suggestion"},
  {src: "https://i.imgflip.com/3tx4.jpg", name: "Ancient Aliens"},
  {src: "https://i.imgflip.com/2cp1.jpg", name: "Matrix Morpheus"}
];
const STICKERS = [
  {src:"https://em-content.zobj.net/source/animated-noto-color-emoji/356/face-with-tears-of-joy_1f602.gif", name:"😂"},
  {src:"https://em-content.zobj.net/source/animated-noto-color-emoji/356/thumbs-up_1f44d.gif", name:"👍"},
  {src:"https://em-content.zobj.net/source/animated-noto-color-emoji/356/fire_1f525.gif", name:"🔥"},
  {src:"https://em-content.zobj.net/source/animated-noto-color-emoji/356/see-no-evil-monkey_1f648.gif", name:"🙈"},
  {src:"https://em-content.zobj.net/source/animated-noto-color-emoji/356/face-with-rolling-eyes_1f644.gif", name:"🙄"},
  {src:"https://em-content.zobj.net/source/animated-noto-color-emoji/356/smiling-face-with-hearts_1f970.gif", name:"🥰"},
  {src:"https://em-content.zobj.net/source/animated-noto-color-emoji/356/face-with-sunglasses_1f60e.gif", name:"😎"},
  {src:"https://em-content.zobj.net/source/animated-noto-color-emoji/356/100_1f4af.gif", name:"💯"},
  {src:"https://em-content.zobj.net/source/animated-noto-color-emoji/356/skull_1f480.gif", name:"💀"},
  {src:"https://em-content.zobj.net/source/animated-noto-color-emoji/356/red-heart_2764-fe0f.gif", name:"❤️"}
];

// --- Render templates ---
const templatesDiv = document.getElementById("templates");
function renderTemplates(list) {
  templatesDiv.innerHTML = "";
  list.forEach((tpl, i) => {
    const div = document.createElement("div");
    div.className = "template-select";
    div.innerHTML = `<img src="${tpl.src}" alt="${tpl.name}"><div style="text-align:center;font-size:.95em;padding:.2em;">${tpl.name}</div>`;
    div.onclick = () => selectTemplate(i, list);
    templatesDiv.appendChild(div);
  });
}
renderTemplates(MEME_TEMPLATES);

// --- Search templates ---
document.getElementById("searchTemplates").oninput = function(e) {
  const q = e.target.value.toLowerCase();
  renderTemplates(MEME_TEMPLATES.filter(t=>t.name.toLowerCase().includes(q)));
};

// --- Random template ---
document.getElementById("randomTemplate").onclick = function() {
  const idx = Math.floor(Math.random()*MEME_TEMPLATES.length);
  selectTemplate(idx, MEME_TEMPLATES);
  templatesDiv.children[idx]?.scrollIntoView({behavior:"smooth",block:"center"});
};

// --- Stickers ---
const stickersDiv = document.getElementById("stickers");
STICKERS.forEach(st => {
  const div = document.createElement("div");
  div.className = "sticker";
  div.innerHTML = `<img src="${st.src}" title="${st.name}" draggable="true">`;
  div.onclick = () => addSticker(st.src);
  stickersDiv.appendChild(div);
});

// --- Theme toggle ---
const themeToggle = document.getElementById("themeToggle");
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  themeToggle.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
};
if(localStorage.getItem("theme")==="dark") themeToggle.onclick();

// --- Fabric.js meme canvas setup ---
const canvas = new fabric.Canvas('memeCanvas', {
  preserveObjectStacking: true,
  backgroundColor: "#fff"
});
canvas.setDimensions({width:500, height:500}, {cssOnly:true});

// --- Undo/Redo ---
let state = [], mods = 0;
canvas.on("object:added", saveState);
canvas.on("object:modified", saveState);
canvas.on("object:removed", saveState);
function saveState() {
  if (mods < state.length-1) state = state.slice(0,mods+1);
  state.push(JSON.stringify(canvas));
  mods = state.length-1;
}
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

// --- Select and load template image ---
let selectedTemplate = null;
function selectTemplate(idx, list) {
  selectedTemplate = list[idx];
  document.querySelectorAll(".template-select").forEach((el,i)=>el.classList.toggle("selected",i===idx));
  fabric.Image.fromURL(selectedTemplate.src, function(img) {
    img.set({ selectable: false, evented: false, originX: "left", originY:"top" });
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
      scaleX: canvas.width / img.width,
      scaleY: canvas.height / img.height
    });
    canvas.renderAll();
    saveState();
  }, { crossOrigin: "anonymous" });
}

// --- Upload your own image ---
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

// --- Add Text Box ---
document.getElementById("addTextBox").onclick = function() {
  const text = new fabric.IText("Edit me!", {
    left: canvas.width/2, top: 60+Math.random()*280,
    fill: "#fff",
    stroke: "#222",
    fontSize: 38,
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
  showTextTools(text);
};

// --- Add sticker to canvas ---
function addSticker(src) {
  fabric.Image.fromURL(src, function(img) {
    img.set({ left:canvas.width/2, top:canvas.height/2, scaleX:0.35, scaleY:0.35, hasBorders: true, cornerColor:"#6366f1" });
    canvas.add(img).setActiveObject(img);
    saveState();
  }, { crossOrigin:"anonymous" });
}

// --- Show text styling tools when text is selected ---
const textTools = document.getElementById("textTools");
canvas.on("selection:created", updateTextTools);
canvas.on("selection:updated", updateTextTools);
canvas.on("selection:cleared", ()=>textTools.style.display="none");
function updateTextTools(e) {
  const obj = e.selected[0];
  if (obj && obj.type === "i-text") showTextTools(obj);
  else textTools.style.display="none";
}
function showTextTools(obj) {
  textTools.style.display = "block";
  document.getElementById("fontFamily").value = obj.fontFamily || "Impact";
  document.getElementById("fontSize").value = obj.fontSize || 38;
  document.getElementById("fontColor").value = obj.fill || "#fff";
  document.getElementById("outlineColor").value = obj.stroke || "#222";
  document.getElementById("opacity").value = obj.opacity || 1;
  document.getElementById("shadow").checked = !!obj.shadow;
}

["fontFamily","fontSize","fontColor","outlineColor","opacity"].forEach(id=>{
  document.getElementById(id).oninput = function() {
    const obj = canvas.getActiveObject();
    if (obj && obj.type==="i-text") {
      if (id==="fontSize") obj.fontSize = parseInt(this.value);
      else if (id==="fontFamily") obj.fontFamily = this.value;
      else if (id==="fontColor") obj.fill = this.value;
      else if (id==="outlineColor") obj.stroke = this.value;
      else if (id==="opacity") obj.opacity = parseFloat(this.value);
      canvas.renderAll();
      saveState();
    }
  };
});
document.getElementById("shadow").onchange = function() {
  const obj = canvas.getActiveObject();
  if (obj && obj.type==="i-text") {
    obj.shadow = this.checked ? "rgba(0,0,0,0.55) 2px 2px 8px" : "";
    canvas.renderAll();
    saveState();
  }
};
// Curve text (simple demo)
document.getElementById("curveText").onclick = function() {
  const obj = canvas.getActiveObject();
  if (obj && obj.type==="i-text") {
    alert("Curved text is an advanced feature. Try using a tool like https://www.mockofun.com/tool/curved-text-generator/ and import as image for now!");
  }
};

// --- Download meme ---
document.getElementById("downloadBtn").onclick = function() {
  const url = canvas.toDataURL({ format: "png", quality: 1 });
  const a = document.createElement("a");
  a.href = url;
  a.download = "meme.png";
  a.click();
};

// --- Share (Web Share API or fallback) ---
document.getElementById("shareBtn").onclick = function() {
  canvas.getElement().toBlob(blob => {
    const file = new File([blob], "meme.png", {type:"image/png"});
    if (navigator.share && navigator.canShare && navigator.canShare({files:[file]})) {
      navigator.share({files:[file], title:"My Meme", text:"Check out my meme!"});
    } else {
      alert("Sharing not supported. Download and share manually!");
    }
  });
};

// --- PWA prompt (optional) ---
// See https://web.dev/pwa/

// --- Auto-load first template ---
window.onload = () => selectTemplate(0, MEME_TEMPLATES);
