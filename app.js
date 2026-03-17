const API_URL = "https://script.google.com/macros/s/AKfycbyD6RlvRATllKL3MIuw-iQQi4Ye-WaHjH4bESJfjGH82JEmAa6yTVj9293XR3RDUu0IKQ/exec"; // 🚩 เปลี่ยนเป็นลิงก์ของลูกพี่
const MY_PASSCODE = "303173"; // 🚩 รหัสผ่านเข้าเว็บ

// 1. 🚩 ระบบเช็คการเข้าถึง (ใช้ sessionStorage แทน prompt)
// ถ้าเคยใส่รหัสผ่านแล้วใน Session นี้ ให้ปิดหน้าจอ Lock Screen ทันที
if (sessionStorage.getItem("accessGranted") === "true") {
    const lock = document.getElementById("lock-screen");
    if (lock) lock.style.display = "none";
}

// 2. 🚩 ฟังก์ชันเช็ครหัสผ่านจากหน้าจอ UNLOCK (ไม่ใช่ prompt)
function checkPasscode() {
    const passcodeField = document.getElementById("passcodeInput");
    const val = passcodeField.value;

    if (val === MY_PASSCODE) {
        sessionStorage.setItem("accessGranted", "true");
        // อนิเมชั่นจางหายไปแบบนุ่มนวล
        const lock = document.getElementById("lock-screen");
        lock.style.opacity = "0";
        setTimeout(() => {
            lock.style.display = "none";
        }, 500);
    } else {
        alert("รหัสไม่ถูกต้อง! กรุณาลองใหม่");
        passcodeField.value = ""; // ล้างรหัสที่พิมพ์ผิด
        passcodeField.focus();    // ให้พิมพ์ต่อได้เลย
    }
}

// 3. 🚩 ระบบกด Enter ในหน้าล็อกและหน้าหลัก
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const activeID = document.activeElement.id;
        if (activeID === 'passcodeInput') {
            checkPasscode(); // ถ้าพิมพ์รหัสอยู่ กด Enter ให้ปลดล็อก
        } else if (activeID === 'searchInput') {
            searchWorker(); // ถ้าพิมพ์ชื่อพนักงานอยู่ กด Enter ให้ค้นหา
        }
    }
});

// --- 3. ดึงข้อมูล ---
async function fetchData() {
    try {
        const res = await fetch(API_URL);
        workerData = await res.json();
        console.log("Data Loaded:", workerData.length);
    } catch (e) { console.log("Fetch Error"); }
}
fetchData();

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
    } else alert("ไม่พบข้อมูล");
}

function displayWorker(w) {
    const container = document.getElementById('workerList');
    
    // 🚩 ผมเพิ่มส่วนของ Contact (เบอร์ติดต่อ) เข้าไปให้แล้วครับ
    container.innerHTML = `
        <div class="profile-card">
            <div class="p-img-wrapper">
                <img src="img/${w['ID พนักงาน']}.png" class="profile-img-large" 
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
// Navbar Effect
window.onscroll = () => {
    const nav = document.querySelector('.navbar');
    window.scrollY > 50 ? nav.classList.add('scrolled') : nav.classList.remove('scrolled');
};