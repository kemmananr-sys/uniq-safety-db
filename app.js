// ==========================================
// 1. CONFIGURATION (ตั้งค่าพื้นฐาน)
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbyD6RlvRATllKL3MIuw-iQQi4Ye-WaHjH4bESJfjGH82JEmAa6yTVj9293XR3RDUu0IKQ/exec";
const MY_PASSCODE = "303173"; 
let workerData = []; // ประกาศตัวแปรเก็บข้อมูลพนักงาน

// ==========================================
// 2. SECURITY SYSTEM (ระบบล็อกหน้าจอ)
// ==========================================

// เช็คสถานะการเข้าถึงจาก Session
if (sessionStorage.getItem("accessGranted") === "true") {
    const lock = document.getElementById("lock-screen");
    if (lock) lock.style.display = "none";
}

// ฟังก์ชันเช็ครหัสผ่าน
function checkPasscode() {
    const passcodeField = document.getElementById("passcodeInput");
    const val = passcodeField.value;

    if (val === MY_PASSCODE) {
        sessionStorage.setItem("accessGranted", "true");
        const lock = document.getElementById("lock-screen");
        lock.style.opacity = "0";
        setTimeout(() => {
            lock.style.display = "none";
        }, 500);
    } else {
        alert("รหัสไม่ถูกต้อง! กรุณาลองใหม่");
        passcodeField.value = "";
        passcodeField.focus();
    }
}

// ระบบกด Enter (รองรับทั้งหน้าล็อกและหน้าค้นหา)
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const activeID = document.activeElement.id;
        if (activeID === 'passcodeInput') {
            checkPasscode();
        } else if (activeID === 'searchInput') {
            searchWorker();
        }
    }
});

// ==========================================
// 3. DATA MANAGEMENT (การจัดการข้อมูล)
// ==========================================

// ดึงข้อมูลจาก Google Sheets
async function fetchData() {
    try {
        const res = await fetch(API_URL);
        workerData = await res.json();
        console.log("Data Loaded Successfully. Total records:", workerData.length);
    } catch (e) { 
        console.error("Fetch Error:", e);
        alert("ไม่สามารถโหลดข้อมูลจาก Server ได้");
    }
}
fetchData();

// ฟังก์ชันค้นหาพนักงาน (Search)
function searchWorker() {
    const s = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!s) return;
    
    const w = workerData.find(x => 
        (x["ID พนักงาน"] || "").toString().toLowerCase().includes(s) ||
        (x["ชื่อ-นามสกุล"] || "").toString().toLowerCase().includes(s)
    );
    
    if (w) {
        displayWorker(w);
        document.getElementById('searchInput').blur();
    } else {
        alert("ไม่พบข้อมูลพนักงานท่านนี้");
    }
}

// ==========================================
// 4. DISPLAY FUNCTIONS (การแสดงผล)
// ==========================================

// แสดงการ์ดข้อมูลพนักงานแบบละเอียด (Card View)
function displayWorker(w) {
    const container = document.getElementById('workerList');
    
    container.innerHTML = `
        <div class="profile-card">
            <div class="p-img-wrapper">
                <img src="img/${w['ลิงก์รูปภาพ']}" class="profile-img-large" 
                     onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png';">
            </div>
            <div class="info-grid">
                <div class="info-item">
                    <label>FULL NAME</label>
                    <p>${w['ชื่อ-นามสกุล'] || "-"}</p>
                </div>
                <div class="info-item">
                    <label>ID</label>
                    <p>${w['ID พนักงาน'] || "-"}</p>
                </div>
                <div class="info-item">
                    <label>POSITION</label>
                    <p>${w['ตำแหน่ง'] || "-"}</p>
                </div>
                <div class="info-item">
                    <label>RESPONSIBLE AREA</label>
                    <p style="color: #ffcc00;">${w['พื้นที่การดูแล'] || "-"}</p>
                </div>
                <div class="info-item">
                    <label>TEAM</label>
                    <p>${w['ทีม'] || "-"}</p>
                </div>
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

// ฟังก์ชันช่วยแสดงผลรายชื่อ (List View)
function renderListView(title, members) {
    const container = document.getElementById('workerList');
    let html = `
        <div style="border-left: 4px solid var(--uniq-red); padding-left: 20px; margin: 40px 0 20px 0;">
            <h2 style="margin:0; letter-spacing:2px;">${title.toUpperCase()}</h2>
            <p style="color:#888;">พนักงานทั้งหมด ${members.length} ท่าน</p>
        </div>
        <div class="worker-list-grid" style="display:grid; gap:10px; max-width:800px; margin:0 auto 50px auto;">
    `;

    members.forEach(w => {
        html += `
            <div class="worker-row" onclick="displayWorkerByID('${w['ID พนักงาน']}')" 
                 style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); 
                        padding:15px 25px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:20px;">
                    <span style="color:var(--uniq-red); font-size:14px;">#${w['ID พนักงาน']}</span>
                    <span style="font-size:18px;">${w['ชื่อ-นามสกุล']}</span>
                </div>
                <div style="opacity:0.5; font-size:12px;">VIEW ></div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
    container.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 5. FILTER FUNCTIONS (ระบบกรองข้อมูล)
