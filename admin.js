/* ================================================================
   ADMIN PANEL — JavaScript Logic
   ================================================================ */

/* ── Constants & DB Keys ── */
/* USERS_DB_KEY, PAID_KEY, WATCH_HISTORY_KEY — аз script.js (агар паҳлӯ нашавад, такрор накунед) */
const ADMIN_SESSION_KEY = "kinoTJ_admin";
const ADMIN_PHONE = "992500500200";
const MOVIES_COUNT_MOCK = 12; // Static mock count from script.js movies array

/** Хатҳои унсури кириллӣ/лотинӣ барои "admin"; рақамҳои пурра-андаоза ба ASCII */
function normalizeAdminInput(str) {
  if (!str) return "";
  return String(str)
    .replace(/\u0430/gi, "a")
    .replace(/\u0435/gi, "e")
    .replace(/\u0456/gi, "i")
    .replace(/\u043c/gi, "m")
    .replace(/\u043d/gi, "n")
    .replace(/\u0434/gi, "d")
    .replace(/\u0438/gi, "i")
    .replace(/\u043e/gi, "o")
    .replace(/\u0440/gi, "p")
    .replace(/\u0441/gi, "c")
    .replace(/\u0442/gi, "t")
    .replace(/\u0443/gi, "y")
    .replace(/[\uFF10-\uFF19]/g, function (ch) {
      return String(ch.charCodeAt(0) - 0xff10);
    })
    .trim();
}

/** Логин: admin ё рақам ба охири 500500200. Парол: 123456 ё kino2026 */
function validateAdminLogin(userRaw, passRaw) {
  const user = normalizeAdminInput(userRaw).toLowerCase();
  const pass = normalizeAdminInput(passRaw);
  const digits = String(userRaw || "").replace(/\D/g, "");
  const userOk =
    user === "admin" ||
    (digits.length >= 9 && digits.endsWith("500500200"));
  const passOk = pass === "123456" || pass === "kino2026";
  return userOk && passOk;
}

/* ── State ── */
let currentUsers = [];
let sortCol = 'date';
let sortDesc = true;
let userToDeleteId = null;

/* ── Initialization ── */
document.addEventListener("DOMContentLoaded", initAdmin);

function initAdmin() {
  setupLogin();
  
  if (isAdminLoggedIn()) {
    showDashboard();
  } else {
    showLogin();
  }

  // Close modals on Escape
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeAddModal();
      closeEditModal();
      closeConfirmModal();
      closeReportModal();
    }
  });

  // Export button
  const exportBtn = document.getElementById("exportUsersBtn");
  if(exportBtn) exportBtn.addEventListener("click", exportUsersCSV);

  // Search input and Filter
  const searchInput = document.getElementById("userSearchInput");
  const roleFilter = document.getElementById("userRoleFilter");
  
  if(searchInput) {
    searchInput.addEventListener("input", function(e) {
      const qs = document.getElementById("adminQuickSearch");
      if (qs && getActiveTabId() === "tabUsers") qs.value = searchInput.value;
      renderTable();
    });
  }
  if(roleFilter) {
    roleFilter.addEventListener("change", function(e) {
      renderTable();
    });
  }

  // Delete all
  const deleteAllBtn = document.getElementById("deleteAllUsersBtn");
  if(deleteAllBtn) {
    deleteAllBtn.addEventListener("click", function() {
      if(confirm("Диққат! Шумо дар ҳақиқат мехоҳед ҳамаи корбаронро нест кунед? Ин амалро баргардонидан ғайриимкон аст.")) {
        saveAllUsers([]);
        refreshData();
        showToast("Ҳамаи корбарон нест карда шуданд", "success");
      }
    });
  }

  // Tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
      document.getElementById(tab.getAttribute('data-tab')).style.display = 'block';
      syncQuickSearchFromSection();
      if (tab.getAttribute('data-tab') === 'tabReports') {
        renderWatchReportTable();
        renderMovieSummaryTable();
      }
    });
  });

  const quickSearch = document.getElementById("adminQuickSearch");
  if (quickSearch) {
    quickSearch.addEventListener("input", function () {
      applyQuickSearch(quickSearch.value);
    });
  }

  const transSearch = document.getElementById("transSearchInput");
  if (transSearch) {
    transSearch.addEventListener("input", () => {
      const qs = document.getElementById("adminQuickSearch");
      if (qs && getActiveTabId() === "tabTransactions") qs.value = transSearch.value;
      renderTransTable();
    });
  }

  const movieSearchEl = document.getElementById("movieSearchInput");
  if (movieSearchEl) {
    movieSearchEl.addEventListener("input", () => {
      const qs = document.getElementById("adminQuickSearch");
      if (qs && getActiveTabId() === "tabMovies") qs.value = movieSearchEl.value;
      renderMoviesTable();
    });
  }

  const reportSearch = document.getElementById("reportSearchInput");
  const reportKind = document.getElementById("reportKindFilter");
  if (reportSearch) {
    reportSearch.addEventListener("input", () => {
      const qs = document.getElementById("adminQuickSearch");
      if (qs && getActiveTabId() === "tabReports") qs.value = reportSearch.value;
      renderWatchReportTable();
    });
  }
  if (reportKind) reportKind.addEventListener("change", () => renderWatchReportTable());

  document.getElementById("exportWatchBtn")?.addEventListener("click", exportWatchCSV);

  // Table sorting headers
  document.querySelectorAll(".sortable").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-sort");
      if (sortCol === col) {
        sortDesc = !sortDesc; // toggle
      } else {
        sortCol = col;
        sortDesc = true;
      }
      updateSortHeaders();
      renderTable();
    });
  });
}

