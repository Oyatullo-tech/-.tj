/* ================================================================
   КИНО.ТҶ — Main Script
   ================================================================ */

const MOVIES_DB_KEY = "kinoTJ_movies";

const DEFAULT_MOVIES = [
  { id:1,  title:"The Silent Horizon", rating:8.7, image:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80", video:"https://www.w3schools.com/html/mov_bbb.mp4",        description:"Тайна глубокого космоса — экипаж получает сигнал из-за края вселенной и рискует всем ради разгадки.", genre:"Sci-Fi",    year:2024, duration:"2h 11m", featured:true  },
  { id:2,  title:"Crimson Night",      rating:8.1, image:"https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80", video:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",  description:"Детектив под прикрытием охотится за криминальной империей в ночных неоновых улицах.",                    genre:"Action",    year:2023, duration:"1h 54m", featured:false },
  { id:3,  title:"Echoes of Winter",   rating:7.9, image:"https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=1200&q=80", video:"https://www.w3schools.com/html/movie.mp4",         description:"Молодая журналистка возвращается в снежную деревню, где давние тайны возвращаются к жизни.",             genre:"Drama",     year:2022, duration:"2h 03m", featured:false },
  { id:4,  title:"Velocity Run",       rating:8.3, image:"https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=1200&q=80", video:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", description:"Бывший чемпион вынужден вернуться на трассу ради выполнения невозможной миссии.",                         genre:"Action",    year:2024, duration:"1h 48m", featured:false },
  { id:5,  title:"Golden Tides",       rating:7.8, image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", video:"https://www.w3schools.com/html/mov_bbb.mp4",        description:"Двое братьев отправляются в прибрежное путешествие, чтобы найти семейное сокровище и примириться.",     genre:"Adventure", year:2021, duration:"2h 08m", featured:false },
  { id:6,  title:"Midnight Protocol",  rating:8.5, image:"https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80", video:"https://www.w3schools.com/html/movie.mp4",         description:"Аналитик кибербезопасности вскрывает глобальный заговор — и сам становится следующей целью.",             genre:"Thriller",  year:2023, duration:"1h 57m", featured:false },
  { id:7,  title:"Moonlit Code",       rating:8.0, image:"https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=1200&q=80", video:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",  description:"Гениальный программист и художница объединяются, чтобы разоблачить коррупцию внутри вирусной платформы.", genre:"Sci-Fi",    year:2024, duration:"2h 00m", featured:false },
  { id:8,  title:"Last Frame",         rating:7.7, image:"https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80", video:"https://www.w3schools.com/html/mov_bbb.mp4",        description:"Некогда знаменитый режиссёр получает последний шанс создать шедевр.",                                     genre:"Drama",     year:2020, duration:"1h 50m", featured:false },
  { id:9,  title:"Orbit 9",            rating:8.2, image:"https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1200&q=80", video:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", description:"Ремонт заброшенной станции превращается в гонку со временем — экипаж понимает, что они не одни.",           genre:"Sci-Fi",    year:2022, duration:"2h 06m", featured:false },
  { id:10, title:"Neon Dreams",        rating:8.4, image:"https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80", video:"https://www.w3schools.com/html/mov_bbb.mp4",        description:"В киберпанк-мире хакер проникает в корпорацию-гиганта, чтобы раскрыть опасную тайну.",                   genre:"Sci-Fi",    year:2024, duration:"2h 15m", featured:false },
  { id:11, title:"The Last Stand",     rating:8.6, image:"https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=1200&q=80", video:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",  description:"Бывший солдат принимает последний бой против неуловимого врага в горах.",                                 genre:"Action",    year:2023, duration:"2h 02m", featured:false },
  { id:12, title:"Hearts in the Rain", rating:7.5, image:"https://images.unsplash.com/photo-1596565174898-0ad5601c14da?auto=format&fit=crop&w=1200&q=80", video:"https://www.w3schools.com/html/movie.mp4",         description:"Двое незнакомцев встречаются под дождём в большом городе и находят неожиданную связь.",                   genre:"Drama",     year:2024, duration:"1h 52m", featured:false }
];

function sanitizeMovies(list) {
  if (!Array.isArray(list)) return null;
  const cleaned = [];
  for (let i = 0; i < list.length; i++) {
    const m = list[i] || {};
    const id = Number(m.id);
    if (!id || Number.isNaN(id)) continue;
    const title = String(m.title || "").trim();
    if (!title) continue;
    cleaned.push({
      id,
      title,
      rating: Number(m.rating || 0) || 0,
      image: String(m.image || "").trim(),
      video: String(m.video || "").trim(),
      description: String(m.description || "").trim(),
      genre: String(m.genre || "").trim(),
      year: Number(m.year || 0) || "",
      duration: String(m.duration || "").trim(),
      featured: Boolean(m.featured)
    });
  }
  return cleaned.length ? cleaned : null;
}

function loadMoviesFromStorage() {
  try {
    const raw = localStorage.getItem(MOVIES_DB_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return sanitizeMovies(parsed);
  } catch (e) {
    return null;
  }
}

function saveMoviesToStorage(list) {
  localStorage.setItem(MOVIES_DB_KEY, JSON.stringify(list));
}

let movies = loadMoviesFromStorage() || DEFAULT_MOVIES.slice();
window.movies = movies;
window.saveMoviesToStorage = saveMoviesToStorage;

// Load movies from backend seamlessly
async function syncMoviesFromAPI() {
  try {
    const response = await fetch('/api/movies');
    if (response.ok) {
      const data = await response.json();
      const sanitized = sanitizeMovies(data);
      if (sanitized && sanitized.length > 0) {
        movies = sanitized;
        window.movies = movies;
        saveMoviesToStorage(movies);
      }
    }
  } catch (e) {
    console.warn("Could not sync movies from API", e);
  }
}

/* Плейсхолдер агар URL постера кушода нашавад (file://, блоки ҷустӯҷӯ) */
var POSTER_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#141824"/><stop offset="100%" style="stop-color:#0a0c12"/></linearGradient></defs><rect width="800" height="1200" fill="url(#g)"/><text x="400" y="580" text-anchor="middle" fill="#5c6478" font-family="system-ui,sans-serif" font-size="36" font-weight="600">Кино.тҷ</text><text x="400" y="640" text-anchor="middle" fill="#3d4455" font-family="system-ui,sans-serif" font-size="22">Постер</text></svg>'
  );
window.POSTER_FALLBACK = POSTER_FALLBACK;

function escapeAttr(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function posterImgTag(movie, extraClass) {
  var alt = escapeAttr(movie.title);
  var cls = extraClass ? " " + extraClass : "";
  return (
    '<img class="movie-poster-img' +
    cls +
    '" src="' +
    escapeAttr(movie.image) +
    '" alt="' +
    alt +
    '" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=\'' +
    POSTER_FALLBACK +
    '\';">'
  );
}

/* ── Storage Keys ── */
const FAVORITES_KEY = "kinoTJ_favorites";
const AUTH_KEY      = "kinoTJ_user";
const PAID_KEY      = "kinoTJ_paid";
const WATCH_HISTORY_KEY = "kinoTJ_watchHistory";
const WATCH_HISTORY_MAX = 2500;

function getWatchHistory() {
  try {
    var s = localStorage.getItem(WATCH_HISTORY_KEY);
    var p = s ? JSON.parse(s) : [];
    return Array.isArray(p) ? p : [];
  } catch (e) {
    return [];
  }
}

function saveWatchHistory(list) {
  var trimmed = list.length > WATCH_HISTORY_MAX ? list.slice(list.length - WATCH_HISTORY_MAX) : list;
  localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(trimmed));
}

/** kind: 'page' = кушодани саҳифа бо дастрасӣ; 'play' = оғози плеер */
function recordWatchEvent(movieId, kind) {
  var user = getUser();
  if (!user) return;
  var list = getWatchHistory();
  list.push({
    movieId: movieId,
    phone: user.phone,
    name: user.name || "",
    date: new Date().toISOString(),
    kind: kind || "page"
  });
  saveWatchHistory(list);
}

/* ================================================================
   FAVORITES
   ================================================================ */
function getFavorites() {
  try { const s = localStorage.getItem(FAVORITES_KEY); const p = s ? JSON.parse(s) : []; return Array.isArray(p) ? p : []; }
  catch { return []; }
}
function saveFavorites(f) { localStorage.setItem(FAVORITES_KEY, JSON.stringify(f)); }
function isFavorite(id)   { return getFavorites().includes(id); }
function toggleFavorite(id) {
  const f = getFavorites(), i = f.indexOf(id);
  if (i > -1) f.splice(i, 1); else f.push(id);
  saveFavorites(f); updateFavoritesCount(); refreshFavoriteButtons(); renderFavorites();
}
function updateFavoritesCount() {
  const c = getFavorites().length;
  document.querySelectorAll("#favoritesCount").forEach(function(el){ el.textContent = String(c); });
}

/* ================================================================
   AUTH — Full User Database System
   ================================================================ */
var USERS_DB_KEY = "kinoTJ_users"; // Array of all registered users

/* ── User Database helpers ── */
function getAllUsers() {
  try { var s = localStorage.getItem(USERS_DB_KEY); var p = s ? JSON.parse(s) : []; return Array.isArray(p) ? p : []; }
  catch(e) { return []; }
}
function saveAllUsers(users) { localStorage.setItem(USERS_DB_KEY, JSON.stringify(users)); }

async function syncUsersFromAPI() {
  try {
    const response = await fetch('/api/users');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        saveAllUsers(data);
      }
    }
  } catch (e) {
    console.warn("Could not sync users from API", e);
  }
}

function findUserByPhone(phone) {
  var normalized = normalizePhone(phone);
  return getAllUsers().find(function(u){ return normalizePhone(u.phone) === normalized; }) || null;
}

/* ── Simple hash for client-side password storage ── */
function simpleHash(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to a positive hex string with salt
  var salt = "kinoTJ_salt_2024";
  var combined = str + salt;
  var hash2 = 0;
  for (var j = 0; j < combined.length; j++) {
    var ch2 = combined.charCodeAt(j);
    hash2 = ((hash2 << 5) - hash2) + ch2;
    hash2 = hash2 & hash2;
  }
  return Math.abs(hash).toString(16) + Math.abs(hash2).toString(16);
}

/* ── Phone normalization & validation ── */
function normalizePhone(phone) {
  var digits = phone.replace(/\D/g, "");
  // If starts with 992, keep it. Otherwise prepend 992
  if (digits.length >= 9 && !digits.startsWith("992")) {
    digits = "992" + digits;
  }
  return digits;
}

function validatePhone(p) {
  var digits = p.replace(/\D/g, "");
  // Tajikistan: +992 XX XXX XX XX = 12 digits total, or 9 without country code
  return digits.length >= 9;
}

function formatPhoneDisplay(phone) {
  var digits = normalizePhone(phone);
  if (digits.length >= 12) {
    return "+" + digits.substring(0,3) + " " + digits.substring(3,5) + " " + digits.substring(5,8) + " " + digits.substring(8,10) + " " + digits.substring(10,12);
  }
  if (digits.length >= 9) {
    return "+992 " + digits.substring(digits.length-9, digits.length-7) + " " + digits.substring(digits.length-7, digits.length-4) + " " + digits.substring(digits.length-4, digits.length-2) + " " + digits.substring(digits.length-2);
  }
  return phone;
}

/* ── Password strength checker ── */
function getPasswordStrength(password) {
  var score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "Заиф ⚠", color: "#e8523a" };
  if (score <= 2) return { level: 2, label: "Миёна 🔶", color: "#f0b429" };
  if (score <= 4) return { level: 3, label: "Хуб ✓", color: "#22c55e" };
  return { level: 4, label: "Аъло 🛡️", color: "#00d4aa" };
}

function updatePasswordStrength() {
  var passEl = document.getElementById("registerPassword");
  var fill   = document.getElementById("passwordStrengthFill");
  var label  = document.getElementById("passwordStrengthLabel");
  if (!passEl || !fill || !label) return;

  var password = passEl.value;
  if (!password) {
    fill.style.width = "0%";
    label.textContent = "";
    return;
  }

  var strength = getPasswordStrength(password);
  fill.style.width = (strength.level * 25) + "%";
  fill.style.background = strength.color;
  label.textContent = strength.label;
  label.style.color = strength.color;
}

/* ── Current session ── */
function getUser() {
  try { var s = localStorage.getItem(AUTH_KEY); return s ? JSON.parse(s) : null; }
  catch(e) { return null; }
}
function saveUser(u) { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }
function removeUser() { localStorage.removeItem(AUTH_KEY); }

/* ── Auth UI ── */
function updateAuthUI() {
  var authBtn     = document.getElementById("authBtn");
  var userProfile = document.getElementById("userProfile");
  var userPhone   = document.getElementById("userPhone");
  var user = getUser();
  if (user) {
    if (authBtn)     authBtn.style.display     = "none";
    if (userProfile) {
      userProfile.style.display = "flex";
      if (userPhone) {
        var displayName = user.name || formatPhoneDisplay(user.phone);
        userPhone.textContent = displayName;
      }
    }
  } else {
    if (authBtn)     authBtn.style.display     = "";
    if (userProfile) userProfile.style.display = "none";
  }
}

function showAuthModal(onSuccess) {
  var modal  = document.getElementById("authModal");
  var login  = document.getElementById("loginForm");
  var reg    = document.getElementById("registerForm");
  if (!modal) return;
  modal._onSuccess = onSuccess || null;
  modal.style.display = "flex";
  if (login) login.style.display  = "block";
  if (reg)   reg.style.display    = "none";
  clearErrors(); clearForms();
  var loginSuccess = document.getElementById("loginSuccess");
  if (loginSuccess) loginSuccess.style.display = "none";
  var ph = document.getElementById("loginPhone");
  if (ph) setTimeout(function(){ ph.focus(); }, 100);
}

function hideAuthModal() {
  var modal = document.getElementById("authModal");
  if (modal) { modal.style.display = "none"; clearErrors(); clearForms(); }
}

function clearErrors() {
  document.querySelectorAll(".error-text").forEach(function(el){ el.textContent = ""; });
}

function clearForms() {
  ["loginPhone","loginPassword","registerName","registerPhone","registerPassword","registerPasswordConfirm"].forEach(function(id){
    var el = document.getElementById(id); if (el) el.value = "";
  });
  // Reset password strength
  var fill = document.getElementById("passwordStrengthFill");
  var label = document.getElementById("passwordStrengthLabel");
  if (fill) fill.style.width = "0%";
  if (label) label.textContent = "";
  // Hide success message
  var loginSuccess = document.getElementById("loginSuccess");
  if (loginSuccess) loginSuccess.style.display = "none";
}

function switchToRegisterForm() {
  var l = document.getElementById("loginForm"), r = document.getElementById("registerForm");
  if (l) l.style.display = "none"; if (r) r.style.display = "block"; clearErrors();
  var n = document.getElementById("registerName"); if (n) setTimeout(function(){ n.focus(); }, 100);
}

function switchToLoginForm() {
  var l = document.getElementById("loginForm"), r = document.getElementById("registerForm");
  if (l) l.style.display = "block"; if (r) r.style.display = "none"; clearErrors();
  var p = document.getElementById("loginPhone"); if (p) setTimeout(function(){ p.focus(); }, 100);
}

/* ── Handle Login ── */
function handleLogin(e) {
  e.preventDefault(); clearErrors();
  var phEl   = document.getElementById("loginPhone"),     phErr   = document.getElementById("loginPhoneError");
  var passEl = document.getElementById("loginPassword"),  passErr = document.getElementById("loginPasswordError");

  var phone    = phEl   ? phEl.value.trim()   : "";
  var password = passEl ? passEl.value        : "";
  var ok = true;

  if (!phone) { if (phErr) phErr.textContent = "Рақами телефонро ворид кунед"; ok = false; }
  else if (!validatePhone(phone)) { if (phErr) phErr.textContent = "Рақам нодуруст аст (ҳадди ақал 9 рақам)"; ok = false; }

  if (!password) { if (passErr) passErr.textContent = "Паролро ворид кунед"; ok = false; }
  if (!ok) return;

  // Disable button to prevent double-submit while checking API
  var submitBtn = document.querySelector("#loginFormElement button[type=submit]");
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Тафтиш..."; }

  function tryLoginWithUser(user) {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Ворид шудан"; }
    if (!user) {
      if (phErr) phErr.textContent = "Ин рақам бақайд нашудааст. Аввал бақайдгирӣ шавед.";
      return;
    }
    // Check password
    var hashedInput = simpleHash(password);
    if (user.passwordHash !== hashedInput) {
      if (passErr) passErr.textContent = "Парол нодуруст аст";
      return;
    }
    // Save session
    saveUser({
      phone: user.phone,
      name: user.name,
      registeredAt: user.registeredAt,
      loggedInAt: new Date().toISOString()
    });
    var modal = document.getElementById("authModal");
    var cb = modal ? modal._onSuccess : null;
    hideAuthModal(); updateAuthUI();
    clearPaidMoviesCache();
    loadAccessStateForCurrentUser().finally(function () {
      refreshFavoriteButtons();
      renderHero();
      renderMovieDetail();
    });
    if (typeof cb === "function") setTimeout(cb, 300);
  }

  // First try localStorage (fast path)
  var user = findUserByPhone(phone);
  if (user) {
    tryLoginWithUser(user);
    return;
  }

  // User not found in localStorage — sync from API first, then retry
  // This handles fresh browsers where localStorage is empty
  syncUsersFromAPI().then(function() {
    var userAfterSync = findUserByPhone(phone);
    tryLoginWithUser(userAfterSync);
  }).catch(function() {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Ворид шудан"; }
    if (phErr) phErr.textContent = "Ин рақам бақайд нашудааст. Аввал бақайдгирӣ шавед.";
  });
}

/* ── Handle Register ── */
function handleRegister(e) {
  e.preventDefault(); clearErrors();
  var nameEl    = document.getElementById("registerName"),            nameErr    = document.getElementById("registerNameError");
  var phEl      = document.getElementById("registerPhone"),           phErr      = document.getElementById("registerPhoneError");
  var passEl    = document.getElementById("registerPassword"),        passErr    = document.getElementById("registerPasswordError");
  var confEl    = document.getElementById("registerPasswordConfirm"), confErr    = document.getElementById("registerPasswordConfirmError");

  var name     = nameEl ? nameEl.value.trim() : "";
  var phone    = phEl   ? phEl.value.trim()   : "";
  var password = passEl ? passEl.value        : "";
  var confirm  = confEl ? confEl.value        : "";
  var ok = true;

  // Validate name
  if (!name || name.length < 2) {
    if (nameErr) nameErr.textContent = "Номро ворид кунед (ҳадди ақал 2 ҳарф)";
    ok = false;
  }

  // Validate phone
  if (!phone) {
    if (phErr) phErr.textContent = "Рақами телефонро ворид кунед";
    ok = false;
  } else if (!validatePhone(phone)) {
    if (phErr) phErr.textContent = "Рақам нодуруст аст (ҳадди ақал 9 рақам)";
    ok = false;
  } else {
    // Check if phone already registered
    var existing = findUserByPhone(phone);
    if (existing) {
      if (phErr) phErr.textContent = "Ин рақам аллакай бақайд шудааст. Ворид шавед.";
      ok = false;
    }
  }

  // Validate password
  if (!password) {
    if (passErr) passErr.textContent = "Паролро ворид кунед";
    ok = false;
  } else if (password.length < 6) {
    if (passErr) passErr.textContent = "Парол бояд ҳадди ақал 6 рамз бошад";
    ok = false;
  }

  // Validate confirm
  if (!confirm) {
    if (confErr) confErr.textContent = "Паролро такрор кунед";
    ok = false;
  } else if (password !== confirm) {
    if (confErr) confErr.textContent = "Паролҳо мувофиқат намекунанд";
    ok = false;
  }

  if (!ok) return;

  // Save to backend API instead of just local
  var passwordHash = simpleHash(password);
  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, phone: phone, passwordHash: passwordHash })
  }).then(r => r.json()).then(data => {
    if (data && !data.error) {
      var users = getAllUsers();
      // Only add to local if not fetched again yet
      if (!findUserByPhone(phone)) {
        users.push(data);
        saveAllUsers(users);
      }
      syncUsersFromAPI();
    }
  }).catch(() => {
    // Fallback to local
    var users = getAllUsers();
    var newUser = {
      id: Date.now(),
      name: name,
      phone: normalizePhone(phone),
      passwordHash: passwordHash,
      registeredAt: new Date().toISOString()
    };
    users.push(newUser);
    saveAllUsers(users);
  });

  var users = getAllUsers();
  // Auto-login after registration
  saveUser({
    phone: normalizePhone(phone),
    name: name,
    registeredAt: new Date().toISOString(),
    loggedInAt: new Date().toISOString()
  });

  var modal = document.getElementById("authModal");
  var cb = modal ? modal._onSuccess : null;
  hideAuthModal(); updateAuthUI();
  clearPaidMoviesCache();
  loadAccessStateForCurrentUser().finally(function () {
    refreshFavoriteButtons();
    renderHero();
    renderMovieDetail();
  });
  showNotification("✓ Хуш омадед, " + name + "! Аккаунт сохта шуд.");
  if (typeof cb === "function") setTimeout(cb, 300);
}

