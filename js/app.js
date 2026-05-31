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
        {nim: "20231710018", nama: "Azis Sutarma", jenis: "SHP", judul: "Analisis Kepuasan Publik Sistem Tata Ruang Daerah", p1: "Prof. Dr. Dikdik Harjadi, M.Si", p2: "Dr. Dede Djuniardi, M.M", u1: "Dr. Dede Djuniardi, M.M", u2: "Dr. Herma Wiharno, M.Si", u3: "", tanggal: "2026-06-06", jam: "09:30 - 11:00", ruangan: "Ruangan 1", locked: false, linkTesis: ""},
        {nim: "20241710002", nama: "Iwan Febri Suwandi", jenis: "SHP", judul: "Pengaruh Gaya Kepemimpinan Kepala Desa Terhadap Kinerja Pemdes", p1: "Dr. Herma Wiharno, M.Si", p2: "Dr. Odang Supriatna, M.M", u1: "Dr. Herma Wiharno, M.Si", u2: "Dr. Lili Karmela Fitriani, M.Si", u3: "", tanggal: "", jam: "", ruangan: "Ruangan 2", locked: false, linkTesis: ""}
    ]
};

let currentRole = 'admin';
let currentUser = '';
let instanceBebanTotal = null;

window.onload = function() {
    let tdDate = new Date();
    document.getElementById('auto-schedule-start-date').value = tdDate.toISOString().split('T')[0];
    
    loadFromLocalStorage();
    if(localStorage.getItem('theme') === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); }
    renderAll();
};

function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    let target = (current === 'dark') ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
    initChartsEngine();
}

function saveDB() {
    localStorage.setItem('YANNERI_APP_DATA_V76', JSON.stringify(DB));
    if (typeof google !== 'undefined' && google.script) {
        google.script.run.withSuccessHandler(function(res){
            showToast("Sinkronisasi Cloud Berhasil ✨");
        }).simpanKeSpreadsheetGg(DB.mahasiswa);
    }
}

function loadFromLocalStorage() {
    const local = localStorage.getItem('YANNERI_APP_DATA_V76');
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
    if(document.getElementById('admin-mhs-form-box')) document.getElementById('admin-mhs-form-box').style.display = isAdm;
    if(document.getElementById('admin-dsn-form-box')) document.getElementById('admin-dsn-form-box').style.display = isAdm;
    document.querySelectorAll('.admin-only-btn').forEach(b => b.style.display = isAdm);
}

function renderMahasiswaTable() {
    let tbody = document.getElementById('tbody-mahasiswa'); if(!tbody) return; tbody.innerHTML = '';
    let search = document.getElementById('search-mhs').value.toLowerCase();
    
    DB.mahasiswa.forEach((m, idx) => {
        if(!m.nama.toLowerCase().includes(search) && !m.nim.includes(search)) return;
        
        let isLocked = m.locked ? true : false;
        let lockIcon = isLocked ? '🔒' : '🔓';
        let lockTitle = isLocked ? 'Sudah Ujian / Terkunci' : 'Belum Ujian / Terbuka';
        let rowClass = isLocked ? 'class="row-locked"' : '';
        
        let infoWaktu = (m.tanggal && m.jam) ? `📅 <b>${m.tanggal}</b><br>⏰ ${m.jam}<br>📍 ${m.ruangan}` : `<i style="color:var(--text-muted)">Belum Terjadwal</i>`;
        let bClass = m.jenis === 'SUP' ? 'badge-sup' : (m.jenis === 'SHP' ? 'badge-shp' : 'badge-tesis');
        
        // Peringatan belum lengkap
        let isInc = false;
        if(m.tanggal && m.jam && (!m.u1 || !m.u2 || !m.u3 || !m.linkTesis)) isInc = true;
        let flagInc = isInc ? `<span title="⚠️ Data Belum Lengkap (Penguji ada yang kosong ATAU Link Tesis belum disetor)" style="cursor:help; margin-left:4px;">⚠️</span>` : '';

        let aksiButtons = `
            <div style="display:flex; gap:4px; justify-content:center;">
                <button class="btn btn-light" style="padding:4px 8px;" onclick="editMahasiswa(${idx})" ${isLocked?'disabled':''}>✏️</button>
                <button class="btn btn-danger" style="padding:4px 8px;" onclick="hapusMahasiswa(${idx})">🗑️</button>
            </div>
        `;
        
        tbody.innerHTML += `
            <tr ${rowClass}>
                <td><input type="checkbox" class="mhs-row-checkbox" data-index="${idx}" onchange="updateBulkCount()"></td>
                <td style="text-align:center;"><button class="btn-lock" onclick="toggleLockStudent(${idx})" title="${lockTitle}">${lockIcon}</button></td>
                <td><b>${m.nim}</b></td>
                <td>${m.nama} ${flagInc}</td>
                <td><span class="badge ${bClass}">${m.jenis}</span></td>
                <td style="font-size:0.82rem;">${infoWaktu}</td>
                <td style="font-size:0.78rem; color:var(--text-muted)"><b>M:</b> ${m.u1||'-'}<br><b>P:</b> ${m.u2||'-'}</td>
                <td style="text-align:center;">${aksiButtons}</td>
            </tr>
        `;
    });
    updateBulkCount();
}