function getTransactions() {
  try { return JSON.parse(localStorage.getItem('kinoTJ_transactions') || '[]'); } catch(e) { return []; }
}

function getMovies() {
  return Array.isArray(window.movies) ? window.movies : [];
}

function saveMovies(list) {
  try {
    localStorage.setItem("kinoTJ_movies", JSON.stringify(list));
  } catch (e) {}
  window.movies = list;
  // Обновляем число фильмов в статистике сразу
  const el = document.getElementById("statMoviesCount");
  if (el) el.textContent = String(list.length);
}

function getWatchHistory() {
  try {
    const s = localStorage.getItem(WATCH_HISTORY_KEY);
    const p = s ? JSON.parse(s) : [];
    return Array.isArray(p) ? p : [];
  } catch (e) {
    return [];
  }
}

function isAdminUser(u) {
  return u && normalizePhone(u.phone) === ADMIN_PHONE;
}

/* ── DB Helpers ── */
function getAllUsers() {
  try { const s = localStorage.getItem(USERS_DB_KEY); const p = s ? JSON.parse(s) : []; return Array.isArray(p) ? p : []; }
  catch(e) { return []; }
}
function saveAllUsers(users) { localStorage.setItem(USERS_DB_KEY, JSON.stringify(users)); }

function getPaidCount() {
  try { const s = localStorage.getItem(PAID_KEY); const p = s ? JSON.parse(s) : []; return Array.isArray(p) ? p.length : 0; }
  catch(e) { return 0; }
}

function normalizePhone(phone) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length >= 9 && !digits.startsWith("992")) {
    digits = "992" + digits;
  }
  return digits;
}

function formatPhoneDisplay(phone) {
  const digits = normalizePhone(phone);
  if (digits.length >= 12) {
    return "+" + digits.substring(0,3) + " " + digits.substring(3,5) + " " + digits.substring(5,8) + " " + digits.substring(8,10) + " " + digits.substring(10,12);
  }
  return phone;
}