/* ── Logout ── */
function handleLogout() {
  removeUser(); clearPaidMoviesCache(); updateAuthUI();
  showNotification("Шумо аз аккаунт баромадед");
}

/* ── Password toggle visibility ── */
function setupPasswordToggles() {
  document.querySelectorAll(".password-toggle").forEach(function(btn){
    btn.addEventListener("click", function(){
      var targetId = btn.getAttribute("data-target");
      var input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🔒";
        btn.classList.add("active");
      } else {
        input.type = "password";
        btn.textContent = "👁";
        btn.classList.remove("active");
      }
    });
  });
}

/* ── Phone auto-formatting ── */
function setupPhoneFormatting() {
  ["loginPhone", "registerPhone"].forEach(function(id){
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", function(){
      var val = el.value.replace(/[^\d+]/g, "");
      // Auto-prepend +992 if user starts typing without it
      if (val && !val.startsWith("+") && !val.startsWith("9")) {
        val = "+992" + val;
      }
      if (val.startsWith("992") && !val.startsWith("+")) {
        val = "+" + val;
      }
      el.value = val;
    });
  });
}

/* ── Setup Auth ── */
function setupAuth() {
  var authBtn   = document.getElementById("authBtn");
  var closeBtn  = document.getElementById("closeModal");
  var swReg     = document.getElementById("switchToRegister");
  var swLog     = document.getElementById("switchToLogin");
  var loginFrm  = document.getElementById("loginFormElement");
  var regFrm    = document.getElementById("registerFormElement");
  var logoutBtn = document.getElementById("logoutBtn");
  var modal     = document.getElementById("authModal");

  if (authBtn)   authBtn.addEventListener("click",   function(){ showAuthModal(); });
  if (closeBtn)  closeBtn.addEventListener("click",  hideAuthModal);
  if (modal)     modal.addEventListener("click",     function(e){ if (e.target === modal) hideAuthModal(); });
  if (swReg)     swReg.addEventListener("click",     switchToRegisterForm);
  if (swLog)     swLog.addEventListener("click",     switchToLoginForm);
  if (loginFrm)  loginFrm.addEventListener("submit", handleLogin);
  if (regFrm)    regFrm.addEventListener("submit",   handleRegister);
  if (logoutBtn) logoutBtn.addEventListener("click",  handleLogout);

  // Password strength meter
  var passInput = document.getElementById("registerPassword");
  if (passInput) passInput.addEventListener("input", updatePasswordStrength);

  // Password toggles
  setupPasswordToggles();

  // Phone formatting
  setupPhoneFormatting();

  document.addEventListener("keydown", function(e){
    if (e.key === "Escape") { hideAuthModal(); hidePaymentModal(); }
  });
  updateAuthUI();
  loadAccessStateForCurrentUser();
}

