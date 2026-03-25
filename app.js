// ==========================================
// 1. CONFIGURATION & STATE (ตั้งค่าและตัวแปรสถานะ)
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbyD6RlvRATllKL3MIuw-iQQi4Ye-WaHjH4bESJfjGH82JEmAa6yTVj9293XR3RDUu0IKQ/exec";
const MY_PASSCODE = "303173"; 
let workerData = []; 

// ตัวแปรสำหรับระบบปุ่ม Back อัจฉริยะ
let lastViewMode = "search"; // "search" หรือ "list"
let lastTitle = ""; 
let lastMembers = [];

// ==========================================
// 2. SECURITY SYSTEM
// ==========================================

if (sessionStorage.getItem("accessGranted") === "true") {
    const lock = document.getElementById("lock-screen");
    if (lock) lock.style.display = "none";
}

async function checkPasscode() {
    const passcodeField = document.getElementById("passcodeInput");
    const lockTitle = document.querySelector(".lock-content h2"); // ดึงหัวข้อมาทำเอฟเฟกต์
    const val = passcodeField.value;

    if (val === MY_PASSCODE) {
        // 1. เริ่มเอฟเฟกต์ถอดรหัสที่ตัวหนังสือ
        if(lockTitle) lockTitle.classList.add("decrypting");
        
        sessionStorage.setItem("accessGranted", "true");
        await fetchData(); 

        const lock = document.getElementById("lock-screen");
        
        // 2. ใส่ท่าไม้ตาย Unlock (จอระเบิดออก)
        lock.classList.add("unlock-animate");
        
        // 3. สั่งให้ Hero Content ค่อยๆ ดีดตัวขึ้นมา
        document.body.classList.add("loaded");

        setTimeout(() => {
            lock.style.display = "none";
        }, 800); // รอให้จบอนิเมชั่น 0.8 วินาที
    } else {
        alert("รหัสไม่ถูกต้อง!");
        passcodeField.value = "";
        passcodeField.focus();
    }
}

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const activeID = document.activeElement.id;
        if (activeID === 'passcodeInput') checkPasscode();
        else if (activeID === 'searchInput') searchWorker();
    }
});

// ==========================================
// 3. DATA MANAGEMENT
// ==========================================

async function fetchData() {
    try {
        const res = await fetch(API_URL);
        workerData = await res.json();
        console.log("Data Loaded:", workerData.length);
    } catch (e) { 
        console.error("Fetch Error:", e);
    }
}
fetchData();

function searchWorker() {
    const s = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!s) return;
    
    // ค้นหาครอบคลุม ID, ชื่อจริง, และชื่อเล่น
    const results = workerData.filter(x => 
        (x["ID พนักงาน"] || "").toString().toLowerCase().includes(s) ||
        (x["ชื่อ-นามสกุล"] || "").toString().toLowerCase().includes(s) ||
        (x["ชื่อเล่น"] || "").toString().toLowerCase().includes(s)
    );
    
    if (results.length === 1) {
        lastViewMode = "search"; // มาจากการค้นหาโดยตรง
        displayWorker(results[0]);
        document.getElementById('searchInput').blur();
    } else if (results.length > 1) {
        renderListView(`SEARCH: "${s.toUpperCase()}"`, results);
        document.getElementById('searchInput').blur();
    } else {
        alert("ไม่พบข้อมูลพนักงานท่านนี้");
    }
}

// ==========================================
// 4. DISPLAY FUNCTIONS (ปรับแต่งสวยงาม)
// ==========================================

