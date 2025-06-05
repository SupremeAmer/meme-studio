// ==== Appwrite Config ====
const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const APPWRITE_PROJECT = "YOUR_PROJECT_ID";
const APPWRITE_DB = "YOUR_DATABASE_ID";
const APPWRITE_COLLECTION = "YOUR_COLLECTION_ID";

const client = new window.appwrite.Client();
client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT);
const account = new window.appwrite.Account(client);
const databases = new window.appwrite.Databases(client);
const realtime = new window.appwrite.Realtime(client);

// ==== DOM Elements ====
const navbar = document.getElementById('navbar');
const main = document.getElementById('main');

// ==== Auth ====
let user = null;
async function showAuth() {
  main.innerHTML = `
    <div class="card">
      <h2>Meme Social</h2>
      <form id="authForm">
        <input type="email" placeholder="Email" id="email" required class="input" />
        <input type="password" placeholder="Password" id="password" required class="input" />
        <button type="submit" class="btn" id="authBtn">Login</button>
        <div>
          <a href="#" id="toggleAuth">Don't have an account? Register</a>
        </div>
        <div id="authError" class="error"></div>
      </form>
    </div>
  `;
  let isRegister = false;
  const authForm = document.getElementById('authForm');
  const authBtn = document.getElementById('authBtn');
  const toggleAuth = document.getElementById('toggleAuth');
  const authError = document.getElementById('authError');
  toggleAuth.addEventListener("click", e => {
    e.preventDefault();
    isRegister = !isRegister;
    authBtn.textContent = isRegister ? "Register" : "Login";
    toggleAuth.textContent = isRegister ? "Already have an account? Sign in" : "Don't have an account? Register";
    authError.textContent = "";
  });
  authForm.addEventListener("submit", async e => {
    e.preventDefault();
    authError.textContent = "";
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      if (isRegister) {
        await account.create('unique()', email, password);
      }
      await account.createEmailSession(email, password);
      user = await account.get();
      renderApp();
    } catch (err) {
      authError.textContent = err.message || "Authentication failed";
    }
  });
}
async function logout() {
  await account.deleteSession("current");
  user = null;
  showAuth();
}

// ==== Navbar ====
function renderNavbar() {
  navbar.innerHTML = `
    <span>Meme Social</span>
    <span>
      <button id="darkModeBtn" class="btn">🌙</button>
      <button id="logoutBtn" class="btn" style="display:none;">Logout</button>
    </span>
  `;
  document.getElementById('darkModeBtn').onclick = toggleDarkMode;
  document.getElementById('logoutBtn').onclick = logout;
}

// ==== Main App Sections ====
function renderApp() {
  // Show logout button
  document.getElementById('logoutBtn').style.display = "inline-block";
  main.innerHTML = `
    <div class="container">
      <div id="profileSection" class="section"></div>
      <div id="leaderboardSection" class="section"></div>
      <div id="memeCreateSection" class="section"></div>
      <div id="challengeSection" class="section"></div>
      <div id="notificationSection" class="section"></div>
      <div id="exploreSection" class="section"></div>
      <div id="favoritesSection" class="section"></div>
      <div id="dmSection" class="section"></div>
      <div id="adminSection" class="section"></div>
      <div id="badgesSection" class="section"></div>
    </div>
  `;
  renderProfile();
  renderLeaderboard();
  renderMemeCreate();
  renderChallenge();
  renderNotification();
  renderExplore();
  renderFavorites();
  renderDM();
  renderAdmin();
  renderBadges();
}

// ==== Profile ====
function renderProfile() {
  document.getElementById("profileSection").innerHTML = `
    <h2>Your Profile</h2>
    <div>Username: <b>@yourname</b></div>
    <div>Your Memes: 12 | Likes: 123 | Followers: 42</div>
    <div>Badges: <span>🔥 First Meme</span> <span>🏆 100 Likes</span></div>
  `;
}

// ==== Leaderboard ====
function renderLeaderboard() {
  document.getElementById("leaderboardSection").innerHTML = `
    <h2>Leaderboard</h2>
    <ol>
      <li>@MemeKing - 2120 likes</li>
      <li>@QueenOfMemes - 2040 likes</li>
      <li>@yourname - 123 likes</li>
    </ol>
  `;
}