/* ================================================================
   PAYMENT SYSTEM
   ================================================================ */
var _serverPaidMovies = [];
var _paidMoviesPhone = null;
var _paidMoviesLoaded = false;
var _serverPendingMovies = [];
var _pendingMoviesPhone = null;
var _pendingMoviesLoaded = false;
var _purchaseRequestId = null;

function clearPaidMoviesCache() {
  _serverPaidMovies = [];
  _paidMoviesPhone = null;
  _paidMoviesLoaded = false;
  _serverPendingMovies = [];
  _pendingMoviesPhone = null;
  _pendingMoviesLoaded = false;
}

function loadPaidMoviesForCurrentUser() {
  var user = getUser();
  if (!user || !user.phone) {
    clearPaidMoviesCache();
    return Promise.resolve([]);
  }
  if (_paidMoviesPhone !== user.phone) {
    // Prevent using payments from previous account before new fetch completes.
    _serverPaidMovies = [];
    _paidMoviesPhone = user.phone;
    _paidMoviesLoaded = false;
  }
  if (_paidMoviesPhone === user.phone && _paidMoviesLoaded && Array.isArray(_serverPaidMovies)) {
    return Promise.resolve(_serverPaidMovies);
  }
  return fetch('/api/paid-movies?phone=' + encodeURIComponent(user.phone), {
    headers: { 'Accept': 'application/json' }
  })
    .then(function(response) {
      if (!response.ok) return [];
      return response.json();
    })
    .then(function(data) {
      _serverPaidMovies = Array.isArray(data) ? data.map(function(id){ return Number(id); }).filter(function(id){ return !Number.isNaN(id); }) : [];
      _paidMoviesPhone = user.phone;
      _paidMoviesLoaded = true;
      return _serverPaidMovies;
    })
    .catch(function() {
      _serverPaidMovies = [];
      _paidMoviesPhone = user.phone;
      _paidMoviesLoaded = true;
      return _serverPaidMovies;
    });
}

