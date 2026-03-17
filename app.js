// 🚩 ระบบล็อกรหัสผ่านหน้าเว็บ
const SECRET_PASSCODE = "303173"; // ลูกพี่เปลี่ยนรหัสตรงนี้ตามใจชอบครับ
let isAuthorized = sessionStorage.getItem("isAuthorized");

if (!isAuthorized) {
    let input = prompt("กรุณาใส่รหัสผ่านเพื่อเข้าใช้งานระบบ SAFETY UNIQ:");
    if (input === SECRET_PASSCODE) {
        sessionStorage.setItem("isAuthorized", "true");
        alert("รหัสถูกต้อง ยินดีต้อนรับครับ");
    } else {
        alert("รหัสผ่านไม่ถูกต้อง! ระบบจะปิดตัวลง");
        window.location.href = "https://google.com"; // ถ้าใส่ผิดให้เด้งไป Google แทน
    }
}

const API_URL = "https://script.google.com/macros/s/AKfycbyD6RlvRATllKL3MIuw-iQQi4Ye-WaHjH4bESJfjGH82JEmAa6yTVj9293XR3RDUu0IKQ/exec"; // อย่าลืมเช็คลิงก์ Google Script นะครับ

let workerData = [];

// 1. ดึงข้อมูลจากฐานข้อมูล
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        workerData = await response.json();
        console.log("ระบบพร้อม! เชื่อมต่อข้อมูลสำเร็จ:", workerData.length);
    } catch (e) {
        console.error("เชื่อมต่อฐานข้อมูลไม่ได้:", e);
    }
}
fetchData();

// 2. 🚩 ระบบกด Enter เพื่อค้นหา
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchWorker();
    }
});

// 3. 🚩 ระบบอนิเมชั่น Navbar เมื่อเลื่อนเมาส์ลง (Scroll)
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// 4. ฟังก์ชันค้นหาแบบฉลาด
function searchWorker() {
    const s = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!s) return;

    const result = workerData.find(w => 
        (w["ID พนักงาน"] || "").toString().toLowerCase().includes(s) ||
        (w["ชื่อ-นามสกุล"] || "").toString().toLowerCase().includes(s)
    );

    if (result) {
        displayWorker(result);
        document.getElementById('searchInput').value = ""; // ล้างช่องค้นหาอัตโนมัติ
    } else {
        alert("ไม่พบข้อมูลพนักงานท่านนี้");
    }
}

// 5. ฟังก์ชันแสดงผล (พร้อมอนิเมชั่นลอยขึ้น)
function displayWorker(w) {
    const container = document.getElementById('workerList');
    
    // สร้างโครง HTML (คงสไตล์ SpaceX ที่ลูกพี่ชอบ)
    container.innerHTML = `
        <div class="profile-card">
            <div class="p-img-wrapper">
                <img src="img/${w['ID พนักงาน']}.png" class="profile-img-large" 
                     onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png';">
            </div>
            <div class="info-grid">
                <div class="info-item"><label>Full Name</label><p>${w['ชื่อ-นามสกุล']}</p></div>
                <div class="info-item"><label>Employee ID</label><p>${w['ID พนักงาน']}</p></div>
                <div class="info-item"><label>Position</label><p>${w['ตำแหน่ง']}</p></div>
                <div class="info-item"><label>Team / Area</label><p>${w['ทีม']} / ${w['พื้นที่การดูแล']}</p></div>
                <div class="info-item"><label>Contact</label><p>${w['เบอร์ติดต่อ']}</p></div>
                <div class="status-badge">CERTIFICATION: ${w['สถานะใบเซอร์'].toUpperCase()}</div>
            </div>
        </div>
    `;
    
    // 🚩 สั่งให้เลื่อนจอลงมาหาข้อมูลแบบนุ่มนวล
    container.scrollIntoView({ behavior: 'smooth' });
}

// 6. ฟังก์ชันแยกทีม
function filterTeam(t) {
    const filtered = workerData.filter(w => w['ทีม'] === t);
    const container = document.getElementById('workerList');
    let html = `<h3 style="letter-spacing:5px; text-align:center; margin-top:30px;">TEAM: ${t.toUpperCase()}</h3>`;
    filtered.forEach(w => {
        html += `<div style="padding:15px; border-bottom:1px solid #333; cursor:pointer;" onclick="displayWorkerByID('${w['ID พนักงาน']}')">
                    ${w['ID พนักงาน']} - ${w['ชื่อ-นามสกุล']}
                 </div>`;
    });
    container.innerHTML = html;
    container.scrollIntoView({ behavior: 'smooth' });
}

function displayWorkerByID(id) {
    const r = workerData.find(w => w["ID พนักงาน"].toString() === id);
    if (r) displayWorker(r);
}