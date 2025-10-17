

// frontend/js/app.js
const API = 'http://localhost:5050/api';

// ---- Login / Signup page wiring ----
if (document.getElementById('tab-login')) {
  document.getElementById('tab-login').addEventListener('click', () => toggleTab('login'));
  document.getElementById('tab-signup').addEventListener('click', () => toggleTab('signup'));
  document.getElementById('btn-login').addEventListener('click', doLogin);
  document.getElementById('btn-signup').addEventListener('click', doSignup);
}

function toggleTab(t) {
  document.getElementById('tab-login').classList.toggle('active', t==='login');
  document.getElementById('tab-signup').classList.toggle('active', t==='signup');
  document.getElementById('login-form').classList.toggle('hidden', t!=='login');
  document.getElementById('signup-form').classList.toggle('hidden', t!=='signup');
}

async function doSignup(){
  const name=document.getElementById('signup-name').value.trim();
  const email=document.getElementById('signup-email').value.trim();
  const password=document.getElementById('signup-password').value;
  const password2=document.getElementById('signup-password2').value;
  const role=document.getElementById('signup-role').value;
  const msg=document.getElementById('signup-msg');
  msg.textContent='';
  if(!name||!email||!password){ msg.textContent='Please fill all fields'; return; }
  if(password!==password2){ msg.textContent='Passwords do not match'; return; }
  try{
    const res = await fetch(`${API}/auth/signup`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if(!res.ok){ msg.textContent = data.message || 'Signup failed'; return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    if(data.role === 'Admin') location.href = 'admin_dashboard.html';
    else location.href = 'client_dashboard.html';
  }catch(err){ console.error(err); msg.textContent='Server error'; }
}

async function doLogin(){
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const msg = document.getElementById('login-msg');
  msg.textContent = '';
  if(!email||!password){ msg.textContent='Please enter email and password'; return; }
  try{
    const res = await fetch(`${API}/auth/login`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if(!res.ok){ msg.textContent = data.message || 'Login failed'; return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    if(data.role === 'Admin') location.href = 'admin_dashboard.html';
    else location.href = 'client_dashboard.html';
  }catch(err){ console.error(err); msg.textContent='Server error'; }
}

// ---- helpers ----
function apiHeaders(){
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// ---- Client dashboard behavior ----
if (document.querySelector('.dashboard') && location.pathname.includes('client_dashboard')) {
  // set username
  const userNameEl = document.getElementById('user-name');
  const role = localStorage.getItem('role');
  userNameEl.textContent = role || 'Client';

  document.querySelectorAll('.sidebar a[data-page]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      loadClientPage(a.dataset.page);
    });
  });

  document.getElementById('logout')?.addEventListener('click', ()=>{ localStorage.clear(); location.href='index.html'; });

  loadClientPage('houses');
}

async function loadClientPage(page) {
  const main = document.getElementById('main-area');
  if(page === 'houses'){
    main.innerHTML = '<h2>House Rentals</h2><div><input id="search-q" placeholder="Search houses"/> <select id="filter-type"><option value="">All</option><option value="House">House</option></select> <button id="btn-search">Search</button></div><div id="items" class="grid"></div>';
    document.getElementById('btn-search').addEventListener('click', loadHouses);
    await loadHouses();
  } else if(page === 'adventures'){
    main.innerHTML = '<h2>Adventure Packages</h2><div id="items" class="grid"></div>';
    await loadAdventures();
  } 
  else if (page === 'booking') {
  main.innerHTML = `
    <h2>Make a Booking</h2>
    <form id="booking-form" class="booking-form">
      <label>Item ID:
        <input id="book-item" required>
      </label>
      <label>Start Date:
        <input id="book-start" type="date" required>
      </label>
      <label>End Date:
        <input id="book-end" type="date" required>
      </label>
      <label>Number of Adults:
        <input id="book-adults" type="number" min="1" value="1" required>
      </label>
      <label>Number of Children:
        <input id="book-children" type="number" min="0" value="0" required>
      </label>
      <button type="submit">Proceed to Payment</button>
    </form>
    <p id="book-msg"></p>
  `;

  document.getElementById('booking-form').addEventListener('submit', async (e)=>{
    e.preventDefault();

    // collect form data
    const itemId = document.getElementById('book-item').value;
    const startDate = document.getElementById('book-start').value;
    const endDate = document.getElementById('book-end').value;
    const adults = parseInt(document.getElementById('book-adults').value) || 1;
    const children = parseInt(document.getElementById('book-children').value) || 0;

    // temporarily store booking info in localStorage to pass to payment page
    localStorage.setItem('pendingBooking', JSON.stringify({ itemId, startDate, endDate, adults, children }));

    // redirect to fake payment page
    location.href = 'payment.html';
  });
}

  
  else if(page === 'report'){
    main.innerHTML = `
      <h2>Submit a Report</h2>
      <form id="report-form">
        <input id="report-title" placeholder="Title" required />
        <textarea id="report-message" placeholder="Message" required></textarea>
        <button type="submit">Send Report</button>
      </form>
      <p id="report-msg"></p>
    `;
    document.getElementById('report-form').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const title = document.getElementById('report-title').value;
      const message = document.getElementById('report-message').value;
      try{
        const res = await fetch(`${API}/client/report`, { method:'POST', headers: apiHeaders(), body: JSON.stringify({ title, message }) });
        const data = await res.json();
        document.getElementById('report-msg').textContent = res.ok ? 'Report sent' : (data.message || 'Failed');
      }catch(err){ console.error(err); document.getElementById('report-msg').textContent='Server error'; }
    });
  } else if(page === 'profile'){
    main.innerHTML = '<h2>Profile</h2><p>Profile info loaded from token.</p>';
  }
}