function toggleLockStudent(idx) {
    DB.mahasiswa[idx].locked = !DB.mahasiswa[idx].locked; saveDB(); renderAll();
    showToast(DB.mahasiswa[idx].locked ? 'Jadwal Dikunci (Status: Sudah Ujian)' : 'Jadwal Dibuka (Status: Belum Ujian)');
}

function toggleSelectAllMhs(master) { document.querySelectorAll('.mhs-row-checkbox').forEach(cb => cb.checked = master.checked); updateBulkCount(); }
function updateBulkCount() {
    let checked = document.querySelectorAll('.mhs-row-checkbox:checked').length;
    let bulkBar = document.getElementById('bulk-edit-bar');
    if(bulkBar) bulkBar.style.display = (currentRole === 'admin') ? 'flex' : 'none';
    if(document.getElementById('bulk-select-count')) document.getElementById('bulk-select-count').innerText = checked;
}

function hapusMahasiswa(idx) {
    if(confirm(`Apakah Anda yakin ingin menghapus mahasiswa bernama "${DB.mahasiswa[idx].nama}" dari database?`)) {
        DB.mahasiswa.splice(idx, 1); saveDB(); renderAll(); showToast('Data mahasiswa berhasil dihapus.');
    }
}

function checkPastDateWarning(dateStr) {
    if(!dateStr) return;
    let inputDate = new Date(dateStr); let today = new Date(); today.setHours(0,0,0,0);
    if(inputDate < today) { showToast("⚠️ Perhatian: Tanggal ujian yang diset berada di masa lalu!", true); }
}

function applyBulkDateTime() {
    let targetDate = document.getElementById('bulk-date').value;
    let targetTime = document.getElementById('bulk-time').value.trim();
    if(!targetDate && !targetTime) { showToast('Isi tanggal atau waktu kumulatif terlebih dahulu!', true); return; }
    
    checkPastDateWarning(targetDate);
    let selectedCheckboxes = document.querySelectorAll('.mhs-row-checkbox:checked');
    if(selectedCheckboxes.length === 0) { showToast('Pilih mahasiswa lewat checkbox tabel terlebih dahulu!', true); return; }
    
    let overwrittenCount = 0; let skippedCount = 0;
    selectedCheckboxes.forEach(cb => {
        let idx = parseInt(cb.getAttribute('data-index'));
        if(DB.mahasiswa[idx].locked) { skippedCount++; } else {
            if(targetDate) DB.mahasiswa[idx].tanggal = targetDate;
            if(targetTime) DB.mahasiswa[idx].jam = targetTime;
            overwrittenCount++;
        }
    });
    saveDB(); renderAll(); document.getElementById('check-all-mhs').checked = false;
    showToast(`Kumulatif Berhasil: ${overwrittenCount} Diubah, ${skippedCount} Dilewati.`);
}