function loadPendingMoviesForCurrentUser() {
  var user = getUser();
  if (!user || !user.phone) {
    _serverPendingMovies = [];
    _pendingMoviesPhone = null;
    _pendingMoviesLoaded = false;
    return Promise.resolve([]);
  }
  if (_pendingMoviesPhone !== user.phone) {
    _serverPendingMovies = [];
    _pendingMoviesPhone = user.phone;
    _pendingMoviesLoaded = false;
  }
  if (_pendingMoviesPhone === user.phone && _pendingMoviesLoaded && Array.isArray(_serverPendingMovies)) {
    return Promise.resolve(_serverPendingMovies);
  }
  return fetch('/api/pending-movies?phone=' + encodeURIComponent(user.phone), {
    headers: { 'Accept': 'application/json' }
  })
    .then(function(response) {
      if (!response.ok) return [];
      return response.json();
    })
    .then(function(data) {
      _serverPendingMovies = Array.isArray(data) ? data.map(function(id){ return Number(id); }).filter(function(id){ return !Number.isNaN(id); }) : [];
      _pendingMoviesPhone = user.phone;
      _pendingMoviesLoaded = true;
      return _serverPendingMovies;
    })
    .catch(function() {
      _serverPendingMovies = [];
      _pendingMoviesPhone = user.phone;
      _pendingMoviesLoaded = true;
      return _serverPendingMovies;
    });
}