function displayWorker(w) {
    const container = document.getElementById('workerList');
    
    container.innerHTML = `
        <div class="profile-card" style="position: relative; animation: fadeIn 0.5s ease;">
            <button onclick="closeProfile()" 
                    style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.1); 
                           border: 1px solid rgba(255,255,255,0.2); color: white; cursor: pointer; 
                           padding: 8px 12px; font-size: 11px; border-radius: 4px; backdrop-filter: blur(5px);">
                ✕ ${lastViewMode === 'list' ? 'BACK TO LIST' : 'CLOSE'}
            </button>

            <div class="p-img-wrapper">
                <img src="img/${w['ลิงก์รูปภาพ']}" class="profile-img-large" 
                     onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png';">
            </div>
            <div class="info-grid">
                <div class="info-item">
                    <label>FULL NAME</label>
                    <p>${w['ชื่อ-นามสกุล'] || "-"} ${w['ชื่อเล่น'] ? '<span style="color:var(--uniq-red)">('+w['ชื่อเล่น']+')</span>' : ''}</p>
                </div>
                <div class="info-item"><label>ID</label><p>${w['ID พนักงาน'] || "-"}</p></div>
                <div class="info-item"><label>POSITION</label><p>${w['ตำแหน่ง'] || "-"}</p></div>
                <div class="info-item">
                    <label>RESPONSIBLE AREA</label>
                    <p style="color: #ffcc00;">${w['พื้นที่การดูแล'] || "-"}</p>
                </div>
                <div class="info-item"><label>TEAM</label><p>${w['ทีม'] || "-"}</p></div>
                <div class="info-item">
                    <label>CONTACT</label>
                    <p><a href="tel:${w['เบอร์ติดต่อ']}" style="color:white; text-decoration:none;">${w['เบอร์ติดต่อ'] || "-"}</a></p>
                </div>
                <div class="status-badge">
                    CERTIFICATE: ${(w['สถานะใบเซอร์'] || "N/A").toUpperCase()}
                </div>
            </div>
        </div>
    `;
    container.scrollIntoView({ behavior: 'smooth' });
}