function autoGenerateJadwal() {
    let pass = prompt("Sistem akan mengatur ulang seluruh jadwal ujian yang belum terkunci.\n\nUntuk alasan keamanan, ketik 'YAKIN' (huruf kapital) untuk melanjutkan:");
    if (pass !== "YAKIN") { showToast("Auto-Schedule Dibatalkan.", true); return; }

    let startDateInput = document.getElementById('auto-schedule-start-date').value;
    if(!startDateInput) { showToast('Tentukan tanggal mulai pelaksanaan ujian dulu!', true); return; }
    checkPastDateWarning(startDateInput);

    const defaultSlots = ["08:00 - 09:30", "09:30 - 11:00", "11:00 - 12:30", "13:30 - 15:00", "15:00 - 16:30"];
    let baseDate = new Date(startDateInput); let slotIdx = 0; let dayOffset = 0; let roomToggle = 0;
    let successCount = 0; let lockedCount = 0;

    DB.mahasiswa.forEach((m) => {
        if(m.locked) { lockedCount++; return; }
        let targetDate = new Date(baseDate); targetDate.setDate(baseDate.getDate() + dayOffset);
        if(targetDate.getDay() === 0) { dayOffset++; targetDate.setDate(baseDate.getDate() + dayOffset); }
        
        m.tanggal = targetDate.toISOString().split('T')[0];
        m.jam = defaultSlots[slotIdx]; m.ruangan = (roomToggle === 0) ? "Ruangan 1" : "Ruangan 2";
        successCount++;
        
        if(roomToggle === 0) { roomToggle = 1; } else {
            roomToggle = 0; slotIdx++;
            if(slotIdx >= defaultSlots.length) { slotIdx = 0; dayOffset++; }
        }
    });
    saveDB(); renderAll(); showToast(`Penjadwalan Otomatis Selesai: ${successCount} Diatur, ${lockedCount} Dikunci.`);
}

function kosongkanJadwal() {
    let pass = prompt("PERINGATAN: Aksi ini akan menghapus semua tanggal/waktu jadwal yang belum terkunci.\nKetik 'YAKIN' (huruf kapital) untuk melanjutkan:");
    if (pass !== "YAKIN") { showToast("Pembersihan Dibatalkan.", true); return; }

    let count = 0;
    DB.mahasiswa.forEach(m => { if(!m.locked) { m.tanggal = ""; m.jam = ""; count++; } });
    saveDB(); renderAll(); showToast(`${count} jadwal berhasil dibersihkan.`);
}