function loadAccessStateForCurrentUser() {
  return Promise.all([loadPaidMoviesForCurrentUser(), loadPendingMoviesForCurrentUser()]);
}

function getLocalPaidMovies() { try { const s = localStorage.getItem(PAID_KEY); const p = s ? JSON.parse(s) : []; return Array.isArray(p) ? p : []; } catch { return []; } }
function saveLocalPaidMovies(list) { localStorage.setItem(PAID_KEY, JSON.stringify(list)); }
function getPaidMovies() {
  var user = getUser();
  if (user && user.phone) {
    if (_paidMoviesPhone !== user.phone) return [];
    return _serverPaidMovies.slice();
  }
  return getLocalPaidMovies();
}
function isPaid(movieId) {
  var user = getUser();
  if (user && user.phone) {
    if (_paidMoviesPhone !== user.phone) return false;
    return _serverPaidMovies.includes(movieId);
  }
  return getLocalPaidMovies().includes(movieId);
}
function isPending(movieId) {
  var user = getUser();
  if (!user || !user.phone) return false;
  if (_pendingMoviesPhone !== user.phone) return false;
  return _serverPendingMovies.includes(movieId);
}
function getMovieAccessLabel(movieId) {
  if (isPaid(movieId)) return "▶ Смотреть";
  if (isPending(movieId)) return "⏳ На проверке";
  return "🔒 1 сомонӣ";
}
function markAsPaid(movieId)  { 
  const list = getLocalPaidMovies(); 
  if (!list.includes(movieId)) { 
    list.push(movieId); 
    saveLocalPaidMovies(list); 
  }
  // Store transaction for admin panel
  try {
    const user = getUser();
    if(user) {
      let trans = JSON.parse(localStorage.getItem("kinoTJ_transactions") || "[]");
      trans.push({
        movieId: movieId,
        phone: user.phone,
        date: new Date().toISOString(),
        amount: 1
      });
      localStorage.setItem("kinoTJ_transactions", JSON.stringify(trans));
    }
  } catch(e) {}
}

var _paymentMovieId  = null;
var _paymentCallback = null;
var _purchaseStatusPoller = null;

function showPaymentModal(movie, onSuccess) {
  _paymentMovieId  = movie.id;
  _paymentCallback = onSuccess || null;

  var modal = document.getElementById("paymentModal");
  var s1    = document.getElementById("paymentStep1");
  var s2    = document.getElementById("paymentStep2");
  var s3    = document.getElementById("paymentStep3");
  if (!modal) return;

  // reset steps
  if (s1) s1.style.display = "block";
  if (s2) s2.style.display = "none";
  if (s3) s3.style.display = "none";
  var receiptInput = document.getElementById("paymentReceiptInput");
  if (receiptInput) receiptInput.value = "";

  // fill movie info
  var poster = document.getElementById("payMoviePoster");
  var title  = document.getElementById("payMovieTitle");
  var meta   = document.getElementById("payMovieMeta");
  if (poster) {
    poster.src = movie.image;
    poster.referrerPolicy = "no-referrer";
    poster.decoding = "async";
    poster.onerror = function () {
      poster.onerror = null;
      poster.src = POSTER_FALLBACK;
    };
  }
  if (title)  title.textContent = movie.title;
  if (meta)   meta.textContent  = movie.genre + " · " + movie.year + " · ⭐ " + movie.rating;

  // payment methods toggle
  modal.querySelectorAll(".payment-method-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      modal.querySelectorAll(".payment-method-btn").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
    });
  });

  modal.style.display = "flex";
}

function hidePaymentModal() {
  var modal = document.getElementById("paymentModal");
  if (modal) modal.style.display = "none";
  _paymentMovieId  = null;
  _paymentCallback = null;
}

function clearPurchasePoller() {
  if (_purchaseStatusPoller) {
    clearTimeout(_purchaseStatusPoller);
    _purchaseStatusPoller = null;
  }
}

function pollPurchaseStatus(requestId, movieId, callback, attempts) {
  if (!requestId) return;
  attempts = typeof attempts === "number" ? attempts : 0;
  if (attempts >= 18) {
    showNotification("Время ожидания одобрения истекло. Обновите страницу позже.");
    return;
  }

  fetch('/api/purchase-status?request_id=' + encodeURIComponent(requestId))
    .then(function(response) {
      return response.json().then(function(data) {
        return { status: response.status, data: data };
      });
    })
    .then(function(result) {
      if (result.status === 200 && result.data && result.data.status === 'approved') {
        clearPurchasePoller();
        _serverPendingMovies = _serverPendingMovies.filter(function(id){ return id !== movieId; });
        if (!_serverPaidMovies.includes(movieId)) {
          _serverPaidMovies.push(movieId);
        }
        markAsPaid(movieId);
        refreshFavoriteButtons();
        renderHero();
        renderMovieDetail();
        showNotification('Покупка одобрена — доступ открыт');
        if (typeof callback === 'function') {
          callback(movieId);
        } else {
          window.location.href = 'movie.html?id=' + movieId;
        }
        return;
      }
      _purchaseStatusPoller = setTimeout(function() {
        pollPurchaseStatus(requestId, movieId, callback, attempts + 1);
      }, 5000);
    })
    .catch(function() {
      _purchaseStatusPoller = setTimeout(function() {
        pollPurchaseStatus(requestId, movieId, callback, attempts + 1);
      }, 5000);
    });
}

