// รายชื่อจังหวัดไทย 77 จังหวัด
const thaiProvinces = [
    "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร",
    "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท",
    "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง",
    "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม",
    "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส",
    "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
    "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พังงา", "พัทลุง",
    "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่",
    "พะเยา", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน",
    "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง",
    "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
    "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
    "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี",
    "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย",
    "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์",
    "อุทัยธานี", "อุบลราชธานี", "เบตง"
];

let currentProvince = "";
let currentCode = "";
let countdownTimer;
let countdownSeconds = 600;
let isCountdownRunning = false;
let userName = "";
let history = [];

// DOM
const nameInput       = document.getElementById('nameInput');
const checkBtn        = document.getElementById('checkBtn');
const resetBtn        = document.getElementById('resetBtn');
const resultSection   = document.getElementById('resultSection');
const provinceDisplay = document.getElementById('provinceDisplay');
const hiddenCode      = document.getElementById('hiddenCode');
const codeReveal      = document.getElementById('codeReveal');
const timerValue      = document.getElementById('timerValue');
const progressFill    = document.getElementById('progressFill');
const userNameDisplay = document.getElementById('userNameDisplay');
const historyList     = document.getElementById('historyList');

// Helpers
function normalizeName(name) {
    return name.trim().toLowerCase();
}

function getRandomProvince() {
    return thaiProvinces[Math.floor(Math.random() * thaiProvinces.length)];
}

function generateSecretCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function startCountdown() {
    if (isCountdownRunning) clearInterval(countdownTimer);

    isCountdownRunning = true;
    countdownSeconds = 600;
    updateTimerDisplay();

    countdownTimer = setInterval(() => {
        countdownSeconds--;
        updateTimerDisplay();

        if (countdownSeconds <= 0) {
            clearInterval(countdownTimer);
            isCountdownRunning = false;
            hiddenCode.textContent = currentCode;
            codeReveal.textContent = "รหัสตรวจสอบถูกเปิดเผยแล้ว! จะเปลี่ยนใหม่ในไม่ช้า";
            codeReveal.style.color = "#10b981";
        }
    }, 1000);
}

function updateTimerDisplay() {
    const min = Math.floor(countdownSeconds / 60);
    const sec = countdownSeconds % 60;
    timerValue.textContent = `\( {min.toString().padStart(2,'0')}: \){sec.toString().padStart(2,'0')}`;

    progressFill.style.width = `${(countdownSeconds / 600) * 100}%`;

    if (countdownSeconds <= 60) {
        timerValue.classList.add('blink');
        timerValue.style.color = '#ef4444';
    } else {
        timerValue.classList.remove('blink');
        timerValue.style.color = '#fbbf24';
    }
}

function generateNewResult() {
    userName = nameInput.value.trim();
    if (!userName) {
        alert("กรุณาใส่ชื่อเพื่อตรวจสอบประวัติ!");
        nameInput.focus();
        return;
    }

    const normName = normalizeName(userName);
    const today = new Date().toDateString();
    const key = `dailyResult_${normName}`;

    let stored = localStorage.getItem(key);
    let storedProvince = "", storedTime = "", storedDate = "";

    if (stored) {
        const data = JSON.parse(stored);
        storedProvince = data.province;
        storedTime = data.time;
        storedDate = data.date;
    }

    const isNewDay = storedDate !== today;

    if (!isNewDay && storedProvince) {
        // ยังไม่ครบ 24 ชม. → แสดงเดิม
        currentProvince = storedProvince;
        currentCode = generateSecretCode();

        userNameDisplay.textContent = userName;
        provinceDisplay.textContent = currentProvince;
        hiddenCode.textContent = "****************";
        codeReveal.textContent = `ผลตรวจสอบวันนี้ (${storedTime}) - คงที่จนครบ 24 ชม.`;
        codeReveal.style.color = "#94a3b8";

        resultSection.classList.add('active');
        startCountdown();
        nameInput.value = "";
        return;
    }

    // วันใหม่ → สุ่มใหม่ + บันทึก
    currentProvince = getRandomProvince();
    currentCode = generateSecretCode();

    const now = new Date();
    const timeStr = now.toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'});

    localStorage.setItem(key, JSON.stringify({
        province: currentProvince,
        time: timeStr,
        date: today
    }));

    userNameDisplay.textContent = userName;
    provinceDisplay.textContent = currentProvince;
    hiddenCode.textContent = "****************";
    codeReveal.textContent = "รหัสตรวจสอบจะถูกเปิดเผยเมื่อครบ 10 นาที";
    codeReveal.style.color = "#94a3b8";

    resultSection.classList.add('active');
    startCountdown();
    addToHistory(userName, currentProvince);

    nameInput.value = "";
}

function addToHistory(name, province) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'});

    history.unshift({ name, province, time: timeStr });

    if (history.length > 10) history.pop();

    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = "";
    if (history.length === 0) {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.textContent = "ยังไม่มีประวัติการตรวจสอบ";
        li.style.color = "#94a3b8";
        li.style.textAlign = "center";
        historyList.appendChild(li);
        return;
    }

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `<span>\( {item.name}</span><span> \){item.province}</span><span>${item.time}</span>`;
        historyList.appendChild(li);
    });
}

function resetAll() {
    nameInput.value = "";
    resultSection.classList.remove('active');
    if (isCountdownRunning) clearInterval(countdownTimer);
    isCountdownRunning = false;
    timerValue.textContent = "10:00";
    progressFill.style.width = "100%";
    timerValue.classList.remove('blink');
    timerValue.style.color = '#fbbf24';
}

// Events
checkBtn.addEventListener('click', generateNewResult);
resetBtn.addEventListener('click', resetAll);
nameInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') generateNewResult();
});

// Init
updateHistoryDisplay();