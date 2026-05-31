// --- INISIALISASI VARIABEL GLOBAL ---
let DB = {
    dosen: [
        {id: "101", nama: "Prof. Dr. Dikdik Harjadi, M.Si"},
        {id: "102", nama: "Dr. Lili Karmela Fitriani, M.Si"},
        {id: "103", nama: "Dr. Herma Wiharno, M.Si"},
        {id: "104", nama: "Dr. Dede Djuniardi, M.M"},
        {id: "105", nama: "Dr. Odang Supriatna, M.M"},
        {id: "106", nama: "Dr. Yanneri Elfa Kiswara R., M.M"},
        {id: "107", nama: "Dr. Rina Masruroh.,M.E.Sy"}
    ],
    mahasiswa: [
        {nim: "20241710015", nama: "Nenden Sugiharti", jenis: "Tesis", judul: "Pengaruh Employee Engagement Terhadap Kinerja BUMD Kuningan", p1: "Dr. Lili Karmela Fitriani, M.Si", p2: "Dr. Dede Djuniardi, M.M", u1: "Dr. Dede Djuniardi, M.M", u2: "Prof. Dr. Dikdik Harjadi, M.Si", u3: "Dr. Rina Masruroh.,M.E.Sy", tanggal: "2026-06-05", jam: "08:00 - 09:30", ruangan: "Ruangan 1", locked: true, linkTesis: "https://drive.google.com/example-tesis1"},
        {nim: "20241710017", nama: "Eko Wahono", jenis: "Tesis", judul: "Pengaruh Digital Marketing Terhadap Brand Image Lokakarya", p1: "Dr. Lili Karmela Fitriani, M.Si", p2: "Dr. Odang Supriatna, M.M", u1: "Dr. Lili Karmela Fitriani, M.Si", u2: "Prof. Dr. Dikdik Harjadi, M.Si", u3: "Dr. Yanneri Elfa Kiswara R., M.M", tanggal: "2026-06-05", jam: "08:00 - 09:30", ruangan: "Ruangan 2", locked: false, linkTesis: ""},
        {nim: "20231710018", nama: "Azis Sutarma", jenis: "SHP", judul: "Analisis Kepuasan Publik Sistem Tata Ruang Daerah Dan Dampak Sosio-Ekonomi Masyarakat Luas", p1: "Prof. Dr. Dikdik Harjadi, M.Si", p2: "Dr. Dede Djuniardi, M.M", u1: "Dr. Dede Djuniardi, M.M", u2: "Dr. Herma Wiharno, M.Si", u3: "", tanggal: "2026-06-06", jam: "09:30 - 11:00", ruangan: "Ruangan 1", locked: false, linkTesis: ""},
        {nim: "20241710002", nama: "Iwan Febri Suwandi", jenis: "SHP", judul: "Pengaruh Gaya Kepemimpinan Kepala Desa Terhadap Kinerja Pemdes", p1: "Dr. Herma Wiharno, M.Si", p2: "Dr. Odang Supriatna, M.M", u1: "Dr. Herma Wiharno, M.Si", u2: "Dr. Lili Karmela Fitriani, M.Si", u3: "", tanggal: "", jam: "", ruangan: "Ruangan 2", locked: false, linkTesis: ""}
    ]
};

let currentRole = 'admin';
let currentUser = '';
let instanceBebanTotal = null;
let activeMhsFilter = 'all'; 

// --- 1. BLOK KODE YANG DIPERBAIKI (CLOUD SYNC & THEME) ---
window.onload = function() {
    let tdDate = new Date();
    document.getElementById('auto-schedule-start-date').value = tdDate.toISOString().split('T')[0];
    
    if(localStorage.getItem('theme') === 'dark') { 
        document.documentElement.setAttribute('data-theme', 'dark'); 
    }
    
    // MENGAMBIL DATA DARI CLOUD GOOGLE APPS SCRIPT (SINKRON SEMUA PERANGKAT)
    if (typeof google !== 'undefined' && google.script) {
        document.getElementById('user-display').innerText = "Memuat data dari server...";
        
        google.script.run.withSuccessHandler(function(serverData) {
            if(serverData && serverData !== "{}") {
                try {
                    let parsed = JSON.parse(serverData);
                    if(parsed && parsed.mahasiswa) DB = parsed;
                } catch(e) { console.error("Error membaca database cloud."); }
            }
            renderAll();
            document.getElementById('user-display').innerText = `Sesi Anda: Silakan Login`;
        }).getDatabaseFromStorage();
    } else {
        // Fallback offline / lokal
        loadFromLocalStorage();
        renderAll();
    }
};

function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    let target = (current === 'dark') ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
    initChartsEngine();
}