function processPayment() {
  var s1 = document.getElementById("paymentStep1");
  var s2 = document.getElementById("paymentStep2");
  var s3 = document.getElementById("paymentStep3");
  if (s1) s1.style.display = "none";
  if (s2) s2.style.display = "block";

  var movie = getMovieById(_paymentMovieId);
  var user = getUser();
  if (!movie || !user || !user.phone) {
    showNotification('Невозможно создать заявку. Пожалуйста, войдите и повторите снова.');
    if (s2) s2.style.display = "none";
    if (s3) s3.style.display = "block";
    if (s3) {
      s3.querySelector('h3').textContent = 'Ошибка';
      s3.querySelector('p').textContent = 'Требуется авторизация.';
    }
    return;
  }

  var payload = {
    movieId: movie.id,
    movieTitle: movie.title,
    name: user.name || '',
    phone: user.phone
  };
  var receiptInput = document.getElementById("paymentReceiptInput");
  var receiptFile = receiptInput && receiptInput.files ? receiptInput.files[0] : null;
  if (!receiptFile) {
    if (s2) s2.style.display = "none";
    if (s1) s1.style.display = "block";
    showNotification('Пожалуйста, загрузите чек оплаты.');
    return;
  }
  var formData = new FormData();
  formData.append('movieId', String(payload.movieId));
  formData.append('movieTitle', payload.movieTitle);
  formData.append('name', payload.name);
  formData.append('phone', payload.phone);
  formData.append('receipt', receiptFile);

  fetch('/api/purchase-request', {
    method: 'POST',
    body: formData
  })
    .then(function(response) {
      return response.json().then(function(data) {
        return { status: response.status, data: data };
      });
    })
    .then(function(result) {
      if (result.status === 200 && result.data && result.data.requestId) {
        _purchaseRequestId = result.data.requestId;
        if (s2) s2.style.display = "none";
        if (s3) s3.style.display = "block";
        if (s3) {
          s3.querySelector('h3').textContent = 'Заявка отправлена!';
          s3.querySelector('p').textContent = 'Ожидайте одобрения администратора.';
        }
        if (!_serverPendingMovies.includes(movie.id)) {
          _serverPendingMovies.push(movie.id);
          _pendingMoviesPhone = user.phone;
          _pendingMoviesLoaded = true;
        }
        refreshFavoriteButtons();
        renderHero();
        renderMovieDetail();
        showNotification('Запрос отправлен. Проверьте Telegram администратора.');
        pollPurchaseStatus(_purchaseRequestId, movie.id, _paymentCallback);
      } else {
        if (s2) s2.style.display = "none";
        if (s3) s3.style.display = "block";
        if (s3) {
          s3.querySelector('h3').textContent = 'Ошибка';
          s3.querySelector('p').textContent = result.data && result.data.error ? result.data.error : 'Не удалось отправить заявку.';
        }
        showNotification(result.data && result.data.error ? result.data.error : 'Ошибка отправки заявки');
      }
    })
    .catch(function() {
      if (s2) s2.style.display = "none";
      if (s3) s3.style.display = "block";
      if (s3) {
        s3.querySelector('h3').textContent = 'Ошибка';
        s3.querySelector('p').textContent = 'Сервер не отвечает. Попробуйте позже.';
      }
      showNotification('Сервер не отвечает. Попробуйте позже.');
    });
}

function setupPaymentModal() {
  var closeBtn  = document.getElementById("closePaymentModal");
  var confirmBtn= document.getElementById("confirmPayBtn");
  var modal     = document.getElementById("paymentModal");

  if (closeBtn)  closeBtn.addEventListener("click",  hidePaymentModal);
  if (confirmBtn) confirmBtn.addEventListener("click", processPayment);
  if (modal)     modal.addEventListener("click", function(e){ if (e.target === modal) hidePaymentModal(); });
}

/* handleWatchClick — call from movie cards */
function handleWatchClick(movieId) {
  var movie = getMovieById(movieId);
  if (!movie) return;

  // 1) require auth
  if (!getUser()) {
    showAuthModal(function(){ handleWatchClick(movieId); });
    return;
  }

  // 2) refresh access state from server before checking
  loadAccessStateForCurrentUser().then(function(){
    if (isPaid(movieId)) {
      window.location.href = "movie.html?id=" + movieId;
      return;
    }
    if (isPending(movieId)) {
      showNotification('Платеж на проверке: заявка уже отправлена.');
      return;
    }
    showPaymentModal(movie, function(){
      window.location.href = "movie.html?id=" + movieId;
    });
  });
}

/* ================================================================
   NOTIFICATIONS
   ================================================================ */
function showNotification(message) {
  var old = document.getElementById("notification");
  if (old) old.remove();
  var n = document.createElement("div");
  n.id = "notification";
  n.textContent = message;
  n.style.cssText = [
    "position:fixed","top:calc(var(--header-height,82px) + 16px)","right:1.5rem",
    "padding:.9rem 1.4rem","background:var(--surface-2)","color:var(--text)",
    "border:1px solid var(--gold-border)","border-radius:var(--radius-sm)",
    "font-weight:600","font-size:.9rem","z-index:3000",
    "box-shadow:var(--shadow),var(--shadow-gold)","max-width:320px",
    "font-family:'Outfit',sans-serif","animation:slideInFromRight .4s cubic-bezier(.34,1.56,.64,1)"
  ].join(";");
  document.body.appendChild(n);
  setTimeout(function(){
    n.style.opacity="0"; n.style.transform="translateX(28px)"; n.style.transition="opacity .3s,transform .3s";
    setTimeout(function(){ n.remove(); }, 350);
  }, 3000);
}

/* ================================================================
   HELPERS
   ================================================================ */
function getMovieById(id) { return movies.find(function(m){ return m.id === id; }); }

function getYouTubeId(url) {
  try {
    var u = new URL(String(url || ""));
    var host = (u.hostname || "").replace(/^www\./, "");
    if (host === "youtu.be") return (u.pathname || "").replace("/", "") || null;
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      var parts = (u.pathname || "").split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) return parts[1];
      if (parts[0] === "shorts" && parts[1]) return parts[1];
    }
    return null;
  } catch (e) {
    return null;
  }
}

function getYouTubeEmbedUrl(url) {
  var id = getYouTubeId(url);
  if (!id) return null;
  id = id.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!id) return null;
  var origin = "";
  try {
    if (window.location && window.location.origin && window.location.origin !== "null") {
      origin = "&origin=" + encodeURIComponent(window.location.origin);
    }
  } catch (e) {}
  return "https://www.youtube.com/embed/" + id + "?rel=0&modestbranding=1&playsinline=1" + origin;
}

function getYouTubeWatchUrl(url) {
  var id = getYouTubeId(url);
  if (!id) return String(url || "");
  return "https://www.youtube.com/watch?v=" + id;
}

/* ================================================================
   MOVIE CARDS
   ================================================================ */