function renderListView(title, members) {
    lastViewMode = "list"; 
    lastTitle = title;
    lastMembers = members;

    const container = document.getElementById('workerList');
    let html = `
        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-left: 4px solid var(--uniq-red); padding-left: 20px; margin: 40px 0 20px 0;">
            <div>
                <h2 style="margin:0; letter-spacing:2px; font-size:1.2rem;">${title.toUpperCase()}</h2>
                <p style="color:#888; font-size:0.8rem; margin:5px 0 0 0;">พบพนักงานทั้งหมด ${members.length} ท่าน</p>
            </div>
            <button onclick="clearDisplay()" style="background:none; border:1px solid #444; color:#888; padding:5px 10px; border-radius:4px; font-size:10px; cursor:pointer;">CLOSE ✕</button>
        </div>
        <div class="worker-list-grid" style="display:grid; gap:8px; max-width:800px; margin:0 auto 50px auto;">
    `;

    members.forEach(w => {
        html += `
            <div class="worker-row" onclick="displayWorkerByID('${w['ID พนักงาน']}')" 
                 style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); 
                        padding:12px 20px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; border-radius:8px; transition:0.3s;">
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="color:var(--uniq-red); font-weight:bold; font-size:12px;">#${w['ID พนักงาน']}</span>
                    <span style="font-size:16px;">${w['ชื่อ-นามสกุล']} ${w['ชื่อเล่น'] ? '<small style="color:#888;">('+w['ชื่อเล่น']+')</small>' : ''}</span>
                </div>
                <div style="opacity:0.3; font-size:10px;">VIEW ❯</div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
    container.scrollIntoView({ behavior: 'smooth' });
}

function closeProfile() {
    if (lastViewMode === "list") {
        renderListView(lastTitle, lastMembers);
    } else {
        clearDisplay();
    }
}

function clearDisplay() {
    setActiveButton(null); // <--- ลบสี active ออกทั้งหมด
    const container = document.getElementById('workerList');
    const searchInput = document.getElementById('searchInput');

// --- เพิ่มบรรทัดนี้เพื่อให้แถบปุ่มเหลืองหายไป ---
    const subContainer = document.getElementById('subTeamContainer');
    if (subContainer) subContainer.style.display = "none";
    // ---------------------------------------

    container.innerHTML = ""; 
    if(searchInput) {
        searchInput.value = "";
        searchInput.focus();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 5. FILTER & QR SYSTEM
// ==========================================

function filterTeam(teamName) {
    const members = workerData.filter(w => w['ทีม'].toString().includes(teamName));
    if (members.length === 0) return alert(`ไม่พบทีม: ${teamName}`);
    renderListView(`${teamName} TEAM`, members);
}

function filterArea(areaName, event) {
    if (event) setActiveButton(event.currentTarget); // <--- เรียกใช้ฟังก์ชันเปลี่ยนสี
    const members = workerData.filter(w => w['พื้นที่การดูแล'].toString().includes(areaName));
    if (members.length === 0) return alert(`ไม่พบพื้นที่: ${areaName}`);
    renderListView(`${areaName} AREA`, members);
}

function displayWorkerByID(id) {
    const worker = workerData.find(w => w["ID พนักงาน"].toString() === id.toString());
    if (worker) displayWorker(worker);
}

async function checkQRScan() {
    const urlParams = new URLSearchParams(window.location.search);
    const qrID = urlParams.get('id');

    if (qrID) {
        lastViewMode = "search"; // สแกน QR ให้ถือว่าเป็นโหมดค้นหาเดี่ยว
        let retry = 0;
        const check = setInterval(() => {
            if (workerData.length > 0) {
                clearInterval(check);
                const w = workerData.find(x => (x["ID พนักงาน"] || "").toString().toLowerCase() === qrID.toLowerCase());
                if (w) displayWorker(w);
            } else if (++retry > 10) clearInterval(check);
        }, 500);
    }
}

// เพิ่มฟังก์ชันนี้เพื่อเช็คสถานะตอน Refresh หน้าจอ (F5)
window.addEventListener('load', () => {
    if (sessionStorage.getItem("accessGranted") === "true") {
        // ถ้าเคยผ่านรหัสมาแล้ว ให้ใส่คลาส loaded ทันทีเพื่อให้เนื้อหาโชว์
        document.body.classList.add("loaded");
        
        // และซ่อนหน้า Lock Screen ทันทีไม่ต้องรอ
        const lock = document.getElementById("lock-screen");
        if (lock) lock.style.display = "none";
    }
});

// --- วางต่อท้ายไฟล์ app.js ---

// 1. กำหนดโครงสร้างทีมย่อย (แก้ชื่อให้ตรงกับใน Google Sheet นะครับ)
const teamStructure = {
    'TBM': ['Engineering Tunnel', 'Engineering GEO Tunnel', 'Engineering TAM', 'TAM Supervisor', 'Foreman', 'Rig Operator / TBM Operator', 'Erector and Grout operator Team', 'Supervisor', 'Surface Team', 'Mechanic & Electrician'],
    'Station PP25': ['PP25', 'IVS06',],
    'Station PP26': ['PP26','VS02','Transition/C&C/VS03','VS02/VS03'],
    'Safety': ['office', 'Station PP26', 'Station PP25', 'TBM']
};

// 2. ฟังก์ชันเมื่อกดเลือกทีมหลัก
function selectMainTeam(mainTeam, event) {
    if (event) setActiveButton(event.currentTarget);
    // กรองรายชื่อทีมหลักก่อน (เรียกใช้ฟังก์ชันเดิมที่คุณมี)
    filterTeam(mainTeam); 

    const subContainer = document.getElementById('subTeamContainer');
    const subButtons = document.getElementById('subTeamButtons');

    if (!subContainer || !subButtons) return; // กัน Error ถ้าหา ID ไม่เจอ

    subButtons.innerHTML = ""; // ล้างปุ่มเก่า

    if (teamStructure[mainTeam]) {
        subContainer.style.display = "block";
        teamStructure[mainTeam].forEach(sub => {
            const btn = document.createElement('button');
            btn.className = "filter-btn sub-btn";
            btn.innerText = sub;
            btn.onclick = (event) => filterSubInsideMain(mainTeam, sub, event);
            subButtons.appendChild(btn);
        });
    } else {
        subContainer.style.display = "none";
    }
}

// แก้ไขฟังก์ชันเดิมให้เป็นแบบนี้ครับ
function filterSubInsideMain(main, sub, event) {
    if (event) setActiveButton(event.currentTarget);
    const members = workerData.filter(w => {
        // ดึงค่าจากคอลัมน์ 'ทีม' และ 'ทีมย่อย' มาเช็คพร้อมกัน
        const mainTeamVal = (w['ทีม'] || "").toString();
        const subTeamVal = (w['ทีมย่อย'] || "").toString(); // <--- นี่คือคอลัมน์ใหม่ที่คุณสร้าง
        
        // ต้องตรงทั้งทีมหลัก และทีมย่อย
        return mainTeamVal.includes(main) && subTeamVal.includes(sub);
    });

    if (members.length === 0) {
        return alert(`ไม่พบพนักงานในหน่วย ${sub} ของทีม ${main}`);
    }
    
    renderListView(`${main} > ${sub}`, members);
}

// --- วางท้ายไฟล์ app.js ---

// ฟังก์ชันสำหรับจัดการสีปุ่ม Active
function setActiveButton(clickedButton) {
    // 1. ค้นหาปุ่มที่มี class 'active-filter' อยู่ในตอนนี้ทั้งหมด แล้วลบ class ออก
    const currentActive = document.querySelectorAll('.filter-btn.active-filter');
    currentActive.forEach(btn => btn.classList.remove('active-filter'));

    // 2. ใส่ class 'active-filter' ให้กับปุ่มที่เพิ่งถูกคลิก
    if (clickedButton) {
        clickedButton.classList.add('active-filter');
    }
}

window.addEventListener('load', checkQRScan);