function saveDB() {
    let dbString = JSON.stringify(DB);
    // Simpan cadangan sementara di browser
    localStorage.setItem('YANNERI_APP_DATA_V92', dbString);
    
    // KIRIM KE CLOUD & SPREADSHEET (code.gs)
    if (typeof google !== 'undefined' && google.script) {
        google.script.run.saveDatabaseToStorage(dbString);
        google.script.run.withSuccessHandler(function(res){
            showToast("Sinkronisasi Cloud & Spreadsheet Berhasil ✨");
        }).simpanKeSpreadsheetGg(DB.mahasiswa);
    }
}
// --- AKHIR BLOK KODE YANG DIPERBAIKI ---


// --- FUNGSI-FUNGSI UTAMA LAINNYA ---
function loadFromLocalStorage() {
    const local = localStorage.getItem('YANNERI_APP_DATA_V92');
    if(local) { try { let parsed = JSON.parse(local); if(parsed) DB = parsed; } catch(e){} }
}

function backupJSON() {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(DB));
    let dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "Backup_YanNeri_Database.json");
    dlAnchorElem.click();
    showToast("File Backup Berhasil Diunduh!");
}

function restoreJSON(e) {
    let file = e.target.files[0]; if(!file) return;
    let reader = new FileReader();
    reader.onload = function(event) {
        try {
            let obj = JSON.parse(event.target.result);
            if(obj.mahasiswa && obj.dosen) { DB = obj; saveDB(); renderAll(); showToast("✅ Restore Database JSON Berhasil!"); } 
            else { showToast("Format file JSON tidak sesuai!", true); }
        } catch(err) { showToast("Gagal membaca file JSON!", true); }
    };
    reader.readAsText(file); e.target.value = "";
}

function selectRole(role) {
    currentRole = role;
    document.querySelectorAll('.role-option').forEach(el => el.classList.remove('active'));
    document.getElementById('opt-' + role).classList.add('active');
    document.getElementById('login-admin-fields').style.display = (role === 'admin') ? 'block' : 'none';
    document.getElementById('login-dosen-fields').style.display = (role === 'dosen') ? 'block' : 'none';
    document.getElementById('login-mhs-fields').style.display = (role === 'mahasiswa') ? 'block' : 'none';
}

function buildDropdownsLogin() {
    let dSelect = document.getElementById('login-select-dosen');
    if(dSelect) {
        dSelect.innerHTML = '<option value="">-- Pilih Nama Dosen --</option>';
        DB.dosen.forEach(d => { dSelect.innerHTML += `<option value="${d.nama}">${d.nama}</option>`; });
    }
    let mSelect = document.getElementById('login-select-mhs');
    if(mSelect) {
        mSelect.innerHTML = '<option value="">-- Pilih Nama Mahasiswa --</option>';
        DB.mahasiswa.forEach(m => { mSelect.innerHTML += `<option value="${m.nama}">${m.nama}</option>`; });
    }
}

function doLogin() {
    if(currentRole === 'admin') {
        if(document.getElementById('login-user').value === 'admin' && document.getElementById('login-pass').value === 'cucu') {
            currentUser = 'Administrator'; masukDashboard();
        } else { showToast('Kredensial Admin Salah!', true); }
    } else if(currentRole === 'dosen') {
        let d = document.getElementById('login-select-dosen').value;
        if(!d) return; currentUser = d; masukDashboard();
    } else {
        let m = document.getElementById('login-select-mhs').value;
        if(!m) return; currentUser = m; masukDashboard();
    }
}

function masukDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('user-display').innerText = `Sesi Anda: ${currentUser} (${currentRole.toUpperCase()})`;
    if(currentRole !== 'admin') {
        document.getElementById('tab-dashboard').style.display = 'none';
        document.getElementById('tab-mahasiswa').style.display = 'none';
        document.getElementById('tab-dosen').style.display = 'none';
        switchTab('jadwal');
    } else {
        document.getElementById('tab-dashboard').style.display = 'block';
        document.getElementById('tab-mahasiswa').style.display = 'block';
        document.getElementById('tab-dosen').style.display = 'block';
        switchTab('dashboard');
    }
    renderAll();
}

function doLogout() {
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active-panel'));
    document.getElementById('tab-' + tabId).classList.add('active');
    document.getElementById('panel-' + tabId).classList.add('active-panel');
    if(tabId === 'dashboard') initChartsEngine();
}

function toggleMhsForm() {
    let f = document.getElementById('mhs-form-collapse');
    f.classList.toggle('show');
}

function setMhsFilter(filterType) {
    activeMhsFilter = filterType;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.getElementById('chip-' + filterType).classList.add('active');
    renderMahasiswaTable();
}