async function loadHouses(){
  const q = document.getElementById('search-q').value || ''; const type = document.getElementById('filter-type').value || '';
  const params = new URLSearchParams(); if(q) params.set('q', q); if(type) params.set('type', type);
  try{
    const res = await fetch(`${API}/client/properties?${params.toString()}`, { headers: apiHeaders() });
    const items = await res.json();
    const container = document.getElementById('items');
    container.innerHTML = items.map(it=>`
  <article class="card">
    <img src="${it.images?.[0]||'https://picsum.photos/600/400'}"/>
    <h3>${it.title}</h3>
    <p>${it.description||''}</p>
    <p>Price: ${it.price||'N/A'}</p>
    <p><strong>Slots Remaining:</strong> ${it.slots ?? 'N/A'}</p>
    <p>ID: ${it._id}</p>
    <button onclick="promptBooking('${it._id}')">Book</button>
  </article>
`).join('');

  }catch(err){ console.error(err); document.getElementById('items').innerHTML = '<p>Error loading houses</p>'; }
}

async function loadAdventures(){
  try{
    const res = await fetch(`${API}/client/properties?type=Adventure`, { headers: apiHeaders() });
    const items = await res.json();
    const container = document.getElementById('items');
    container.innerHTML = items.map(it=>`
  <article class="card">
    <img src="${it.images?.[0]||'https://picsum.photos/600/400'}"/>
    <h3>${it.title}</h3>
    <p>${it.description||''}</p>
    <p>Price: ${it.price||'N/A'}</p>
    <p><strong>Slots Remaining:</strong> ${it.slots ?? 'N/A'}</p>
    <p>ID: ${it._id}</p>
    <button onclick="promptBooking('${it._id}')">Book</button>
  </article>
`).join('');

  }catch(err){ console.error(err); document.getElementById('items').innerHTML = '<p>Error loading adventures</p>'; }
}

function promptBooking(id){
  if(confirm('Book this item?')){
    location.hash = '#booking';
    loadClientPage('booking');
    setTimeout(()=>{ document.getElementById('book-item').value = id; }, 300);
  }
}

// ---- Admin dashboard behavior ----
if (document.querySelector('.dashboard') && location.pathname.includes('admin_dashboard')) {
  const userNameEl = document.getElementById('user-name-admin');
  const role = localStorage.getItem('role');
  userNameEl.textContent = role || 'Admin';

  document.querySelectorAll('.sidebar a[data-page]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      loadAdminPage(a.dataset.page);
    });
  });

  document.getElementById('logout')?.addEventListener('click', ()=>{ localStorage.clear(); location.href='index.html'; });

  loadAdminPage('stats');
}