function formatDate(isoString) {
  if(!isoString) return "Номаълум";
  const date = new Date(isoString);
  const pad = n => n < 10 ? '0'+n : n;
  return `${pad(date.getDate())}.${pad(date.getMonth()+1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Same hash function as script.js
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  const salt = "kinoTJ_salt_2024";
  const combined = str + salt;
  let hash2 = 0;
  for (let j = 0; j < combined.length; j++) {
    const ch2 = combined.charCodeAt(j);
    hash2 = ((hash2 << 5) - hash2) + ch2;
    hash2 = hash2 & hash2;
  }
  return Math.abs(hash).toString(16) + Math.abs(hash2).toString(16);
}


/* ── Auth Session ── */
function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}
function setAdminLoggedIn(status) {
  if (status) {
    localStorage.setItem(ADMIN_SESSION_KEY, "true");
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

/* ── Login/Logout Logic ── */
function setupLogin() {
  const loginForm = document.getElementById("adminLoginForm");
  const logoutBtn = document.getElementById("adminLogoutBtn");

  if(loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      document.querySelectorAll(".error-text").forEach(el => el.textContent="");
      const user = document.getElementById("adminLogin").value;
      const pass = document.getElementById("adminPass").value;

      document.getElementById("adminLoginError").textContent = "";
      document.getElementById("adminPassError").textContent = "";

      if (!validateAdminLogin(user, pass)) {
        document.getElementById("adminLoginError").textContent =
          "Логин: admin ё 992500500200";
        document.getElementById("adminPassError").textContent =
          "Парол: 123456 ё kino2026";
        return;
      }

      setAdminLoggedIn(true);
      showDashboard();
    });
  }

  if(logoutBtn) {
    logoutBtn.addEventListener("click", function() {
      setAdminLoggedIn(false);
      showLogin();
      showToast("Аз панел баромадед", "success");
    });
  }
}

function showLogin() {
  document.getElementById("adminLoginScreen").style.display = "flex";
  document.getElementById("adminDashboard").style.display = "none";
  const passEl = document.getElementById("adminPass");
  if(passEl) passEl.value = "";
}

function showDashboard() {
  document.getElementById("adminLoginScreen").style.display = "none";
  const dash = document.getElementById("adminDashboard");
  if (dash) dash.style.display = "grid";
  refreshData();
  syncQuickSearchFromSection();
}


/* ── Dashboard & Stats ── */
function refreshData() {
  currentUsers = getAllUsers();
  
  // Stats
  document.getElementById("statTotalUsers").textContent = currentUsers.length;

  let adminN = 0;
  currentUsers.forEach(u => {
    if (isAdminUser(u)) adminN++;
  });
  const regEl = document.getElementById("statRegularUsers");
  const admEl = document.getElementById("statAdminUsers");
  if (regEl) regEl.textContent = String(currentUsers.length - adminN);
  if (admEl) admEl.textContent = String(adminN);
  
  // Today's users
  const today = new Date().toDateString();
  const todayCount = currentUsers.filter(u => new Date(u.registeredAt).toDateString() === today).length;
  document.getElementById("statTodayUsers").textContent = todayCount;

  const trans = getTransactions();
  document.getElementById("statPaidMovies").textContent = trans.length;
  const payers = new Set(trans.map(t => normalizePhone(t.phone)));
  const hintPayers = document.getElementById("statUniquePayersHint");
  if (hintPayers) hintPayers.textContent = `фардӣ: ${payers.size}`;

  const wh = getWatchHistory();
  const plays = wh.filter(w => w.kind === "play").length;
  const pages = wh.filter(w => w.kind === "page").length;
  const wp = document.getElementById("statWatchPlays");
  const wph = document.getElementById("statWatchPagesHint");
  if (wp) wp.textContent = String(plays);
  if (wph) wph.textContent = `саҳифа: ${pages}`;

  document.getElementById("statMoviesCount").textContent = window.movies ? window.movies.length : MOVIES_COUNT_MOCK;

  renderTable();
  renderMoviesTable();
  renderTransTable();
  if (document.getElementById("tabReports") && document.getElementById("tabReports").style.display !== "none") {
    renderWatchReportTable();
    renderMovieSummaryTable();
  }
}

function getActiveTabId() {
  const t = document.querySelector(".admin-tab.active");
  return t ? t.getAttribute("data-tab") : "tabUsers";
}

function syncQuickSearchFromSection() {
  const q = document.getElementById("adminQuickSearch");
  if (!q) return;
  const tab = getActiveTabId();
  if (tab === "tabUsers") q.value = document.getElementById("userSearchInput")?.value || "";
  else if (tab === "tabMovies") q.value = document.getElementById("movieSearchInput")?.value || "";
  else if (tab === "tabTransactions") q.value = document.getElementById("transSearchInput")?.value || "";
  else if (tab === "tabReports") q.value = document.getElementById("reportSearchInput")?.value || "";
}

function applyQuickSearch(val) {
  const tab = getActiveTabId();
  if (tab === "tabUsers") {
    const el = document.getElementById("userSearchInput");
    if (el) {
      el.value = val;
      renderTable();
    }
  } else if (tab === "tabMovies") {
    const el = document.getElementById("movieSearchInput");
    if (el) {
      el.value = val;
      renderMoviesTable();
    }
  } else if (tab === "tabTransactions") {
    const el = document.getElementById("transSearchInput");
    if (el) {
      el.value = val;
      renderTransTable();
    }
  } else if (tab === "tabReports") {
    const el = document.getElementById("reportSearchInput");
    if (el) {
      el.value = val;
      renderWatchReportTable();
    }
  }
}


/* ── Table Rendering ── */
function updateSortHeaders() {
  document.querySelectorAll(".sortable").forEach(th => {
    const col = th.getAttribute("data-sort");
    let text = th.textContent.replace(/[↑↓↕]/g, "").trim();
    if (col === sortCol) {
      th.textContent = text + (sortDesc ? " ↓" : " ↑");
    } else {
      th.textContent = text + " ↕";
    }
  });
}

function renderTable() {
  const tbody = document.getElementById("usersTableBody");
  const emptyState = document.getElementById("emptyUsersState");
  const countLabel = document.getElementById("usersCountLabel");
  const search = document.getElementById("userSearchInput")?.value.toLowerCase().trim() || "";
  const roleFilterValue = document.getElementById("userRoleFilter")?.value || "all";
  
  if(!tbody) return;

  // Filter
  let filtered = currentUsers.filter(u => {
    let role = isAdminUser(u) ? 'admin' : 'user';
    if (roleFilterValue !== "all" && role !== roleFilterValue) return false;
    if (!search) return true;
    return (u.name && u.name.toLowerCase().includes(search)) || 
           (u.phone && normalizePhone(u.phone).includes(normalizePhone(search)));
  });

  // Sort
  filtered.sort((a,b) => {
    let valA, valB;
    if (sortCol === 'name') {
      valA = (a.name || "").toLowerCase();
      valB = (b.name || "").toLowerCase();
    } else { // date
      valA = new Date(a.registeredAt || 0).getTime();
      valB = new Date(b.registeredAt || 0).getTime();
    }
    
    if (valA < valB) return sortDesc ? 1 : -1;
    if (valA > valB) return sortDesc ? -1 : 1;
    return 0;
  });

  // Render
  tbody.innerHTML = "";
  let adminCount = 0;
  if (filtered.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    filtered.forEach((u, index) => {
      let role = isAdminUser(u) ? 'admin' : 'user';
      if(role==='admin') adminCount++;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="th-id">${index + 1}</td>
        <td class="user-row__name">${u.name || "Номаълум"}</td>
        <td class="user-row__phone">${formatPhoneDisplay(u.phone)}</td>
        <td><span class="badge-role ${role}">${role === 'admin' ? 'Админ' : 'Корбар'}</span></td>
        <td class="user-row__date">${formatDate(u.registeredAt)}</td>
        <td class="th-actions user-row__actions">
          <button class="action-btn action-btn--edit" title="Тағйир додан" onclick="openEditModal(${u.id})">✏️</button>
          <button class="action-btn action-btn--delete" title="Нест кардан" onclick="openConfirmDelete(${u.id}, '${u.name||formatPhoneDisplay(u.phone)}')">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  if(countLabel) {
    countLabel.textContent = `${filtered.length} корбар (${adminCount} админ)`;
  }
}

function renderMoviesTable() {
  const tbody = document.getElementById("moviesTableBody");
  const emptyState = document.getElementById("emptyMoviesState");
  if(!tbody) return;
  const searchInput = document.getElementById("movieSearchInput");
  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const mv = getMovies();
  let filtered = mv.filter(m => {
    const t = (m.title || "").toLowerCase();
    const g = (m.genre || "").toLowerCase();
    return !search || t.includes(search) || g.includes(search);
  });

  const trans = getTransactions();
  const watch = getWatchHistory();

  tbody.innerHTML = "";
  if(filtered.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    filtered.forEach((m, index) => {
      let payN = trans.filter(t => t.movieId === m.id).length;
      let pageN = watch.filter(w => w.movieId === m.id && w.kind === "page").length;
      let playN = watch.filter(w => w.movieId === m.id && w.kind === "play").length;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="th-id">${index + 1}</td>
        <td class="th-poster"></td>
        <td class="user-row__name">${m.title}</td>
        <td>${m.genre}</td>
        <td>⭐ ${m.rating}</td>
        <td>${payN}</td>
        <td>${pageN}</td>
        <td>${playN}</td>
        <td class="th-actions user-row__actions">
          <button class="action-btn action-btn--edit" title="Тағйир" onclick="openMovieModal(${m.id})">✏️</button>
          <button class="action-btn action-btn--delete" title="Нест" onclick="deleteMovie(${m.id})">🗑️</button>
          <button class="action-btn action-btn--view" title="Ҳисобот" onclick="openReportModal(${m.id})">📊</button>
        </td>
      `;
      const imgTd = tr.querySelector(".th-poster");
      if (imgTd) {
        const img = document.createElement("img");
        img.src = m.image || "";
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.referrerPolicy = "no-referrer";
        img.onerror = function () {
          this.onerror = null;
          if (typeof window.POSTER_FALLBACK === "string") this.src = window.POSTER_FALLBACK;
        };
        imgTd.appendChild(img);
      }
      tbody.appendChild(tr);
    });
  }
}