// ==== Meme Creation/Remix/Template ====
function renderMemeCreate() {
  document.getElementById("memeCreateSection").innerHTML = `
    <h2>Create/Remix a Meme</h2>
    <input type="text" placeholder="Describe your meme idea" style="width:80%;" class="input">
    <button class="btn">Generate with AI</button>
    <input type="file" accept="image/*,image/gif" class="input">
    <button class="btn">Remix this meme</button>
    <div>
      <strong>Templates:</strong>
      <button class="btn">Template 1</button>
      <button class="btn">Template 2</button>
      <button class="btn">+ More</button>
    </div>
    <div>
      <span>AI Caption Suggestions: "When Monday hits..." "Relatable?"</span>
    </div>
  `;
}

// ==== Challenges & Contests ====
function renderChallenge() {
  document.getElementById("challengeSection").innerHTML = `
    <h2>Challenge of the Day</h2>
    <div>Create a meme about Mondays! <button class="btn">Participate</button></div>
    <div>Current Winner: @QueenOfMemes</div>
  `;
}

// ==== Notifications ====
function renderNotification() {
  document.getElementById("notificationSection").innerHTML = `
    <h2>Notifications</h2>
    <ul>
      <li>🔥 @Jane liked your meme</li>
      <li>💬 @John commented "So true!"</li>
      <li>🏅 You won today's challenge!</li>
    </ul>
  `;
}

// ==== Explore / Feed ====
function renderExplore() {
  document.getElementById("exploreSection").innerHTML = `
    <h2>Explore & Trending Memes</h2>
    <div class="meme-card">
      <img src="https://api.memegen.link/images/awesome.png" alt="meme"/>
      <div class="reaction-bar">
        <span title="Like">👍</span>
        <span title="Love">❤️</span>
        <span title="Laugh">😂</span>
        <span title="Wow">😮</span>
        <span title="Remix">🎨</span>
      </div>
      <div>
        <button class="btn">Save</button>
        <button class="btn">Share</button>
        <button class="btn">Download</button>
        <button class="btn">Flag</button>
      </div>
      <div class="comment-section">
        <input type="text" placeholder="Add a comment..." class="input">
        <div class="comment"><strong>@Jane:</strong> Hilarious! <button>Reply</button></div>
        <div class="comment"><strong>@John:</strong> 😂😂 <button>Reply</button></div>
      </div>
      <div>Tags: <span>#funny</span> <span>#monday</span></div>
    </div>
    <!-- Add more meme-card... -->
  `;
}

// ==== Favorites / Saved Memes ====
function renderFavorites() {
  document.getElementById("favoritesSection").innerHTML = `
    <h2>Saved Memes</h2>
    <div>(Your favorite memes show here)</div>
  `;
}

// ==== Direct Messaging ====
function renderDM() {
  document.getElementById("dmSection").innerHTML = `
    <h2>Direct Messages</h2>
    <div>
      <b>@Jane:</b> Challenge you to create a meme about coffee! <button class="btn">Accept</button>
    </div>
  `;
}

// ==== Admin Moderation ====
function renderAdmin() {
  document.getElementById("adminSection").innerHTML = `
    <h2>Admin Moderation</h2>
    <div>
      <button class="btn">Review Flagged Memes</button>
      <button class="btn">Remove User</button>
    </div>
  `;
}

// ==== Achievements / Badges ====
function renderBadges() {
  document.getElementById("badgesSection").innerHTML = `
    <h2>Achievements</h2>
    <ul>
      <li>🏆 100 Likes</li>
      <li>🔥 First Meme</li>
      <li>🥇 Challenge Winner</li>
    </ul>
  `;
}

// ==== Dark Mode ====
function toggleDarkMode() {
  document.body.classList.toggle('darkmode');
}

// ==== App Entry ====
async function checkSession() {
  try {
    user = await account.get();
    renderNavbar();
    renderApp();
  } catch {
    renderNavbar();
    showAuth();
  }
}
window.addEventListener("DOMContentLoaded", () => checkSession());