async function loadAdminPage(page){
  const main = document.getElementById('main-area');
  if (page === 'stats') {
  main.innerHTML = `
    <section class="analytics">
      <h2>📊 System Analytics</h2>
      <canvas id="statsChart"></canvas>
      <div class="stats-cards" id="statsCards"></div>
    </section>
  `;

  try {
    const res = await fetch(`${API}/admin/stats`, { headers: apiHeaders() });
    const data = await res.json();

    // Show small summary cards
    document.getElementById("statsCards").innerHTML = `
      <div class="card"><h3>${data.properties}</h3><p>Properties</p></div>
      <div class="card"><h3>${data.bookings}</h3><p>Bookings</p></div>
      <div class="card"><h3>${data.reports}</h3><p>Reports</p></div>
      
    `;

    const ctx = document.getElementById("statsChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Properties", "Bookings", "Reports"],
        datasets: [{
          label: "System Overview",
          data: [data.properties, data.bookings, data.reports, data.messages],
          backgroundColor: [
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 99, 132, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)"
          ],
          borderColor: [
            "rgb(54, 162, 235)",
            "rgb(255, 99, 132)",
            "rgb(255, 206, 86)",
            "rgb(75, 192, 192)"
          ],
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Bookings, Reports, Properties & Messages Overview",
            color: "#fff",
            font: { size: 18, weight: "bold" }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#fff" },
            grid: { color: "rgba(255,255,255,0.1)" }
          },
          x: {
            ticks: { color: "#fff" },
            grid: { display: false }
          }
        }
      }
    });
  } catch (err) {
    console.error(err);
    main.innerHTML = "<p style='color:red;'>Error loading analytics</p>";
  }
}
 else if(page === 'inventory'){
    main.innerHTML = '<h2>Inventory Records</h2><button id="add-item">Add Item</button><div id="items" class="grid"></div>';
    document.getElementById('add-item').addEventListener('click', ()=>{ showInventoryForm(); });
    await loadInventory();
  } else if(page === 'reports'){
    main.innerHTML = '<h2>Client Reports</h2><div id="reports">Loading...</div>';
    try{
      const res = await fetch(`${API}/admin/reports`, { headers: apiHeaders() });
      const data = await res.json();
      document.getElementById('reports').innerHTML = data.map(r=>`<div style="border:1px solid #eee;padding:10px;margin:8px 0;"><h3>${r.title}</h3><p>${r.message}</p><p>From: ${r.user?.name||r.user}</p><p>Status: ${r.status}</p><button onclick="updateReportStatus('${r._id}','In Progress')">Mark In Progress</button> <button onclick="updateReportStatus('${r._id}','Closed')">Close</button></div>`).join('');
    }catch(err){ console.error(err); document.getElementById('reports').textContent='Error loading reports'; }
  } else if(page === 'bookings'){
    main.innerHTML = '<h2>Client Bookings</h2><div id="bookings">Loading...</div>';
    try{
      const res = await fetch(`${API}/admin/bookings`, { headers: apiHeaders() });
      const data = await res.json();
      document.getElementById('bookings').innerHTML = data.map(b=>`<div style="border:1px solid #eee;padding:8px;margin:8px 0;"><p>${b.user?.name} — ${b.item?.title} — ${b.status}</p><button onclick="confirmBooking('${b._id}')">Confirm</button> <button onclick="cancelBooking('${b._id}')">Cancel</button></div>`).join('');
    }catch(err){ console.error(err); document.getElementById('bookings').textContent='Error loading bookings'; }
  }

  
 
  else if (page === "finance") {
  main.innerHTML = `
    <h2>Finance Records</h2>
    <div class="finance-cards">
      <div class="card"><h3>This Month Revenue</h3><p id="rev-month">KSH 0</p></div>
      <div class="card"><h3>All-Time Revenue</h3><p id="rev-all">KSH 0</p></div>
    </div>
    <canvas id="rev-chart" style="max-width:600px;margin:20px auto;display:block;"></canvas>
    <h3>Transactions</h3>
    <table id="trans-table" border="1" style="width:100%;border-collapse:collapse;">
      <thead><tr><th>Client</th><th>Email</th><th>Amount (KSH)</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
      <tbody></tbody>
    </table>
  `;

  try {
    const res = await fetch(`${API}/admin/finance`, { headers: apiHeaders() });
    const data = await res.json();

    // ---- Update revenue cards ----
    document.getElementById("rev-month").textContent = `KSH ${data.totalThisMonth.toLocaleString()}`;
    document.getElementById("rev-all").textContent = `KSH ${data.totalAllTime.toLocaleString()}`;

    // ---- Fill transactions table ----
    const tbody = document.querySelector("#trans-table tbody");
    tbody.innerHTML = data.transactions.map(t => `
      <tr>
        <td>${t.client}</td>
        <td>${t.email}</td>
        <td>${t.amount}</td>
        <td>${t.method}</td>
        <td>${t.status}</td>
        <td>${new Date(t.date).toLocaleString()}</td>
      </tr>
    `).join("");

    // ---- Draw monthly revenue chart ----
    drawFinanceChart(data.months, data.totals);

  } catch (err) {
    console.error(err);
    main.innerHTML += `<p style="color:red;">Error loading finance data</p>`;
  }
}

  



  
  else if(page === 'profile'){
    main.innerHTML = '<h2>Profile</h2><p>Profile area for admin.</p>';
  }else if(page === 'messages'){
  const main = document.getElementById('main-area');
  main.innerHTML = '<h2>Client Messages</h2><div id="messages">Loading...</div>';
  const res = await fetch(`${API}/contact`, { headers: apiHeaders() });
  const data = await res.json();
  document.getElementById('messages').innerHTML = data.map(msg => `
    <div class="card msg-card">
      <h3>${msg.name} (${msg.email})</h3>
      <p>${msg.message}</p>
      <p><strong>Status:</strong> ${msg.status}</p>
      <small>${new Date(msg.createdAt).toLocaleString()}</small><br>
      <button onclick="updateMessageStatus('${msg._id}','In Progress')">In Progress</button>
      <button onclick="updateMessageStatus('${msg._id}','Closed')">Close</button>
    </div>
  `).join('');
}

}