// Movies CRUD (admin)
document.getElementById("addMovieBtn")?.addEventListener("click", function () {
  openMovieModal(null);
});
document.getElementById("movieEditForm")?.addEventListener("submit", handleMovieSave);
document.getElementById("exportMoviesBtn")?.addEventListener("click", exportMoviesCSV);

function openMovieModal(movieId) {
  const modal = document.getElementById("movieEditModal");
  if (!modal) return;
  document.querySelectorAll("#movieEditModal .error-text").forEach(el => el.textContent = "");

  const mv = getMovies();
  const m = movieId ? mv.find(x => x.id === movieId) : null;

  document.getElementById("movieModalTitle").textContent = m ? "Тағйири филм" : "Филми нав";
  document.getElementById("movieEditId").value = m ? String(m.id) : "";
  document.getElementById("movieTitleInput").value = m ? (m.title || "") : "";
  document.getElementById("movieGenreInput").value = m ? (m.genre || "") : "";
  document.getElementById("movieRatingInput").value = m && m.rating != null ? String(m.rating) : "";
  document.getElementById("movieYearInput").value = m && m.year != null ? String(m.year) : "";
  document.getElementById("movieDurationInput").value = m ? (m.duration || "") : "";
  document.getElementById("movieImageInput").value = m ? (m.image || "") : "";
  document.getElementById("movieVideoInput").value = m ? (m.video || "") : "";
  document.getElementById("movieDescInput").value = m ? (m.description || "") : "";

  modal.style.display = "flex";
  setTimeout(() => document.getElementById("movieTitleInput")?.focus(), 50);
}