function renderAll() {
    buildDropdownsLogin();
    const ids = ['mhs-p1', 'mhs-p2', 'mhs-u1', 'mhs-u2', 'mhs-u3'];
    ids.forEach(id => {
        let el = document.getElementById(id);
        if(el) {
            el.innerHTML = '<option value="">-- Pilih Dosen --</option>';
            DB.dosen.forEach(d => el.innerHTML += `<option value="${d.nama}">${d.nama}</option>`);
        }
    });
    renderMahasiswaTable();
    renderDosenTable();
    renderJadwalSideBySide();
    initChartsEngine();
    
    let isAdm = (currentRole === 'admin') ? 'block' : 'none';
    document.querySelectorAll('.admin-only-btn').forEach(b => b.style.display = isAdm);
    if(currentRole !== 'admin') {
        if(document.getElementById('mhs-form-collapse')) document.getElementById('mhs-form-collapse').style.display = 'none';
        if(document.getElementById('mhs-filter-chips')) document.getElementById('mhs-filter-chips').style.display = 'none';
    }
}

function renderMahasiswaTable() {
    let tbody = document.getElementById('tbody-mahasiswa'); if(!tbody) return; tbody.innerHTML = '';
    let search = document.getElementById('search-mhs').value.toLowerCase();
    
    DB.mahasiswa.forEach((m, idx) => {
        let statusKategori = 'waiting'; 
        if(m.tanggal && m.jam) { statusKategori = m.locked ? 'completed' : 'ready'; }
        
        if(activeMhsFilter !== 'all' && activeMhsFilter !== statusKategori) return;
        if(!m.nama.toLowerCase().includes(search) && !m.nim.includes(search)) return;
        
        let rowClass = m.locked ? 'class="row-locked"' : '';
        let infoWaktu = (m.tanggal && m.jam) ? `📅 <b>${m.tanggal}</b><br>⏰ ${m.jam}<br>📍 ${m.ruangan}` : `<i style="color:var(--text-muted)">Belum Terjadwal</i>`;
        let bClass = m.jenis === 'SUP' ? 'badge-sup' : (m.jenis === 'SHP' ? 'badge-shp' : 'badge-tesis');
        
        let stBadge = '';
        if(statusKategori === 'waiting') stBadge = `<span class="status-badge status-waiting" onclick="toggleStatusBadgeClick(${idx})">Menunggu Jadwal</span>`;
        else if(statusKategori === 'ready') stBadge = `<span class="status-badge status-ready" onclick="toggleStatusBadgeClick(${idx})">Siap Ujian</span>`;
        else stBadge = `<span class="status-badge status-completed" onclick="toggleStatusBadgeClick(${idx})">Selesai 🔒</span>`;

        let isInc = (m.tanggal && m.jam && (!m.u1 || !m.u2 || (!m.u3 && m.jenis==='Tesis') || !m.linkTesis));
        let flagInc = isInc ? `<span title="⚠️ Data Belum Lengkap (Penguji/Link belum siap)" style="cursor:help; margin-left:4px;">⚠️</span>` : '';

        tbody.innerHTML += `
            <tr ${rowClass}>
                <td><input type="checkbox" class="mhs-row-checkbox" data-index="${idx}" onchange="updateBulkCount()"></td>
                <td>${stBadge}</td>
                <td><b>${m.nim}</b></td>
                <td>${m.nama} ${flagInc}</td>
                <td><span class="badge ${bClass}">${m.jenis}</span></td>
                <td><div class="truncate-text" title="${m.judul}">${m.judul}</div></td>
                <td style="font-size:0.82rem;">${infoWaktu}</td>
                <td style="text-align:center;">
                    <div style="display:flex; gap:4px; justify-content:center;">
                        <button class="btn btn-light" style="padding:4px 8px;" onclick="editMahasiswa(${idx})" ${m.locked?'disabled':''}>✏️ Edit</button>
                        <button class="btn btn-danger" style="padding:4px 8px;" onclick="hapusMahasiswa(${idx})">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
    updateBulkCount();
}

function toggleStatusBadgeClick(idx) {
    if(currentRole !== 'admin') return;
    let m = DB.mahasiswa[idx];
    if(!m.tanggal || !m.jam) {
        showToast("Set tanggal & jam pelaksanaan terlebih dahulu untuk mengubah status!", true); return;
    }
    m.locked = !m.locked; saveDB(); renderAll();
    showToast(m.locked ? "Status diubah ke Selesai & Dikunci" : "Status diubah ke Siap Ujian (Terbuka)");
}

function toggleSelectAllMhs(master) { document.querySelectorAll('.mhs-row-checkbox').forEach(cb => cb.checked = master.checked); updateBulkCount(); }
function updateBulkCount() {
    let checked = document.querySelectorAll('.mhs-row-checkbox:checked').length;
    let bulkBar = document.getElementById('bulk-edit-bar');
    if(bulkBar) bulkBar.style.display = (currentRole === 'admin' && checked > 0) ? 'flex' : 'none';
    if(document.getElementById('bulk-select-count')) document.getElementById('bulk-select-count').innerText = checked;
}

function hapusMahasiswa(idx) {
    if(confirm(`Hapus mahasiswa "${DB.mahasiswa[idx].nama}"?`)) { DB.mahasiswa.splice(idx, 1); saveDB(); renderAll(); }
}

function editMahasiswa(idx) {
    let m = DB.mahasiswa[idx];
    document.getElementById('mhs-edit-index').value = idx;
    document.getElementById('mhs-nim').value = m.nim; document.getElementById('mhs-nama').value = m.nama;
    document.getElementById('mhs-jenis').value = m.jenis; document.getElementById('mhs-judul').value = m.judul;
    document.getElementById('mhs-link').value = m.linkTesis || ""; document.getElementById('mhs-tanggal').value = m.tanggal;
    document.getElementById('mhs-jam').value = m.jam; document.getElementById('mhs-ruangan').value = m.ruangan || "Ruangan 1";
    document.getElementById('mhs-p1').value = m.p1; document.getElementById('mhs-p2').value = m.p2;
    document.getElementById('mhs-u1').value = m.u1; document.getElementById('mhs-u2').value = m.u2; document.getElementById('mhs-u3').value = m.u3;
    
    let ind = document.getElementById('mhs-link-status-indicator');
    if(m.linkTesis) { ind.style.display = 'block'; } else { ind.style.display = 'none'; }

    document.getElementById('form-mhs-title').innerText = "✏️ Ubah Informasi Mahasiswa";
    
    let formBox = document.getElementById('mhs-form-collapse');
    formBox.classList.add('show');
    formBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function editDariMatriks(idx) {
    switchTab('mahasiswa'); editMahasiswa(idx);
}

function simpanMahasiswa() {
    let idx = parseInt(document.getElementById('mhs-edit-index').value);
    let obj = {
        nim: document.getElementById('mhs-nim').value.trim(), nama: document.getElementById('mhs-nama').value.trim(),
        jenis: document.getElementById('mhs-jenis').value, judul: document.getElementById('mhs-judul').value.trim(),
        linkTesis: document.getElementById('mhs-link').value.trim(), tanggal: document.getElementById('mhs-tanggal').value,
        jam: document.getElementById('mhs-jam').value.trim(), ruangan: document.getElementById('mhs-ruangan').value,
        p1: document.getElementById('mhs-p1').value, p2: document.getElementById('mhs-p2').value,
        u1: document.getElementById('mhs-u1').value, u2: document.getElementById('mhs-u2').value, u3: document.getElementById('mhs-u3').value,
        locked: idx > -1 ? DB.mahasiswa[idx].locked : false
    };

    if(!obj.nim || !obj.nama) { showToast('NIM dan Nama Mahasiswa wajib diisi!', true); return; }
    if(idx > -1) { DB.mahasiswa[idx] = obj; showToast('Data mahasiswa berhasil diperbarui.'); } 
    else { DB.mahasiswa.push(obj); showToast('Mahasiswa baru berhasil didaftarkan.'); }
    saveDB(); resetFormMahasiswa(false); renderAll();
}

function resetFormMahasiswa(shouldHideForm = false) {
    document.getElementById('mhs-edit-index').value = "-1"; document.getElementById('mhs-nim').value = "";
    document.getElementById('mhs-nama').value = ""; document.getElementById('mhs-judul').value = "";
    document.getElementById('mhs-link').value = ""; document.getElementById('mhs-tanggal').value = "";
    document.getElementById('mhs-jam').value = ""; document.getElementById('form-mhs-title').innerText = "Tambah / Ubah Entri Mahasiswa";
    document.getElementById('mhs-link-status-indicator').style.display = 'none';
    if(shouldHideForm) document.getElementById('mhs-form-collapse').classList.remove('show');
}

function applyBulkDateTime() {
    let targetDate = document.getElementById('bulk-date').value;
    let targetTime = document.getElementById('bulk-time').value.trim();
    let selectedCheckboxes = document.querySelectorAll('.mhs-row-checkbox:checked');
    
    selectedCheckboxes.forEach(cb => {
        let idx = parseInt(cb.getAttribute('data-index'));
        if(!DB.mahasiswa[idx].locked) {
            if(targetDate) DB.mahasiswa[idx].tanggal = targetDate;
            if(targetTime) DB.mahasiswa[idx].jam = targetTime;
        }
    });
    saveDB(); renderAll(); document.getElementById('check-all-mhs').checked = false;
    showToast(`Opsi kumulatif berhasil diterapkan.`);
}

function autoGenerateJadwal() {
    let pass = prompt("Sistem akan mengatur ulang jadwal yang belum terkunci.\nKetik 'YAKIN' untuk melanjutkan:");
    if (pass !== "YAKIN") { showToast("Dibatalkan.", true); return; }

    let startDateInput = document.getElementById('auto-schedule-start-date').value;
    if(!startDateInput) return;
    const defaultSlots = ["08:00 - 09:30", "09:30 - 11:00", "11:00 - 12:30", "13:30 - 15:00", "15:00 - 16:30"];
    let baseDate = new Date(startDateInput); let slotIdx = 0; let dayOffset = 0; let roomToggle = 0;

    DB.mahasiswa.forEach((m) => {
        if(m.locked) return;
        let targetDate = new Date(baseDate); targetDate.setDate(baseDate.getDate() + dayOffset);
        if(targetDate.getDay() === 0) { dayOffset++; targetDate.setDate(baseDate.getDate() + dayOffset); }
        
        m.tanggal = targetDate.toISOString().split('T')[0];
        m.jam = defaultSlots[slotIdx]; m.ruangan = (roomToggle === 0) ? "Ruangan 1" : "Ruangan 2";
        
        if(roomToggle === 0) { roomToggle = 1; } else {
            roomToggle = 0; slotIdx++; if(slotIdx >= defaultSlots.length) { slotIdx = 0; dayOffset++; }
        }
    });
    saveDB(); renderAll(); showToast("Penjadwalan Otomatis Selesai!");
}

function kosongkanJadwal() {
    let pass = prompt("Hapus semua tanggal/waktu jadwal yang belum terkunci? Ketik 'YAKIN':");
    if (pass !== "YAKIN") return;
    DB.mahasiswa.forEach(m => { if(!m.locked) { m.tanggal = ""; m.jam = ""; } });
    saveDB(); renderAll(); showToast("Jadwal dikosongkan.");
}

function renderDosenTable() {
    let tbody = document.getElementById('tbody-dosen'); if(!tbody) return; tbody.innerHTML = '';
    DB.dosen.forEach((d, idx) => {
        tbody.innerHTML += `<tr><td><code>${d.id}</code></td><td><b>${d.nama}</b></td><td style="text-align:center;"><button class="btn btn-light" style="padding:4px 8px;" onclick="editDosen(${idx})">✏️</button><button class="btn btn-danger" style="padding:4px 8px;" onclick="hapusDosen(${idx})">🗑️</button></td></tr>`;
    });
}

function tambahDosen() {
    let id = document.getElementById('dsn-id').value.trim(); let nama = document.getElementById('dsn-nama').value.trim();
    let editIdx = parseInt(document.getElementById('dsn-edit-index').value);
    if(!id || !nama) return;
    if(editIdx > -1) DB.dosen[editIdx] = {id, nama}; else DB.dosen.push({id, nama});
    saveDB(); resetFormDosen(); renderAll();
}

function editDosen(idx) {
    let d = DB.dosen[idx]; document.getElementById('dsn-id').value = d.id; document.getElementById('dsn-nama').value = d.nama;
    document.getElementById('dsn-edit-index').value = idx; document.getElementById('btn-reset-dsn').style.display = "inline-flex";
}

function resetFormDosen() {
    document.getElementById('dsn-id').value = ""; document.getElementById('dsn-nama').value = "";
    document.getElementById('dsn-edit-index').value = "-1"; document.getElementById('btn-reset-dsn').style.display = "none";
}

function hapusDosen(idx) { if(confirm("Hapus dosen?")) { DB.dosen.splice(idx, 1); saveDB(); renderAll(); } }

function simpanLinkSendiri() {
    let mhs = DB.mahasiswa.find(m => m.nama === currentUser);
    if(mhs && !mhs.locked) {
        mhs.linkTesis = document.getElementById('mhs-own-link').value.trim(); saveDB(); renderAll(); showToast("🔗 Link Berhasil Disimpan!");
    } else if (mhs && mhs.locked) { showToast("Jadwal Selesai/Terkunci. Akses pengisian ditutup.", true); }
}

function shareWA(idx) {
    let m = DB.mahasiswa[idx];
    let labelU1 = m.jenis === 'SHP' ? 'Moderator' : 'Penguji';
    let labelU2 = m.jenis === 'SHP' ? 'Penelaah' : 'Penguji';
    let labelU3 = m.jenis === 'SHP' ? 'Penguji III' : 'Penguji';

    let text = `*Pemberitahuan Jadwal Ujian YanNeri*\n\n` +
               `Nama: ${m.nama} (${m.nim})\n` +
               `Jenis Ujian: ${m.jenis}\n` +
               `Judul: ${m.judul}\n` +
               `Tanggal: ${m.tanggal}\n` +
               `Jam: ${m.jam}\n` +
               `Tempat: ${m.ruangan}\n\n` +
               `Tim Penguji:\n1. ${m.u1||'-'} (${labelU1})\n2. ${m.u2||'-'} (${labelU2})\n3. ${m.u3 ? m.u3 + ' ('+labelU3+')' : '-'}\n\n` +
               `Link Berkas:\n${m.linkTesis || '(Belum disetor)'}\n\n` +
               `Terima kasih.`;
    window.open("https://wa.me/?text=" + encodeURIComponent(text), '_blank');
}

function shareAllWA() {
    let jadwalAktif = DB.mahasiswa.filter(m => m.tanggal && !m.locked)
                                  .sort((a,b) => a.tanggal.localeCompare(b.tanggal) || a.jam.localeCompare(b.jam));
    if(jadwalAktif.length === 0) { showToast('Tidak ada jadwal aktif!', true); return; }

    let text = `*PENGUMUMAN JADWAL MASTER UJIAN MHS*\nBerikut rekap agenda ujian:\n\n`;
    let groups = {};
    jadwalAktif.forEach(m => { if(!groups[m.tanggal]) groups[m.tanggal] = []; groups[m.tanggal].push(m); });

    for (const [tgl, mhsArray] of Object.entries(groups)) {
        text += `📅 *HARI/TANGGAL: ${tgl}*\n-----------------------------\n`;
        mhsArray.forEach(m => {
            let lbl1 = m.jenis === 'SHP' ? 'Moderator' : 'Penguji';
            let lbl2 = m.jenis === 'SHP' ? 'Penelaah' : 'Penguji';
            let lbl3 = m.jenis === 'SHP' ? 'Penguji 3' : 'Penguji';
            text += `🎓 *${m.nama}* (${m.nim}) - *${m.jenis}*\n`;
            text += `⏰ Jam: ${m.jam} | 📍 ${m.ruangan}\n`;
            text += `👨‍🏫 Tim Penguji:\n  - ${m.u1||'-'} (${lbl1})\n  - ${m.u2||'-'} (${lbl2})\n  - ${m.u3||'-'} (${lbl3})\n`;
            text += `🔗 Link File: ${m.linkTesis || '(Belum disetor)'}\n\n`;
        });
    }
    window.open("https://wa.me/?text=" + encodeURIComponent(text), '_blank');
}

function renderJadwalSideBySide() {
    let container = document.getElementById('container-jadwal-sidebyside'); if(!container) return; container.innerHTML = '';

    let mhsLinkBox = document.getElementById('mhs-link-container');
    if(mhsLinkBox) {
        if(currentRole === 'mahasiswa') {
            mhsLinkBox.style.display = 'block';
            let m = DB.mahasiswa.find(x => x.nama === currentUser);
            if (m) {
                document.getElementById('mhs-own-link').value = m.linkTesis || '';
                document.getElementById('mhs-own-link').disabled = m.locked;
                document.getElementById('btn-save-own-link').disabled = m.locked;
                if(m.locked) document.getElementById('btn-save-own-link').innerText = "🔒 Dikunci";
            }
        } else mhsLinkBox.style.display = 'none';
    }

    let searchFilter = document.getElementById('search-matriks') ? document.getElementById('search-matriks').value.toLowerCase() : "";
    let roomFilter = document.getElementById('filter-ruangan-matriks') ? document.getElementById('filter-ruangan-matriks').value : "";
    let hideLocked = document.getElementById('filter-show-locked') ? !document.getElementById('filter-show-locked').checked : true;

    let filteredMhs = DB.mahasiswa.map((m, idx) => ({ ...m, originalIndex: idx })).filter(m => {
        if (currentRole === 'mahasiswa' && m.nama !== currentUser) return false;
        if (currentRole === 'dosen' && m.u1 !== currentUser && m.u2 !== currentUser && m.u3 !== currentUser) return false;
        if (currentRole === 'admin' && hideLocked && m.locked) return false;
        if (searchFilter && !m.nama.toLowerCase().includes(searchFilter) && !m.nim.includes(searchFilter)) return false;
        if (roomFilter && m.ruangan !== roomFilter) return false;
        return true;
    });

    let groups = {};
    filteredMhs.forEach(m => { if(m.tanggal) { if(!groups[m.tanggal]) groups[m.tanggal] = []; groups[m.tanggal].push(m); } });

    let sortedDates = Object.keys(groups).sort();
    if(sortedDates.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada jadwal untuk ditampilkan.</div>`; return;
    }

    sortedDates.forEach(tgl => {
        let arr = groups[tgl];
        let r1 = arr.filter(m => m.ruangan === "Ruangan 1");
        let r2 = arr.filter(m => m.ruangan === "Ruangan 2");

        let r1EmptyClass = (r1.length === 0) ? 'is-empty-print' : '';
        let r2EmptyClass = (r2.length === 0) ? 'is-empty-print' : '';
        let gridPrintModifier = (r1.length === 0 || r2.length === 0) ? 'one-column-print' : '';

        let room1HTML = (roomFilter === "" || roomFilter === "Ruangan 1") ? `<div class="room-column ${r1EmptyClass}"><div class="room-column-title">📍 Ruangan 1</div>${renderSlots(r1)}</div>` : '';
        let room2HTML = (roomFilter === "" || roomFilter === "Ruangan 2") ? `<div class="room-column ${r2EmptyClass}"><div class="room-column-title">📍 Ruangan 2</div>${renderSlots(r2)}</div>` : '';

        container.innerHTML += `
            <div class="jadwal-day-block">
                <div class="jadwal-day-title">📆 Hari / Tanggal Pelaksanaan: ${tgl}</div>
                <div class="rooms-row-grid ${gridPrintModifier}"> ${room1HTML} ${room2HTML} </div>
            </div>
        `;
    });
}

function renderSlots(mhsArray) {
    if(mhsArray.length === 0) return '<p style="font-size:0.8rem; color:var(--text-muted); font-style:italic; padding:10px;">Kosong</p>';
    mhsArray.sort((a,b) => a.jam.localeCompare(b.jam));
    let h = '';
    mhsArray.forEach(m => {
        let isRoomConflict = (currentRole === 'admin') ? (mhsArray.filter(x => x.jam === m.jam).length > 1) : false;
        let cardClass = 'slot-card' + (isRoomConflict ? ' is-conflict' : '');
        let alertRoom = isRoomConflict ? `<div style="color:#b91c1c; font-size:0.75rem; font-weight:700; margin-top:6px; padding:6px; background:#fef2f2; border:1px solid #fecaca; border-radius:4px;">⚠️ BENTROK RUANGAN (Double Booking)</div>` : '';
        let linkDisplay = m.linkTesis ? `<a href="${m.linkTesis}" target="_blank" style="color:#0284c7; text-decoration:none; font-weight:700;">🔗 Buka File Tesis</a>` : `<span style="color:var(--text-muted); font-style:italic; font-size: 0.75rem;">Link belum ada</span>`;

        let txtU1 = "Penguji", txtU2 = "Penguji", txtU3 = "Penguji";
        if(m.jenis === 'SHP') { txtU1 = "Moderator"; txtU2 = "Penelaah"; txtU3 = "Penguji III"; }

        let roleHighlight = "";
        if(currentRole === 'dosen') {
            let roleName = "";
            if(m.u1 === currentUser) roleName = txtU1;
            else if(m.u2 === currentUser) roleName = txtU2;
            else if(m.u3 === currentUser) roleName = txtU3;
            if(roleName) roleHighlight = `<div class="badge-role">📌 Peran Anda: <b>${roleName}</b></div>`;
        }

        let editBtn = (currentRole === 'admin' && !m.locked) ? `<button class="btn btn-light" style="padding:2px 8px; font-size:0.72rem;" onclick="editDariMatriks(${m.originalIndex})">✏️ Edit</button>` : '';
        let shareBtn = (currentRole === 'admin') ? `<button class="btn btn-success" style="padding:2px 8px; font-size:0.72rem; margin-left:4px;" onclick="shareWA(${m.originalIndex})">💬 Share</button>` : '';
        let lockTextPrint = m.locked ? '🔒 Selesai' : '🔓 Siap';

        h += `
            <div class="${cardClass}">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; font-weight:700; color:var(--primary);">
                    <span>⏰ ${m.jam}</span> 
                    <div class="filter-print-hide">${editBtn} ${shareBtn} <span style="margin-left:6px">${m.locked?'🔒':'🔓'}</span></div>
                    <span class="admin-only-btn" style="display:none; font-size:0.7rem; color:var(--text-muted); font-weight:normal;">[${lockTextPrint}]</span>
                </div>
                <p style="font-size:0.85rem; font-weight:700; margin-top:4px;">${m.nama} (${m.nim})</p>
                <p style="font-size:0.75rem; color:var(--text-muted); line-height:1.2; margin:2px 0;"><b>Judul:</b> ${m.judul}</p>
                ${roleHighlight}
                <div style="font-size:0.75rem; margin:4px 0;">${linkDisplay}</div>
                <div style="font-size:0.72rem; padding-top:4px; border-top:1px dashed var(--border-color); color:var(--text-muted)">
                    <b>Tim Sidang:</b> 1. ${m.u1 || '-'} (${txtU1}) | 2. ${m.u2 || '-'} (${txtU2}) ${m.u3 ? ' | 3. '+m.u3+' ('+txtU3+')' : ''}
                </div>
                ${alertRoom}
            </div>
        `;
    });
    return h;
}

function exportRekapHonor() {
    let data = DB.dosen.map(d => {
        let p1 = 0, p2 = 0, u1 = 0, u2 = 0, u3 = 0;
        DB.mahasiswa.forEach(m => {
            if(m.p1 === d.nama) p1++; if(m.p2 === d.nama) p2++;
            if(m.u1 === d.nama) u1++; if(m.u2 === d.nama) u2++; if(m.u3 === d.nama) u3++;
        });
        return {
            "NIDN": d.id, "Nama Lengkap Dosen": d.nama,
            "Total Membimbing": p1 + p2, "Total Menguji": u1 + u2 + u3,
            "Rincian Membimbing": `Pembimbing 1: ${p1}, Pembimbing 2: ${p2}`,
            "Rincian Menguji": `Penguji/Tim Sidang: ${u1 + u2 + u3}`
        };
    });
    let ws = XLSX.utils.json_to_sheet(data); let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Beban"); XLSX.writeFile(wb, "Rekap_Honor_Dosen_YanNeri.xlsx");
}

function exportMatriksExcel() {
    let jadwal = DB.mahasiswa.filter(m => m.tanggal).sort((a,b) => a.tanggal.localeCompare(b.tanggal) || a.jam.localeCompare(b.jam));
    let data = jadwal.map(m => ({
        "Tanggal Ujian": m.tanggal, "Jam Pelaksanaan": m.jam, "Ruangan": m.ruangan,
        "NIM": m.nim, "Nama Mahasiswa": m.nama, "Judul": m.judul,
        "Tim 1": m.u1, "Tim 2": m.u2, "Tim 3": m.u3, "Status": m.locked ? "Selesai" : "Siap Ujian"
    }));
    let ws = XLSX.utils.json_to_sheet(data); let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matriks"); XLSX.writeFile(wb, "Jadwal_Master_YanNeri.xlsx");
}

function initChartsEngine() {
    let ctx = document.getElementById('chart-beban-total'); if(!ctx) return;
    let labels = DB.dosen.map(d => d.nama.split(',')[0]);
    let dataMembimbing = DB.dosen.map(d => { let c = 0; DB.mahasiswa.forEach(m => { if(m.p1 === d.nama || m.p2 === d.nama) c++; }); return c; });
    let dataMenguji = DB.dosen.map(d => { let c = 0; DB.mahasiswa.forEach(m => { if(m.u1 === d.nama || m.u2 === d.nama || m.u3 === d.nama) c++; }); return c; });

    if(instanceBebanTotal) instanceBebanTotal.destroy();
    instanceBebanTotal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Membimbing', data: dataMembimbing, backgroundColor: '#2874a6', borderRadius: 4 },
                { label: 'Menguji (Tim Sidang)', data: dataMenguji, backgroundColor: '#f39c12', borderRadius: 4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });

    document.getElementById('stat-dosen-aktif').innerText = DB.dosen.length;
    document.getElementById('stat-mhs').innerText = DB.mahasiswa.length;
    document.getElementById('stat-terjadwal').innerText = DB.mahasiswa.filter(m => m.tanggal !== "").length;
    document.getElementById('stat-dikunci').innerText = DB.mahasiswa.filter(m => m.locked).length;
}