//financial graphical presentation

function drawFinanceChart(labels, values) {
  const ctx = document.getElementById("rev-chart").getContext("2d");
  if (window.financeChart) window.financeChart.destroy(); // prevent duplicates
  window.financeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Monthly Revenue (KSH)",
        data: values,
        borderWidth: 1
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}







async function updateMessageStatus(id, status){
  await fetch(`${API}/contact/${id}/status`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({ status })
  });
  loadAdminPage('messages');
}



async function loadInventory(){
  try{
    const res = await fetch(`${API}/admin/inventory`, { headers: apiHeaders() });
    const items = await res.json();
    document.getElementById('items').innerHTML = items.map(it=>`<article class="card"><img src="${it.images?.[0]||'https://picsum.photos/600/400'}"/><h3>${it.title}</h3><p>${it.description||''}</p><p>Price: ${it.price||'N/A'}</p><p>ID: ${it._id}</p><button onclick="showInventoryForm('${it._id}')">Edit</button> <button onclick="deleteInventory('${it._id}')">Delete</button></article>`).join('');
  }catch(err){ console.error(err); document.getElementById('items').innerHTML='<p>Error loading inventory</p>'; }
}

function showInventoryForm(id){
  const main = document.getElementById('main-area');
  if(!id){
    main.innerHTML = `
      <h2>Add Item</h2>
      <form id="inv-form">
        <input id="inv-title" placeholder="Title" required />
        <textarea id="inv-desc" placeholder="Description"></textarea>
        <input id="inv-price" placeholder="Price" />
        <input id="inv-images" placeholder="Comma separated image URLs" />
        <input id="inv-slots" placeholder="Total Slots" type="number" min="1" value="5" />
        <select id="inv-type"><option value="House">House</option><option value="Adventure">Adventure</option></select>
        <button type="submit">Save</button>
      </form>
      <p id="inv-msg"></p>
    `;
    document.getElementById('inv-form').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = {
        title: document.getElementById('inv-title').value,
        description: document.getElementById('inv-desc').value,
        price: Number(document.getElementById('inv-price').value) || 0,
        images: document.getElementById('inv-images').value.split(',').map(s=>s.trim()).filter(Boolean),
        type: document.getElementById('inv-type').value,
        slots: Number(document.getElementById('inv-slots').value) || 0
      };
      try{
        const res = await fetch(`${API}/admin/inventory`, { method:'POST', headers: apiHeaders(), body: JSON.stringify(body) });
        const data = await res.json();
        document.getElementById('inv-msg').textContent = res.ok ? 'Saved' : (data.message || 'Error');
        if(res.ok) loadInventory();
      }catch(err){ console.error(err); document.getElementById('inv-msg').textContent='Server error'; }
    });
  } else {
    alert('Edit form placeholder. Implement prefilling & PUT logic if needed.');
  }
}

async function deleteInventory(id){
  if(!confirm('Delete item?')) return;
  try{
    const res = await fetch(`${API}/admin/inventory/${id}`, { method:'DELETE', headers: apiHeaders() });
    if(res.ok) loadInventory();
  }catch(err){ console.error(err); }
}

async function updateReportStatus(id,status){
  try{
    await fetch(`${API}/admin/reports/${id}/status`, { method:'POST', headers: apiHeaders(), body: JSON.stringify({ status }) });
    loadAdminPage('reports');
  }catch(err){ console.error(err); }
}

async function confirmBooking(id){ try{ await fetch(`${API}/admin/bookings/${id}/confirm`, { method:'POST', headers: apiHeaders() }); loadAdminPage('bookings'); }catch(err){ console.error(err); } }
async function cancelBooking(id){ try{ await fetch(`${API}/admin/bookings/${id}/cancel`, { method:'POST', headers: apiHeaders() }); loadAdminPage('bookings'); }catch(err){ console.error(err); } }