function closeMovieModal() {
  const modal = document.getElementById("movieEditModal");
  if (modal) modal.style.display = "none";
}

function handleMovieSave(e) {
  e.preventDefault();
  const idRaw = document.getElementById("movieEditId").value;
  const title = document.getElementById("movieTitleInput").value.trim();
  const genre = document.getElementById("movieGenreInput").value.trim();

  const titleErr = document.getElementById("movieTitleError");
  const genreErr = document.getElementById("movieGenreError");
  if (titleErr) titleErr.textContent = "";
  if (genreErr) genreErr.textContent = "";

  let ok = true;
  if (title.length < 1) { if (titleErr) titleErr.textContent = "Ном лозим аст"; ok = false; }
  if (genre.length < 1) { if (genreErr) genreErr.textContent = "Жанр лозим аст"; ok = false; }
  if (!ok) return;

  const rating = parseFloat(document.getElementById("movieRatingInput").value || "0") || 0;
  const yearVal = document.getElementById("movieYearInput").value.trim();
  const year = yearVal ? parseInt(yearVal, 10) : "";
  const duration = document.getElementById("movieDurationInput").value.trim();
  const image = document.getElementById("movieImageInput").value.trim();
  const video = document.getElementById("movieVideoInput").value.trim();
  const description = document.getElementById("movieDescInput").value.trim();

  let list = getMovies().slice();
  if (idRaw) {
    const id = parseInt(idRaw, 10);
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) { showToast("Филм ёфт нашуд", "error"); return; }
    list[idx] = { ...list[idx], title, genre, rating, year, duration, image, video, description };
  } else {
    const maxId = list.reduce((a, m) => Math.max(a, Number(m.id) || 0), 0);
    const id = maxId + 1;
    list.push({ id, title, genre, rating, year, duration, image, video, description, featured: false });
  }

  saveMovies(list);
  closeMovieModal();
  refreshData();
  showToast("Филм нигоҳ дошта шуд", "success");
}

function deleteMovie(movieId) {
  const list = getMovies();
  const m = list.find(x => x.id === movieId);
  if (!m) return;
  if (!confirm(`Нест кунем: «${m.title}» ?`)) return;
  const next = list.filter(x => x.id !== movieId);
  saveMovies(next);
  refreshData();
  showToast("Филм нест шуд", "success");
}

function exportMoviesCSV() {
  const list = getMovies();
  if (!list.length) {
    showToast("Рӯйхати филмҳо холӣ аст", "error");
    return;
  }
  let csv = "Id,Title,Genre,Rating,Year,Duration,Image,Video,Description\n";
  list.forEach(m => {
    const esc = v => String(v ?? "").replace(/"/g, '""');
    csv += `"${esc(m.id)}","${esc(m.title)}","${esc(m.genre)}","${esc(m.rating)}","${esc(m.year)}","${esc(m.duration)}","${esc(m.image)}","${esc(m.video)}","${esc(m.description)}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `kino_movies_${new Date().toISOString().split("T")[0]}.csv`;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function renderTransTable() {
  const tbody = document.getElementById("transTableBody");
  const emptyState = document.getElementById("emptyTransState");
  if(!tbody) return;
  const q = (document.getElementById("transSearchInput")?.value || "").toLowerCase().trim();
  let trans = getTransactions().sort((a,b) => new Date(b.date) - new Date(a.date));
  if (q) {
    trans = trans.filter(t => {
      const m = window.movies ? window.movies.find(x => x.id === t.movieId) : null;
      const mTitle = (m ? m.title : "Филм #" + t.movieId).toLowerCase();
      const phone = normalizePhone(t.phone);
      const u = getAllUsers().find(user => normalizePhone(user.phone) === phone);
      const name = (u && u.name ? u.name : "").toLowerCase();
      return mTitle.includes(q) || phone.includes(normalizePhone(q)) || name.includes(q);
    });
  }
  
  tbody.innerHTML = "";
  if(trans.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    trans.forEach((t, index) => {
      let m = window.movies ? window.movies.find(x => x.id === t.movieId) : null;
      let mTitle = m ? m.title : "Филм #" + t.movieId;
      const phoneNorm = normalizePhone(t.phone);
      const u = getAllUsers().find(user => normalizePhone(user.phone) === phoneNorm);
      const dispName = u && u.name ? u.name : "—";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="th-id">${index + 1}</td>
        <td class="user-row__name">${dispName}</td>
        <td class="user-row__phone">${formatPhoneDisplay(t.phone)}</td>
        <td class="user-row__name">${mTitle}</td>
        <td>${t.amount} сомонӣ</td>
        <td class="user-row__date">${formatDate(t.date)}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

/* ── Movie Report Modal ── */
function openReportModal(movieId) {
  const modal = document.getElementById("movieReportModal");
  if(!modal) return;
  
  let m = window.movies ? window.movies.find(x => x.id === movieId) : null;
  let movieTitle = m ? m.title : "Филм #" + movieId;
  
  document.getElementById("reportModalTitle").textContent = "Ҳисобот: " + movieTitle;
  
  const tbody = document.getElementById("movieReportTableBody");
  const emptyState = document.getElementById("emptyReportState");
  tbody.innerHTML = "";
  
  const trans = getTransactions().filter(t => t.movieId === movieId).sort((a,b) => new Date(b.date) - new Date(a.date));
  
  if(trans.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    trans.forEach((t, i) => {
      let u = getAllUsers().find(user => normalizePhone(user.phone) === normalizePhone(t.phone));
      let userName = u ? u.name : "Номаълум";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="th-id">${i + 1}</td>
        <td class="user-row__name">${userName}</td>
        <td class="user-row__phone">${formatPhoneDisplay(t.phone)}</td>
        <td class="user-row__date">${formatDate(t.date)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const wbody = document.getElementById("movieWatchReportTableBody");
  const wempty = document.getElementById("emptyWatchMovieState");
  if (wbody && wempty) {
    wbody.innerHTML = "";
    const events = getWatchHistory()
      .filter(w => w.movieId === movieId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    if (events.length === 0) {
      wempty.style.display = "block";
    } else {
      wempty.style.display = "none";
      events.forEach((ev, i) => {
        const name = ev.name || "—";
        const kindLabel = ev.kind === "play" ? "▶ Тамошо" : "📄 Саҳифа";
        const kindClass = ev.kind === "play" ? "badge-kind badge-kind--play" : "badge-kind badge-kind--page";
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="th-id">${i + 1}</td>
          <td class="user-row__name">${name}</td>
          <td class="user-row__phone">${formatPhoneDisplay(ev.phone)}</td>
          <td><span class="${kindClass}">${kindLabel}</span></td>
          <td class="user-row__date">${formatDate(ev.date)}</td>
        `;
        wbody.appendChild(tr);
      });
    }
  }
  
  modal.style.display = "flex";
}