function showToast(msg, isDanger = false) {
    let t = document.getElementById('toast'); if(!t) return;
    t.innerText = msg; t.style.background = isDanger ? 'var(--danger)' : '#1e293b';
    t.classList.add('show'); setTimeout(() => { t.classList.remove('show'); }, 3000);
}

function exportMahasiswaExcel() {
    let data = DB.mahasiswa.map(m => ({
        "NIM": m.nim, "Nama Mahasiswa": m.nama, "Jenis Ujian": m.jenis, "Judul Penelitian": m.judul, "Link File Tesis": m.linkTesis || "",
        "Tanggal Ujian (YYYY-MM-DD)": m.tanggal, "Jam Pelaksanaan": m.jam, "Ruangan": m.ruangan,
        "Pembimbing I": m.p1, "Pembimbing II": m.p2, "Penguji I": m.u1, "Penguji II": m.u2, "Penguji III": m.u3
    }));
    let ws = XLSX.utils.json_to_sheet(data); let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MhsDB"); XLSX.writeFile(wb, "Template_Database_Mahasiswa.xlsx");
}

function importMahasiswaExcel(e) {
    let file = e.target.files[0]; if(!file) return;
    let reader = new FileReader();
    reader.onload = function(evt) {
        try {
            let data = new Uint8Array(evt.target.result); let workbook = XLSX.read(data, {type: 'array'});
            let sheetName = workbook.SheetNames[0]; let rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            rows.forEach(r => {
                let nim = String(r["NIM"] || "").trim(); if(!nim) return;
                let ada = DB.mahasiswa.find(m => m.nim === nim);
                let obj = {
                    nim: nim, nama: r["Nama Mahasiswa"]||"Mhs Baru", jenis: r["Jenis Ujian"]||"Tesis", judul: r["Judul Penelitian"]||"",
                    linkTesis: r["Link File Tesis"]||"", tanggal: r["Tanggal Ujian (YYYY-MM-DD)"]||"", jam: r["Jam Pelaksanaan"]||"", ruangan: r["Ruangan"]||"Ruangan 1",
                    p1: r["Pembimbing I"]||"", p2: r["Pembimbing II"]||"", u1: r["Penguji I"]||"", u2: r["Penguji II"]||"", u3: r["Penguji III"]||"", locked: false
                };
                if(ada && !ada.locked) Object.assign(ada, obj); else if(!ada) DB.mahasiswa.push(obj);
            });
            saveDB(); renderAll(); showToast('Excel Berhasil diimport.');
        } catch(err) { showToast('Gagal memproses file Excel!', true); }
    };
    reader.readAsArrayBuffer(file); e.target.value = "";
}