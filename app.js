const API_URL = "https://script.google.com/macros/s/AKfycbyD6RlvRATllKL3MIuw-iQQi4Ye-WaHjH4bESJfjGH82JEmAa6yTVj9293XR3RDUu0IKQ/exec"; // 🚩 เปลี่ยนเป็นลิงก์ของลูกพี่
const MY_PASSCODE = "303173"; // 🚩 รหัสผ่านเข้าเว็บ

let workerData = [];

// --- 1. ระบบล็อกหน้าจอ ---
if (sessionStorage.getItem("accessGranted") === "true") {
    document.getElementById("lock-screen").style.display = "none";
}

function checkPasscode() {
    const val = document.getElementById("passcodeInput").value;
    if (val === MY_PASSCODE) {
        sessionStorage.setItem("accessGranted", "true");
        document.getElementById("lock-screen").style.opacity = "0";
        setTimeout(() => document.getElementById("lock-screen").style.display = "none", 500);
    } else {
        alert("รหัสไม่ถูกต้อง!");
        document.getElementById("passcodeInput").value = "";
    }
}

// --- 2. ระบบค้นหาและ Enter ---
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (document.activeElement.id === 'passcodeInput') checkPasscode();
        if (document.activeElement.id === 'searchInput') searchWorker();
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