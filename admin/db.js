const DB_TABLES = {
  users: {
    label: 'users',
    endpoint: '/api/users'
  },
  movies: {
    label: 'movies',
    endpoint: '/api/movies'
  },
  transactions: {
    label: 'transactions',
    endpoint: '/api/transactions'
  },
  history: {
    label: 'watch_history',
    endpoint: '/api/history'
  },
  purchase_requests: {
    label: 'purchase_requests',
    endpoint: '/api/purchase-requests'
  }
};

let currentTable = 'users';
let currentData = {};

function isAdminSession() {
  return localStorage.getItem('kinoTJ_admin') === 'true';
}

function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function buildHeaders(rows) {
  const head = document.getElementById('dbTableHead');
  head.innerHTML = '';
  if (!rows.length) {
    head.innerHTML = '<th>Нет столбцов</th>';
    return;
  }
  const columns = Object.keys(rows[0]);
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    head.appendChild(th);
  });
}

function buildRows(rows, query) {
  const tbody = document.getElementById('dbTableBody');
  const emptyState = document.getElementById('dbEmptyState');
  const count = document.getElementById('dbRecordCount');
  const filtered = rows.filter(row => {
    if (!query) return true;
    const text = Object.values(row).map(formatValue).join(' ').toLowerCase();
    return text.includes(query.toLowerCase());
  });

  tbody.innerHTML = '';
  if (!filtered.length) {
    emptyState.style.display = 'block';
    count.textContent = '0';
    return;
  }
  emptyState.style.display = 'none';
  filtered.forEach(row => {
    const tr = document.createElement('tr');
    Object.keys(row).forEach(col => {
      const td = document.createElement('td');
      td.textContent = formatValue(row[col]);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  count.textContent = String(filtered.length);
}

function selectTable(tableName) {
  currentTable = tableName;
  document.querySelectorAll('.db-table-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.table === tableName);
  });
  document.getElementById('dbTableName').textContent = DB_TABLES[tableName].label;
  renderCurrentTable();
}

async function fetchTableData(tableName) {
  const info = DB_TABLES[tableName];
  if (!info) return [];
  try {
    const response = await fetch(info.endpoint, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}`);
    }
    const data = await response.json();
    currentData[tableName] = Array.isArray(data) ? data : [];
    return currentData[tableName];
  } catch (error) {
    console.error('Ошибка загрузки таблицы', tableName, error);
    currentData[tableName] = [];
    return [];
  }
}

async function loadAllTables() {
  const promises = Object.keys(DB_TABLES).map(name => fetchTableData(name));
  await Promise.all(promises);
}

async function renderCurrentTable() {
  const data = currentData[currentTable] || [];
  const query = document.getElementById('dbSearchInput').value.trim();
  buildHeaders(data);
  buildRows(data, query);
  document.getElementById('dbCount').textContent = `${data.length} записей`;
}

async function refreshDBViewer() {
  await loadAllTables();
  renderCurrentTable();
}

function setupDBViewer() {
  if (!isAdminSession()) {
    window.location.href = 'index.html';
    return;
  }

  document.querySelectorAll('.db-table-btn').forEach(btn => {
    btn.addEventListener('click', () => selectTable(btn.dataset.table));
  });

  document.getElementById('dbSearchInput').addEventListener('input', () => {
    renderCurrentTable();
  });

  document.getElementById('dbRefreshBtn').addEventListener('click', refreshDBViewer);
  document.getElementById('dbRefreshButton').addEventListener('click', refreshDBViewer);

  refreshDBViewer();
}

window.addEventListener('DOMContentLoaded', setupDBViewer);