// ==========================================

// กรองตามทีม (Team)
function filterTeam(teamName) {
    const members = workerData.filter(w => w['ทีม'].toString().includes(teamName));
    if (members.length === 0) {
        alert(`ไม่พบข้อมูลพนักงานในทีม: ${teamName}`);
        return;
    }
    renderListView(`${teamName} TEAM`, members);
}

// กรองตามพื้นที่ (Area)
function filterArea(areaName) {
    const members = workerData.filter(w => w['พื้นที่การดูแล'].toString().includes(areaName));
    if (members.length === 0) {
        alert(`ไม่พบพนักงานในพื้นที่: ${areaName}`);
        return;
    }
    renderListView(`${areaName} AREA`, members);
}

// ค้นหาด้วย ID (ใช้เมื่อกดเลือกจาก List View)
function displayWorkerByID(id) {
    const worker = workerData.find(w => w["ID พนักงาน"].toString() === id.toString());
    if (worker) {
        displayWorker(worker);
    }
}

// ==========================================
// 6. QR CODE SYSTEM (ระบบรองรับการสแกน QR)
// ==========================================

/**
 * ฟังก์ชันตรวจสอบ Parameter 'id' จาก URL 
 * เช่น https://.../index.html?id=1001
 * ถ้าตรวจเจอ จะทำการดึงข้อมูลพนักงานคนนั้นขึ้นมาแสดงทันที
 */
async function checkQRScan() {
    // 1. ดึงค่า ID จาก URL
    const urlParams = new URLSearchParams(window.location.search);
    const qrID = urlParams.get('id');

    if (qrID) {
        console.log("QR Scan Detected. ID:", qrID);
        
        // 2. รอจนกว่าข้อมูลพนักงานจะถูกโหลดเสร็จ (ป้องกันกรณี Fetch ข้อมูลช้า)
        let retryCount = 0;
        const maxRetries = 10; // ลองเช็คข้อมูล 10 ครั้ง (ครั้งละ 0.5 วินาที)

        const checkDataReady = setInterval(() => {
            if (workerData && workerData.length > 0) {
                clearInterval(checkDataReady);
                
                // 3. ค้นหาพนักงานจาก ID ที่ได้จาก QR
                const worker = workerData.find(w => 
                    (w["ID พนักงาน"] || "").toString().toLowerCase() === qrID.toLowerCase()
                );

                if (worker) {
                    displayWorker(worker); // ใช้ฟังก์ชันแสดงการ์ดเดิมที่ลูกพี่มีอยู่แล้ว
                    console.log("QR Worker Found:", worker['ชื่อ-นามสกุล']);
                } else {
                    console.warn("QR ID not found in database.");
                }
            } else {
                retryCount++;
                if (retryCount >= maxRetries) {
                    clearInterval(checkDataReady);
                    console.error("Data loading timeout for QR scan.");
                }
            }
        }, 500);
    }
}

// สั่งให้ระบบเริ่มทำงานเมื่อโหลดหน้าเว็บเสร็จ
window.addEventListener('load', checkQRScan);