function closeReportModal() {
  const modal = document.getElementById("movieReportModal");
  if(modal) modal.style.display = "none";
}

// Add event listener to Export Transactions
document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("exportTransBtn");
    if(el) el.addEventListener('click', exportTransCSV);
});

function exportTransCSV() {
  const trans = getTransactions();
  if (trans.length === 0) {
    showToast("Рӯйхати пардохтҳо холӣ аст", "error");
    return;
  }
  let csv = "ID,Name,Phone,Movie,Amount,Date\n";
  trans.forEach((t, i) => {
    let m = window.movies ? window.movies.find(x => x.id === t.movieId) : null;
    let mTitle = m ? m.title : "Филм #" + t.movieId;
    const u = getAllUsers().find(user => normalizePhone(user.phone) === normalizePhone(t.phone));
    const dispName = u && u.name ? u.name.replace(/"/g, '""') : "";
    csv += `"${i+1}","${dispName}","${t.phone}","${mTitle.replace(/"/g, '""')}","${t.amount}","${t.date}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `kino_transactions_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function renderWatchReportTable() {
  const tbody = document.getElementById("watchReportTableBody");
  const emptyState = document.getElementById("emptyWatchReportState");
  if (!tbody) return;
  const q = (document.getElementById("reportSearchInput")?.value || "").toLowerCase().trim();
  const kind = document.getElementById("reportKindFilter")?.value || "all";
  let rows = getWatchHistory().slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (kind !== "all") {
    rows = rows.filter(w => w.kind === kind);
  }
  if (q) {
    rows = rows.filter(w => {
      const m = window.movies ? window.movies.find(x => x.id === w.movieId) : null;
      const title = (m ? m.title : "Филм #" + w.movieId).toLowerCase();
      const phone = normalizePhone(w.phone);
      const name = (w.name || "").toLowerCase();
      return title.includes(q) || phone.includes(normalizePhone(q)) || name.includes(q);
    });
  }
  tbody.innerHTML = "";
  if (rows.length === 0) {
    if (emptyState) emptyState.style.display = "block";
  } else {
    if (emptyState) emptyState.style.display = "none";
    rows.forEach((w, i) => {
      const m = window.movies ? window.movies.find(x => x.id === w.movieId) : null;
      const mTitle = m ? m.title : "Филм #" + w.movieId;
      const kindLabel = w.kind === "play" ? "▶ Тамошо" : "📄 Саҳифа";
      const kindClass = w.kind === "play" ? "badge-kind badge-kind--play" : "badge-kind badge-kind--page";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="th-id">${i + 1}</td>
        <td class="user-row__name">${w.name || "—"}</td>
        <td class="user-row__phone">${formatPhoneDisplay(w.phone)}</td>
        <td class="user-row__name">${mTitle}</td>
        <td><span class="${kindClass}">${kindLabel}</span></td>
        <td class="user-row__date">${formatDate(w.date)}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function renderMovieSummaryTable() {
  const tbody = document.getElementById("movieSummaryTableBody");
  if (!tbody) return;
  const mv = window.movies || [];
  const trans = getTransactions();
  const watch = getWatchHistory();
  tbody.innerHTML = "";
  mv.forEach((m, index) => {
    const payN = trans.filter(t => t.movieId === m.id).length;
    const pageN = watch.filter(w => w.movieId === m.id && w.kind === "page").length;
    const playN = watch.filter(w => w.movieId === m.id && w.kind === "play").length;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="th-id">${index + 1}</td>
      <td class="th-poster"></td>
      <td class="user-row__name">${m.title}</td>
      <td>${payN}</td>
      <td>${pageN}</td>
      <td>${playN}</td>
    `;
    const imgTd = tr.querySelector(".th-poster");
    if (imgTd) {
      const img = document.createElement("img");
      img.src = m.image || "";
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.onerror = function () {
        this.onerror = null;
        if (typeof window.POSTER_FALLBACK === "string") this.src = window.POSTER_FALLBACK;
      };
      imgTd.appendChild(img);
    }
    tbody.appendChild(tr);
  });
}

function exportWatchCSV() {
  const rows = getWatchHistory();
  if (rows.length === 0) {
    showToast("Рӯйхати тамошо холӣ аст", "error");
    return;
  }
  let csv = "MovieId,MovieTitle,Name,Phone,Kind,Date\n";
  rows.forEach(w => {
    const m = window.movies ? window.movies.find(x => x.id === w.movieId) : null;
    const mTitle = m ? m.title.replace(/"/g, '""') : "Филм #" + w.movieId;
    const name = (w.name || "").replace(/"/g, '""');
    csv += `"${w.movieId}","${mTitle}","${name}","${w.phone}","${w.kind || "page"}","${w.date}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `kino_watch_${new Date().toISOString().split("T")[0]}.csv`;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


/* ── Add User Modal ── */
document.getElementById("addUserBtn")?.addEventListener("click", openAddModal);
document.getElementById("addUserForm")?.addEventListener("submit", handleAddUser);

function openAddModal() {
  const modal = document.getElementById("addUserModal");
  if(modal) {
    modal.style.display = "flex";
    document.getElementById("addUserForm").reset();
    document.querySelectorAll("#addUserForm .error-text").forEach(el => el.textContent="");
    document.getElementById("addUserName").focus();
  }
}
function closeAddModal() {
  const modal = document.getElementById("addUserModal");
  if(modal) modal.style.display = "none";
}

function handleAddUser(e) {
  e.preventDefault();
  const nameEl = document.getElementById("addUserName");
  const phoneEl = document.getElementById("addUserPhone");
  const passEl = document.getElementById("addUserPassword");
  
  const nameError = document.getElementById("addNameError");
  const phoneError = document.getElementById("addPhoneError");
  const passError = document.getElementById("addPasswordError");
  
  nameError.textContent = ""; phoneError.textContent = ""; passError.textContent = "";

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const password = passEl.value;

  let ok = true;
  if(name.length < 2) { nameError.textContent = "Ном кӯтоҳ аст"; ok = false; }
  
  let normPhone = normalizePhone(phone);
  if(normPhone.length < 9) {
    phoneError.textContent = "Рақами телефон нодуруст"; ok = false;
  } else if (currentUsers.find(u => normalizePhone(u.phone) === normPhone)) {
    phoneError.textContent = "Ин рақам аллакай вуҷуд дорад"; ok = false;
  }

  if(password.length < 6) { passError.textContent = "Парол кӯтоҳ аст (ҳад. 6)"; ok = false; }

  if(!ok) return;

  const newUser = {
    id: Date.now(),
    name: name,
    phone: normPhone,
    passwordHash: simpleHash(password),
    registeredAt: new Date().toISOString()
  };

  currentUsers.push(newUser);
  saveAllUsers(currentUsers);
  closeAddModal();
  refreshData();
  showToast("Корбар илова карда шуд", "success");
}

/* ── Edit User Modal ── */
document.getElementById("editUserForm")?.addEventListener("submit", handleEditUser);

function openEditModal(userId) {
  const user = currentUsers.find(u => u.id === userId);
  if(!user) return;

  const modal = document.getElementById("editUserModal");
  if(modal) {
    modal.style.display = "flex";
    document.querySelectorAll("#editUserForm .error-text").forEach(el => el.textContent="");
    
    document.getElementById("editUserId").value = user.id;
    document.getElementById("editUserName").value = user.name || "";
    document.getElementById("editUserPhone").value = "+" + normalizePhone(user.phone);
    document.getElementById("editUserPassword").value = ""; // leave blank
  }
}

function closeEditModal() {
  const modal = document.getElementById("editUserModal");
  if(modal) modal.style.display = "none";
}

function handleEditUser(e) {
  e.preventDefault();
  
  const idEl = document.getElementById("editUserId");
  const nameEl = document.getElementById("editUserName");
  const phoneEl = document.getElementById("editUserPhone");
  const passEl = document.getElementById("editUserPassword");
  
  const nameError = document.getElementById("editNameError");
  const phoneError = document.getElementById("editPhoneError");
  
  nameError.textContent = ""; phoneError.textContent = "";

  const id = parseInt(idEl.value, 10);
  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const password = passEl.value;

  const userIdx = currentUsers.findIndex(u => u.id === id);
  if(userIdx === -1) return;

  let ok = true;
  if(name.length < 2) { nameError.textContent = "Ном кӯтоҳ аст"; ok = false; }
  
  let normPhone = normalizePhone(phone);
  if(normPhone.length < 9) {
    phoneError.textContent = "Рақами телефон нодуруст"; ok = false;
  } else {
    const existing = currentUsers.find(u => normalizePhone(u.phone) === normPhone && u.id !== id);
    if (existing) {
      phoneError.textContent = "Ин рақамро дигар корбар истифода мебарад"; ok = false;
    }
  }

  if(!ok) return;

  // Update
  currentUsers[userIdx].name = name;
  currentUsers[userIdx].phone = normPhone;
  if(password && password.length >= 6) {
    currentUsers[userIdx].passwordHash = simpleHash(password);
  }

  saveAllUsers(currentUsers);
  closeEditModal();
  refreshData();
  showToast("Маълумоти корбар навсозӣ шуд", "success");
}

/* ── Delete User ── */
document.getElementById("confirmDeleteYes")?.addEventListener("click", handleDeleteUser);

function openConfirmDelete(userId, userName) {
  userToDeleteId = userId;
  const modal = document.getElementById("confirmDeleteModal");
  if(modal) {
    document.getElementById("confirmDeleteText").textContent = `Шумо мутмаинед, ки мехоҳед корбар «${userName}»-ро нест кунед?`;
    modal.style.display = "flex";
  }
}

function closeConfirmModal() {
  const modal = document.getElementById("confirmDeleteModal");
  if(modal) modal.style.display = "none";
  userToDeleteId = null;
}

function handleDeleteUser() {
  if(!userToDeleteId) return;
  currentUsers = currentUsers.filter(u => u.id !== userToDeleteId);
  saveAllUsers(currentUsers);
  closeConfirmModal();
  refreshData();
  showToast("Корбар нест карда шуд", "success");
}

/* ── Utilities ── */
function showToast(msg, type="success") {
  const toast = document.getElementById("adminToast");
  if(!toast) return;
  
  toast.textContent = msg;
  toast.className = `admin-toast admin-toast--${type}`;
  toast.style.display = "block";
  toast.style.animation = "none";
  void toast.offsetWidth; // trigger reflow
  toast.style.animation = "slideInFromRight .4s cubic-bezier(.34,1.56,.64,1)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(28px)";
    toast.style.transition = "opacity .3s, transform .3s";
    setTimeout(() => {
      toast.style.display = "none";
      toast.style.opacity = "1";
      toast.style.transform = "none";
    }, 350);
  }, 3000);
}

function toggleAdminPass() { togglePass("adminPass"); }
function toggleAddPass() { togglePass("addUserPassword"); }
function toggleEditPass() { togglePass("editUserPassword"); }

function togglePass(id) {
  const input = document.getElementById(id);
  const btn = input.nextElementSibling;
  if(input.type === "password") {
    input.type = "text";
    if(btn) { btn.textContent = "🔒"; btn.classList.add("active"); }
  } else {
    input.type = "password";
    if(btn) { btn.textContent = "👁"; btn.classList.remove("active"); }
  }
}

// Auto-format phones in edit/add modals
["addUserPhone", "editUserPhone"].forEach(id => {
  const el = document.getElementById(id);
  if(el) {
    el.addEventListener("input", function() {
      let val = el.value.replace(/[^\d+]/g, "");
      if (val && !val.startsWith("+") && !val.startsWith("9")) { val = "+992" + val; }
      if (val.startsWith("992") && !val.startsWith("+")) { val = "+" + val; }
      el.value = val;
    });
  }
});

// CSV Export
function exportUsersCSV() {
  if (currentUsers.length === 0) {
    showToast("Рӯйхати корбарон холӣ аст", "error");
    return;
  }
  let csv = "ID,Name,Phone,Role,Registered At\n";
  currentUsers.forEach(u => {
    const role = isAdminUser(u) ? "admin" : "user";
    csv += `"${u.id}","${(u.name||"").replace(/"/g, '""')}","${u.phone}","${role}","${u.registeredAt}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `kino_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