function createMovieCard(movie) {
  var card = document.createElement("article");
  card.className = "movie-card fade-in";
  card.setAttribute("data-id", movie.id);

  var paid     = isPaid(movie.id);
  var favLabel = isFavorite(movie.id) ? "Убрать из избранного" : "Добавить в избранное";
  var favIcon  = isFavorite(movie.id) ? "♥" : "♡";
  var watchLabel = getMovieAccessLabel(movie.id);

  card.innerHTML = `
    <div class="movie-card__poster">
      ${posterImgTag(movie)}
      <span class="movie-card__genre-badge">${movie.genre}</span>
      <div class="movie-card__overlay">
        <div class="movie-card__price">🎬 1 сомонӣ</div>
        <div class="movie-card__actions">
          <button class="btn btn-primary watch-btn" type="button" data-watch-id="${movie.id}">${watchLabel}</button>
          <button class="btn btn-secondary favorite-btn" type="button" data-favorite-id="${movie.id}" aria-label="${favLabel}">${favIcon} ${isFavorite(movie.id) ? "Дӯстдоштаҳо" : "Дӯст медорам"}</button>
        </div>
      </div>
    </div>
    <div class="movie-card__content">
      <h3 class="movie-card__title">${movie.title}</h3>
      <div class="movie-card__meta">
        <span>${movie.year} · ${movie.duration}</span>
        <span class="movie-card__rating">⭐ ${movie.rating}</span>
      </div>
    </div>
  `;

  card.querySelector(".movie-card__title").addEventListener("click", function(){ handleWatchClick(movie.id); });
  card.querySelector(".watch-btn").addEventListener("click",         function(){ handleWatchClick(movie.id); });
  card.querySelector("[data-favorite-id]").addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); toggleFavorite(movie.id); });

  return card;
}

function renderMovieGrid(list) {
  var grid = document.getElementById("movieGrid"); if (!grid) return;
  grid.innerHTML = "";
  if (!list.length) { grid.innerHTML = '<div class="empty-state fade-in">Фильмы не найдены. Попробуйте другой запрос.</div>'; return; }
  list.forEach(function(m){ grid.appendChild(createMovieCard(m)); });
}

function renderFavorites() {
  var grid = document.getElementById("favoritesGrid"); if (!grid) return;
  var favs = getFavorites();
  var list = movies.filter(function(m){ return favs.includes(m.id); });
  grid.innerHTML = "";
  if (!list.length) { grid.innerHTML = '<div class="empty-state fade-in">Вы ещё ничего не добавили в избранное. Начните прямо сейчас!</div>'; return; }
  list.forEach(function(m){ grid.appendChild(createMovieCard(m)); });
}

function refreshFavoriteButtons() {
  document.querySelectorAll("[data-favorite-id]").forEach(function(btn){
    var id  = Number(btn.getAttribute("data-favorite-id"));
    var fav = isFavorite(id);
    btn.innerHTML = (fav ? "♥ Дӯстдоштаҳо" : "♡ Дӯст медорам");
    btn.setAttribute("aria-label", fav ? "Убрать из избранного" : "Добавить в избранное");
  });
  // update watch buttons
  document.querySelectorAll("[data-watch-id]").forEach(function(btn){
    var id = Number(btn.getAttribute("data-watch-id"));
    btn.textContent = getMovieAccessLabel(id);
  });
}

/* ================================================================
   HERO
   ================================================================ */
function renderHero() {
  var watchBtn  = document.getElementById("heroWatchBtn");
  var favBtn    = document.getElementById("heroFavoriteBtn");
  var hero      = document.querySelector(".hero");
  var heroContent = document.querySelector(".hero-content");
  var featured  = movies.find(function(m){ return m.featured; }) || movies[0];
  if (!hero || !featured) return;

  hero.style.backgroundImage =
    "linear-gradient(90deg,rgba(4,6,12,.97) 0%,rgba(4,6,12,.78) 50%,rgba(4,6,12,.3) 100%)," +
    "linear-gradient(0deg,rgba(4,6,12,.7) 0%,transparent 45%)," +
    'url("' + featured.image + '")';
  hero.style.backgroundSize     = "cover";
  hero.style.backgroundPosition = "center";

  if (heroContent && !heroContent.querySelector("[data-hero-gen]")) {
    var info = document.createElement("div");
    info.setAttribute("data-hero-gen", "1");
    info.innerHTML =
      '<span class="badge">✦ Featured</span>' +
      '<h1>' + featured.title + '</h1>' +
      '<p>' + featured.description + '</p>' +
      '<div class="hero-meta">' +
        '<span class="chip">' + featured.genre + '</span>' +
        '<span class="chip">' + featured.year + '</span>' +
        '<span class="chip">' + featured.duration + '</span>' +
        '<span class="chip">⭐ ' + featured.rating + '</span>' +
        '<span class="chip" style="color:var(--gold);border-color:var(--gold-border);background:var(--gold-glow);">🎬 1 сомонӣ</span>' +
      '</div>';
    heroContent.insertBefore(info, heroContent.firstChild);
  }

  if (watchBtn) {
    var label = getMovieAccessLabel(featured.id);
    watchBtn.textContent = label === "🔒 1 сомонӣ" ? "🔒 1 сомонӣ — Смотреть" : label;
    watchBtn.addEventListener("click", function(){ handleWatchClick(featured.id); });
  }
  if (favBtn) {
    var setFavLabel = function(){
      var f = isFavorite(featured.id);
      favBtn.textContent = f ? "♥ В избранном" : "♡ В избранное";
      favBtn.setAttribute("aria-pressed", f ? "true" : "false");
    };
    setFavLabel();
    favBtn.addEventListener("click", function(){ toggleFavorite(featured.id); setFavLabel(); });
  }
}

/* ================================================================
   SEARCH
   ================================================================ */
function setupSearch() {
  var inp = document.getElementById("searchInput"); if (!inp) return;
  inp.addEventListener("input", function(e){
    var q = e.target.value.trim().toLowerCase();
    if (!q) { renderMovieGrid(movies); return; }
    renderMovieGrid(movies.filter(function(m){
      var title = (m.title || "").toLowerCase();
      var genre = (m.genre || "").toLowerCase();
      var year = String(m.year || "");
      return title.includes(q) || genre.includes(q) || year.includes(q);
    }));
  });
}

/* ================================================================
   SKELETON + RENDER
   ================================================================ */
function showSkeletonAndRender() {
  var sk   = document.getElementById("skeletonGrid");
  var grid = document.getElementById("movieGrid"); if (!grid) return;
  if (sk) sk.style.display = "";
  grid.style.display = "none";
  window.setTimeout(function(){
    if (sk) sk.style.display = "none";
    grid.style.display = "";
    renderMovieGrid(movies);
  }, 800);
}

/* ================================================================
   MOVIE DETAIL (movie.html)
   ================================================================ */