function renderDosenTable() {
    let tbody = document.getElementById('tbody-dosen'); if(!tbody) return; tbody.innerHTML = '';
    DB.dosen.forEach((d, idx) => {
        tbody.innerHTML += `
            <tr>
                <td><code>${d.id}</code></td>
                <td><b>${d.nama}</b></td>
                <td style="text-align:center;">
                    <button class="btn btn-light" style="padding:4px 8px;" onclick="editDosen(${idx})">✏️</button>
                    <button class="btn btn-danger" style="padding:4px 8px;" onclick="hapusDosen(${idx})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function tambahDosen() {
    let id = document.getElementById('dsn-id').value.trim(); let nama = document.getElementById('dsn-nama').value.trim();
    let editIdx = parseInt(document.getElementById('dsn-edit-index').value);

    if(!id || !nama) { showToast('NIDN dan Nama harus diisi!', true); return; }
    if(editIdx > -1) { DB.dosen[editIdx] = {id, nama}; showToast('Data dosen berhasil diperbarui.'); } 
    else { DB.dosen.push({id, nama}); showToast('Dosen baru berhasil ditambahkan.'); }
    saveDB(); resetFormDosen(); renderAll();
}

function editDosen(idx) {
    let d = DB.dosen[idx];
    document.getElementById('dsn-id').value = d.id; document.getElementById('dsn-nama').value = d.nama;
    document.getElementById('dsn-edit-index').value = idx; document.getElementById('form-dsn-title').innerText = "Ubah Data Dosen Master";
    document.getElementById('btn-reset-dsn').style.display = "inline-flex";
}

function resetFormDosen() {
    document.getElementById('dsn-id').value = ""; document.getElementById('dsn-nama').value = "";
    document.getElementById('dsn-edit-index').value = "-1"; document.getElementById('form-dsn-title').innerText = "Input Master Data Dosen Baru";
    document.getElementById('btn-reset-dsn').style.display = "none";
}

function hapusDosen(idx) {
    if(confirm(`Hapus dosen "${DB.dosen[idx].nama}"?`)) { DB.dosen.splice(idx, 1); saveDB(); renderAll(); }
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
    document.getElementById('form-mhs-title').innerText = "✏️ Ubah Informasi Mahasiswa";
}

function editDariMatriks(idx) {
    switchTab('mahasiswa'); editMahasiswa(idx); showToast('Silakan sesuaikan jadwal / ganti dosen / jam ujian.');
    document.getElementById('admin-mhs-form-box').scrollIntoView({behavior: 'smooth'});
}

function shareWA(idx) {
    let m = DB.mahasiswa[idx];
    let text = `*Pemberitahuan Jadwal Ujian YanNeri*\n\n` +
               `Nama: ${m.nama} (${m.nim})\n` +
               `Jenis Ujian: ${m.jenis}\n` +
               `Judul: ${m.judul}\n` +
               `Tanggal: ${m.tanggal}\n` +
               `Jam: ${m.jam}\n` +
               `Tempat: ${m.ruangan}\n\n` +
               `Tim Penguji:\n1. ${m.u1||'-'}\n2. ${m.u2||'-'}\n3. ${m.u3||'-'}\n\n` +
               `Link File Tesis:\n${m.linkTesis || '(Belum disediakan)'}\n\n` +
               `Mohon kehadiran Bapak/Ibu tepat pada waktunya. Terima kasih.`;
    let url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, '_blank');
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
    checkPastDateWarning(obj.tanggal);

    if(idx > -1) { DB.mahasiswa[idx] = obj; showToast('Entri mahasiswa berhasil diperbarui.'); } 
    else { DB.mahasiswa.push(obj); showToast('Mahasiswa baru berhasil didaftarkan.'); }
    saveDB(); resetFormMahasiswa(); renderAll();
}

function resetFormMahasiswa() {
    document.getElementById('mhs-edit-index').value = "-1"; document.getElementById('mhs-nim').value = "";
    document.getElementById('mhs-nama').value = ""; document.getElementById('mhs-judul').value = "";
    document.getElementById('mhs-link').value = ""; document.getElementById('mhs-tanggal').value = "";
    document.getElementById('mhs-jam').value = ""; document.getElementById('form-mhs-title').innerText = "Tambah / Ubah Entri Mahasiswa";
}

function simpanLinkSendiri() {
    let mhs = DB.mahasiswa.find(m => m.nama === currentUser);
    if(mhs && !mhs.locked) {
        mhs.linkTesis = document.getElementById('mhs-own-link').value.trim();
        saveDB(); renderAll(); showToast("🔗 Link Tesis Berhasil Disimpan & Diperbarui!");
    } else if (mhs && mhs.locked) {
        showToast("Jadwal Anda sudah dikunci. Tidak bisa merubah link lagi.", true);
    }
}

function getBentrokDosens(m) {
    if(!m.tanggal || !m.jam) return [];
    let myDosens = [m.u1, m.u2, m.u3].filter(d => d);
    let bentrokSet = new Set();
    DB.mahasiswa.forEach(other => {
        if(other.nim !== m.nim && other.tanggal === m.tanggal && other.jam === m.jam) {
            let otherDosens = [other.u1, other.u2, other.u3].filter(d => d);
            myDosens.forEach(d => { if(otherDosens.includes(d)) bentrokSet.add(d); });
        }
    });
    return Array.from(bentrokSet);
}

function renderJadwalSideBySide() {
    let container = document.getElementById('container-jadwal-sidebyside'); if(!container) return; container.innerHTML = '';

    let mhsLinkBox = document.getElementById('mhs-link-container');
    if(mhsLinkBox) {
        if(currentRole === 'mahasiswa') {
            mhsLinkBox.style.display = 'block';
            let m = DB.mahasiswa.find(x => x.nama === currentUser);
            let inputLink = document.getElementById('mhs-own-link');
            let btnLink = document.getElementById('btn-save-own-link');
            if (m) {
                inputLink.value = m.linkTesis || '';
                if(m.locked) {
                    inputLink.disabled = true; btnLink.disabled = true; btnLink.innerText = "🔒 Dikunci Admin";
                } else {
                    inputLink.disabled = false; btnLink.disabled = false; btnLink.innerText = "Simpan Link";
                }
            }
        } else { mhsLinkBox.style.display = 'none'; }
    }

    let hideLocked = false; let searchFilter = ""; let roomFilter = "";
    let cbShowLocked = document.getElementById('filter-show-locked');
    let selRoom = document.getElementById('filter-ruangan-matriks');
    
    if (cbShowLocked) hideLocked = (currentRole === 'admin') ? !cbShowLocked.checked : false;
    let sf = document.getElementById('search-matriks');
    if (sf) searchFilter = sf.value.toLowerCase();
    if (selRoom) roomFilter = selRoom.value;

    let mappedMhs = DB.mahasiswa.map((m, idx) => ({ ...m, originalIndex: idx }));
    let filteredMhs = mappedMhs.filter(m => {
        if (currentRole === 'mahasiswa' && m.nama !== currentUser) return false;
        if (currentRole === 'dosen' && m.u1 !== currentUser && m.u2 !== currentUser && m.u3 !== currentUser) return false;
        if (currentRole === 'admin' && hideLocked && m.locked) return false;
        if (searchFilter && !m.nama.toLowerCase().includes(searchFilter) && !m.nim.includes(searchFilter)) return false;
        if (roomFilter && m.ruangan !== roomFilter) return false;
        return true;
    });

    let groups = {};
    filteredMhs.forEach(m => {
        if(!m.tanggal) return; if(!groups[m.tanggal]) groups[m.tanggal] = [];
        groups[m.tanggal].push(m);
    });

    let sortedDates = Object.keys(groups).sort();
    if(sortedDates.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada jadwal / sesi yang cocok untuk ditampilkan.</div>`; return;
    }

    sortedDates.forEach(tgl => {
        let arr = groups[tgl];
        let r1 = arr.filter(m => m.ruangan === "Ruangan 1");
        let r2 = arr.filter(m => m.ruangan === "Ruangan 2");

        let room1HTML = (roomFilter === "" || roomFilter === "Ruangan 1") ? `<div class="room-column"><div class="room-column-title">📍 Ruangan 1</div>${renderSlots(r1)}</div>` : '';
        let room2HTML = (roomFilter === "" || roomFilter === "Ruangan 2") ? `<div class="room-column"><div class="room-column-title">📍 Ruangan 2</div>${renderSlots(r2)}</div>` : '';

        let htmlDay = `
            <div class="jadwal-day-block">
                <div class="jadwal-day-title">📆 Hari / Tanggal Pelaksanaan: ${tgl}</div>
                <div class="rooms-row-grid"> ${room1HTML} ${room2HTML} </div>
            </div>
        `;
        container.innerHTML += htmlDay;
    });
}

function renderSlots(mhsArray) {
    if(mhsArray.length === 0) return '<p style="font-size:0.8rem; color:var(--text-muted); font-style:italic; padding:10px;">Kosong / Tidak ada sesi</p>';
    mhsArray.sort((a,b) => a.jam.localeCompare(b.jam));
    let h = '';
    mhsArray.forEach(m => {
        let lockStr = m.locked ? '🔒 Selesai' : '🔓 Terbuka';
        
        let bentrokDosens = getBentrokDosens(m);
        let myClashes = bentrokDosens; 
        
        if (currentRole === 'mahasiswa') { myClashes = []; } 
        else if (currentRole === 'dosen') { myClashes = bentrokDosens.filter(d => d === currentUser); }

        let isBentrokMobile = myClashes.length > 0;
        
        // Pengecekan Bentrok Ruangan Khusus Admin
        let isRoomConflict = false;
        if (currentRole === 'admin') {
            isRoomConflict = mhsArray.filter(x => x.jam === m.jam).length > 1;
        }

        let cardClass = 'slot-card';
        if(isBentrokMobile) cardClass += ' is-mobile';
        if(isRoomConflict) cardClass += ' is-conflict';
        
        let alertMobile = isBentrokMobile ? `<div style="color:#b45309; font-size:0.75rem; font-weight:700; margin-top:6px; padding:6px; background:#fef3c7; border:1px solid #fde68a; border-radius:4px;">🏃 Ujian Mobile (Ruang 1 & 2): ${myClashes.join(', ')}</div>` : '';
        let alertRoom = isRoomConflict ? `<div style="color:#b91c1c; font-size:0.75rem; font-weight:700; margin-top:6px; padding:6px; background:#fef2f2; border:1px solid #fecaca; border-radius:4px;">⚠️ BENTROK RUANGAN (Double Booking)</div>` : '';
        
        let linkDisplay = m.linkTesis ? `<a href="${m.linkTesis}" target="_blank" style="color:#0284c7; text-decoration:none; font-weight:700;">🔗 Buka File Tesis</a>` : `<span style="color:var(--text-muted); font-style:italic; font-size: 0.75rem;">Link file belum tersedia</span>`;

        let isInc = (!m.u1 || !m.u2 || !m.u3 || !m.linkTesis);
        let flagInc = isInc ? `<span title="⚠️ Data Belum Lengkap (Penguji ada yang kosong ATAU Link Tesis belum disetor)" style="cursor:help; margin-left:4px;">⚠️</span>` : '';

        // Penegasan Peran Dosen
        let roleHighlight = "";
        if(currentRole === 'dosen') {
            if(m.u1 === currentUser) roleHighlight = "Penguji I (Moderator)";
            else if(m.u2 === currentUser) roleHighlight = "Penguji II (Penelaah)";
            else if(m.u3 === currentUser) roleHighlight = "Penguji III";
            
            if(roleHighlight !== "") {
                roleHighlight = `<div class="badge-role">📌 Bertugas sebagai: <b>${roleHighlight}</b></div>`;
            }
        }

        let editBtn = (currentRole === 'admin' && !m.locked) ? `<button class="btn btn-light" style="padding:2px 8px; font-size:0.72rem;" onclick="editDariMatriks(${m.originalIndex})">✏️ Edit</button>` : '';
        let shareBtn = (currentRole === 'admin' || currentRole === 'dosen') ? `<button class="btn btn-success" style="padding:2px 8px; font-size:0.72rem; margin-left:4px;" onclick="shareWA(${m.originalIndex})">💬 Share WA</button>` : '';

        h += `
            <div class="${cardClass}">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; font-weight:700; color:var(--primary); margin-bottom: 4px;">
                    <span>⏰ ${m.jam}</span> 
                    <div style="display:flex; gap:6px; align-items:center;" class="filter-print-hide">
                        ${editBtn} ${shareBtn} <span style="margin-left:6px">${lockStr}</span>
                    </div>
                </div>
                <p style="font-size:0.85rem; font-weight:700; margin:4px 0 2px 0;">${m.nama} (${m.nim}) ${flagInc}</p>
                <p style="font-size:0.75rem; color:var(--text-muted); line-height:1.2;"><b>Judul:</b> ${m.judul}</p>
                ${roleHighlight}
                <div style="font-size:0.75rem; margin:6px 0;">${linkDisplay}</div>
                <div style="font-size:0.72rem; padding-top:4px; border-top:1px dashed var(--border-color); color:var(--text-muted)">
                    <b>Penguji:</b> 1. ${m.u1 || '-'} | 2. ${m.u2 || '-'} | 3. ${m.u3 || '-'}
                </div>
                ${alertMobile}
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
            "Rincian Membimbing": `Pembimbing I: ${p1}, Pembimbing II: ${p2}`,
            "Rincian Menguji": `Penguji I: ${u1}, Penguji II: ${u2}, Penguji III: ${u3}`
        };
    });
    let ws = XLSX.utils.json_to_sheet(data); let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Beban Honor");
    XLSX.writeFile(wb, "Rekap_Honor_Dosen_YanNeri.xlsx");
}

function exportMatriksExcel() {
    let jadwal = DB.mahasiswa.filter(m => m.tanggal).sort((a,b) => a.tanggal.localeCompare(b.tanggal) || a.jam.localeCompare(b.jam));
    let data = jadwal.map(m => ({
        "Tanggal Ujian": m.tanggal, "Jam Pelaksanaan": m.jam, "Ruangan": m.ruangan,
        "NIM": m.nim, "Nama Mahasiswa": m.nama, "Judul Tesis": m.judul,
        "Penguji I (Moderator)": m.u1, "Penguji II (Penelaah)": m.u2, "Penguji III": m.u3,
        "Pembimbing I": m.p1, "Pembimbing II": m.p2, "Status": m.locked ? "Selesai" : "Terbuka"
    }));
    let ws = XLSX.utils.json_to_sheet(data); let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matriks Master");
    XLSX.writeFile(wb, "Jadwal_Master_Ujian_YanNeri.xlsx");
}

function initChartsEngine() {
    let ctx = document.getElementById('chart-beban-total'); if(!ctx) return;
    
    let labels = DB.dosen.map(d => d.nama.split(',')[0]);
    let dataMembimbing = DB.dosen.map(d => {
        let count = 0; DB.mahasiswa.forEach(m => { if(m.p1 === d.nama || m.p2 === d.nama) count++; }); return count;
    });
    let dataMenguji = DB.dosen.map(d => {
        let count = 0; DB.mahasiswa.forEach(m => { if(m.u1 === d.nama || m.u2 === d.nama || m.u3 === d.nama) count++; }); return count;
    });

    if(instanceBebanTotal) instanceBebanTotal.destroy();

    instanceBebanTotal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Menjadi Pembimbing', data: dataMembimbing, backgroundColor: '#2874a6', borderRadius: 4 },
                { label: 'Menjadi Penguji', data: dataMenguji, backgroundColor: '#f39c12', borderRadius: 4 }
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
        "NIM": m.nim, "Nama Mahasiswa": m.nama, "Jenis Ujian": m.jenis, "Judul Penelitian": m.judul,
        "Link File Tesis": m.linkTesis || "",
        "Tanggal Ujian (YYYY-MM-DD)": m.tanggal, "Jam Pelaksanaan": m.jam, "Ruangan": m.ruangan,
        "Pembimbing I": m.p1, "Pembimbing II": m.p2, "Penguji I (Moderator)": m.u1, "Penguji II (Penelaah)": m.u2, "Penguji III": m.u3
    }));
    let ws = XLSX.utils.json_to_sheet(data); let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Database Mahasiswa"); XLSX.writeFile(wb, "Template_Database_Mahasiswa_YanNeri.xlsx");
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
                    nim: nim, nama: r["Nama Mahasiswa"]||"Tanpa Nama", jenis: r["Jenis Ujian"]||"Tesis", judul: r["Judul Penelitian"]||"",
                    linkTesis: r["Link File Tesis"]||"", tanggal: r["Tanggal Ujian (YYYY-MM-DD)"]||"", jam: r["Jam Pelaksanaan"]||"", ruangan: r["Ruangan"]||"Ruangan 1",
                    p1: r["Pembimbing I"]||"", p2: r["Pembimbing II"]||"", u1: r["Penguji I (Moderator)"]||"", u2: r["Penguji II (Penelaah)"]||"", u3: r["Penguji III"]||"", locked: false
                };
                if(ada && !ada.locked) { Object.assign(ada, obj); } else if(!ada) { DB.mahasiswa.push(obj); }
            });
            saveDB(); renderAll(); showToast('Berkas Excel berhasil diimport ke Database.');
        } catch(err) { showToast('Gagal memproses file Excel!', true); }
    };
    reader.readAsArrayBuffer(file); e.target.value = "";
}