function renderMovieDetail() {
  var wrapper = document.getElementById("moviePlayerWrapper"); if (!wrapper) return;
  var titleEl = document.getElementById("movieTitle");
  var metaEl  = document.getElementById("movieMeta");
  var descEl  = document.getElementById("movieDescription");
  var genreEl = document.getElementById("movieGenre");
  var favBtn  = document.getElementById("movieFavoriteBtn");

  var params  = new URLSearchParams(window.location.search);
  var movieId = Number(params.get("id"));
  var movie   = getMovieById(movieId);

  if (!movie) {
    if (titleEl) titleEl.textContent = "Фильм не найден";
    if (descEl)  descEl.textContent  = "Выбранный фильм не удалось загрузить. Вернитесь в каталог.";
    wrapper.innerHTML = '<div class="empty-state fade-in">Видео недоступно.</div>';
    if (favBtn) favBtn.style.display = "none";
    return;
  }

  // Update page title
  document.title = movie.title + " — Кино.тҷ";

  if (titleEl) titleEl.textContent = movie.title;
  if (metaEl)  metaEl.textContent  = movie.year + " · " + movie.duration + " · ⭐ " + movie.rating;
  if (descEl)  descEl.textContent  = movie.description;
  if (genreEl) genreEl.innerHTML   = '<span class="chip">' + movie.genre + '</span>';

  // Paywall or Video
  if (!isPaid(movieId)) {
    var pending = isPending(movieId);
    // Show paywall overlay
    wrapper.innerHTML =
      '<div class="paywall-overlay">' +
        '<div class="paywall-overlay__bg" style="background-image:url(\'' + movie.image + '\')"></div>' +
        '<div class="paywall-overlay__content">' +
          '<span class="paywall-overlay__icon">' + (pending ? '⏳' : '🔒') + '</span>' +
          '<div class="paywall-overlay__title">' + (pending ? 'Платеж на проверке' : 'Для просмотра необходима оплата') + '</div>' +
          '<span class="paywall-overlay__price">1 сомонӣ</span>' +
          '<div class="paywall-overlay__sub">' + (pending ? 'Чек отправлен. Дождитесь подтверждения администратора.' : 'Разовый доступ · Мгновенно · Безопасно') + '</div>' +
          (pending
            ? '<button id="paywallBtn" class="btn btn-secondary" style="min-width:220px;">Обновить чек</button>'
            : '<button id="paywallBtn" class="btn btn-primary" style="min-width:220px;">🎬 Оплатить и смотреть</button>') +
        '</div>' +
      '</div>';

    var paywallBtn = document.getElementById("paywallBtn");
    if (paywallBtn) {
      paywallBtn.addEventListener("click", function(){
        if (!getUser()) {
          showAuthModal(function(){ showPaymentModal(movie, function(){ renderMovieDetail(); }); });
        } else {
          showPaymentModal(movie, function(){ renderMovieDetail(); });
        }
      });
    }
  } else {
    var sessPage = "kinoTJ_pageview_" + movieId;
    if (!sessionStorage.getItem(sessPage)) {
      sessionStorage.setItem(sessPage, "1");
      recordWatchEvent(movieId, "page");
    }

    var yt = getYouTubeEmbedUrl(movie.video);
    if (yt) {
      var watchUrl = getYouTubeWatchUrl(movie.video);
      if (window.location && window.location.protocol === "file:") {
        wrapper.innerHTML =
          '<div class="paywall-overlay">' +
            '<div class="paywall-overlay__bg" style="background-image:url(\'' + movie.image + '\')"></div>' +
            '<div class="paywall-overlay__content">' +
              '<span class="paywall-overlay__icon">▶</span>' +
              '<div class="paywall-overlay__title">YouTube дар file:// маҳдуд аст</div>' +
              '<div class="paywall-overlay__sub">Филмро дар YouTube кушоед ё сайтро тавассути http://localhost иҷро кунед.</div>' +
              '<a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="' + escapeAttr(watchUrl) + '" style="min-width:220px;display:inline-flex;justify-content:center;">Посмотреть на YouTube</a>' +
            '</div>' +
          '</div>';
      } else {
        wrapper.innerHTML =
          '<iframe class="movie-yt-frame" ' +
            'src="' + yt + '" ' +
            'title="' + escapeAttr(movie.title) + '" ' +
            'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
            'allowfullscreen ' +
            'referrerpolicy="strict-origin-when-cross-origin" ' +
            'style="width:100%;aspect-ratio:16/9;border:0;background:#000;display:block;">' +
          '</iframe>' +
          '<div style="padding:.65rem 0 .2rem;">' +
            '<a href="' + escapeAttr(watchUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--gold);font-weight:600;font-size:.9rem;">Если плеер не загрузился — открыть на YouTube ↗</a>' +
          '</div>';
      }
      // YouTube player external -> сабт дар лаҳзаи кушодан
      recordWatchEvent(movieId, "play");
    } else {
      // Show video player (mp4/webm)
      var player = document.getElementById("moviePlayer");
      if (player) {
        player.style.display = "block";
        player.poster = movie.image;
        player.innerHTML = '<source src="' + movie.video + '" type="video/mp4">Ваш браузер не поддерживает воспроизведение видео.';
        player.addEventListener(
          "play",
          function () {
            recordWatchEvent(movieId, "play");
          },
          { once: true }
        );
      }
    }
  }

  // Favorite button
  if (favBtn) {
    favBtn.setAttribute("data-movie-id", movie.id);
    var setLabel = function(){
      var f = isFavorite(movie.id);
      favBtn.textContent = f ? "♥ В избранном" : "♡ В избранное";
      favBtn.setAttribute("aria-pressed", f ? "true" : "false");
    };
    setLabel();
    favBtn.addEventListener("click", function(){ toggleFavorite(movie.id); setLabel(); });
  }

  // Related movies
  var relGrid = document.getElementById("relatedMovies");
  if (relGrid) {
    var related = movies.filter(function(m){ return m.id !== movie.id && m.genre === movie.genre; }).slice(0, 4);
    relGrid.innerHTML = "";
    if (!related.length) { relGrid.innerHTML = '<div class="empty-state fade-in">Похожих фильмов нет.</div>'; }
    else related.forEach(function(m){ relGrid.appendChild(createMovieCard(m)); });
  }
}

/* ================================================================
   MOBILE MENU
   ================================================================ */
function setupMobileMenu() {
  var toggle = document.getElementById("menuToggle");
  var nav    = document.querySelector(".nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", function(){
    nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
  });
}

/* Nav smooth scroll */
function setupNavigation() {
  document.querySelectorAll('.nav a[href^="#"]').forEach(function(link){
    link.addEventListener("click", function(e){
      var id = link.getAttribute("href");
      if (!id.startsWith("#")) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        var nav = document.querySelector(".nav");
        var toggle = document.getElementById("menuToggle");
        if (nav && nav.classList.contains("open")) {
          nav.classList.remove("open");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  });
}

/* ================================================================
   INIT
   ================================================================ */
function init() {
  updateFavoritesCount();
  setupMobileMenu();
  setupNavigation();
  setupAuth();
  setupPaymentModal();
  
  // Sync core data BEFORE full render
  Promise.all([
    syncMoviesFromAPI(),
    syncUsersFromAPI()
  ]).then(function() {
    loadAccessStateForCurrentUser().finally(function () {
      renderHero();
      setupSearch();
      showSkeletonAndRender();
      renderMovieDetail();
      renderFavorites();
      refreshFavoriteButtons();
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.body && document.body.classList.contains("admin-body")) return;
  init();
});