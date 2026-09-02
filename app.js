// ==========================================
// 1. ตั้งค่า Supabase Client
// ==========================================
const supabaseUrl = 'https://fsrkmwoctfnuwuwzvhcc.supabase.co';
const supabaseAnonKey = 'sb_publishable_X9N7zEUn-dGwfZvYaFDokQ_Va7ncEFw'; 

let _supabase = null;
if (typeof supabase !== 'undefined') {
    _supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);
}

let allPosts = [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentCategory = 'all';

const defaultTableImg = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80";
const defaultTicketImg = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80";

// คำนวณเวลาที่ผ่านไป (Time Ago)
function timeAgo(dateString) {
    if (!dateString) return 'เมื่อซักครู่';
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'เมื่อซักครู่';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} วันที่แล้ว`;
}

// ==========================================
// 2. ฟังก์ชันระบบ Auth & UI (รองรับ Refresh หน้าเว็บ)
// ==========================================
function updateAuthUI() {
    const authNavArea = document.getElementById('authNavArea') || document.getElementById('userProfile');
    const loginBtn = document.getElementById('loginBtn');

    if (!authNavArea) return;

    if (currentUser) {
        if (loginBtn) loginBtn.classList.add('hidden');
        authNavArea.classList.remove('hidden');
        authNavArea.innerHTML = `
            <div class="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5">
                <div class="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                    ${currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div class="text-left hidden sm:block">
                    <span class="text-xs font-semibold text-slate-200 block leading-tight" id="userName">${currentUser.name}</span>
                    <span class="text-[9px] ${currentUser.color} font-medium block leading-tight">${currentUser.badge}</span>
                </div>
                <button onclick="logout()" class="text-slate-400 hover:text-red-400 text-xs ml-1 font-bold">✕</button>
            </div>
        `;
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        authNavArea.innerHTML = `
            <button onclick="openAuthModal('login')"
                class="bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm px-4 py-2 rounded-xl border border-slate-700/80 transition font-medium hover:border-slate-500">
                เข้าสู่ระบบ
            </button>
        `;
    }
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const emailInput = document.getElementById('loginEmail') || document.getElementById('fEmail');
    const email = emailInput ? emailInput.value : '';
    const name = email.split('@')[0] || 'KKU_User';
    const isStudent = email.includes('kkumail.com');

    currentUser = {
        name: name,
        badge: isStudent ? '🎓 นักศึกษา มข. ✓' : '👤 ยืนยันตัวตน (KYC) ✓',
        color: isStudent ? 'text-emerald-400' : 'text-sky-400'
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);

    updateAuthUI();
    closeModal('authModal');
    closeModal('loginModal');
}

function handleLoginSubmit(e) {
    handleLogin(e);
}

function handleRegister(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('regName');
    const typeInput = document.getElementById('regType');

    const name = nameInput ? nameInput.value : 'User';
    const type = typeInput ? typeInput.value : 'student';
    const isStudent = type === 'student';

    currentUser = {
        name: name,
        badge: isStudent ? '🎓 นักศึกษา มข. ✓' : '👤 ยืนยันตัวตน (KYC) ✓',
        color: isStudent ? 'text-emerald-400' : 'text-sky-400'
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);

    updateAuthUI();
    closeModal('authModal');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    updateAuthUI();
}

function openAuthModal(mode) {
    switchAuthTab(mode);
    openModal('authModal');
}

function switchAuthTab(tab) {
    const loginBtn = document.getElementById('authTabLogin');
    const regBtn = document.getElementById('authTabRegister');
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');

    if (tab === 'login') {
        if (loginBtn) loginBtn.className = 'w-1/2 py-3.5 text-xs font-bold text-orange-400 border-b-2 border-orange-500';
        if (regBtn) regBtn.className = 'w-1/2 py-3.5 text-xs font-medium text-slate-400 hover:text-slate-200';
        if (loginForm) loginForm.classList.remove('hidden');
        if (regForm) regForm.classList.add('hidden');
    } else {
        if (regBtn) regBtn.className = 'w-1/2 py-3.5 text-xs font-bold text-orange-400 border-b-2 border-orange-500';
        if (loginBtn) loginBtn.className = 'w-1/2 py-3.5 text-xs font-medium text-slate-400 hover:text-slate-200';
        if (regForm) regForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
    }
}

function handleSellClick() {
    if (!currentUser) {
        const notice = document.getElementById('authNotice');
        if (notice) notice.classList.remove('hidden');
        openAuthModal('login');
    } else {
        const badge = document.getElementById('sellerBadge');
        if (badge) badge.innerText = `ประกาศในนาม: ${currentUser.name} (${currentUser.badge})`;
        updateFormFieldsByCategory();
        openModal('sellModal');
    }
}

// ==========================================
// 3. ฟังก์ชัน Modal & Fetch & Render (ดึงข้อมูลและสร้าง UI)
// ==========================================
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
    if (id === 'authModal') {
        const notice = document.getElementById('authNotice');
        if (notice) notice.classList.add('hidden');
    }
}

async function fetchPosts() {
    if (!_supabase) return;
    const { data: posts, error } = await _supabase.from('posts').select('*').order('id', { ascending: false });
    if (!error && posts) {
        allPosts = posts;
        renderPosts(allPosts);
    }
}

function renderPosts(postsToRender) {
    const container = document.getElementById('posts-container') || document.getElementById('listingGrid');
    const noResults = document.getElementById('noResults');
    if (!container) return;

    container.innerHTML = '';

    if (postsToRender.length === 0) {
        if (noResults) noResults.classList.remove('hidden');
        const countEl = document.getElementById('itemCount');
        if (countEl) countEl.innerText = '0';
        return;
    }

    if (noResults) noResults.classList.add('hidden');

    postsToRender.forEach((post) => {
        const originalIndex = allPosts.findIndex(p => p.id === post.id);
        const isTicket = post.type === 'ticket' || post.type === 'บัตรคอนเสิร์ต';
        
        const badgeText = isTicket ? 'บัตรคอนเสิร์ต' : 'ปล่อยด่วนคืนนี้';
        const badgeStyle = isTicket 
            ? 'bg-purple-900/60 text-purple-300 border-purple-500/30' 
            : 'bg-rose-900/60 text-rose-300 border-rose-500/30';
        
        const coverImage = post.image_url && post.image_url.trim() !== '' 
            ? post.image_url 
            : (isTicket ? defaultTicketImg : defaultTableImg);

        const seatLabel = isTicket ? 'ประเภท:' : 'ที่นั่ง:';
        const priceLabel = isTicket ? 'ราคาป้าย:' : 'ราคาจอง:';
        const sellLabel = isTicket ? 'ปล่อยเหมา:' : 'ราคาปล่อยต่อ:';
        const sellColor = isTicket ? 'text-purple-400' : 'text-amber-400';

        const timeDisplay = timeAgo(post.created_at);

        container.innerHTML += `
            <div class="card-item glass-card rounded-2xl border border-slate-800 overflow-hidden card-hover flex flex-col justify-between bg-slate-900/90" data-category="${post.type}" data-title="${post.title || ''}">
                <div>
                    <div class="h-44 w-full overflow-hidden relative">
                        <img src="${coverImage}" alt="${post.title}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='${isTicket ? defaultTicketImg : defaultTableImg}';">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    </div>

                    <div class="p-5 pt-3">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeStyle} flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full ${isTicket ? 'bg-purple-400' : 'bg-rose-500'} animate-pulse"></span>
                                ${badgeText}
                            </span>
                            <span class="text-xs text-slate-400">${timeDisplay}</span>
                        </div>

                        <h3 class="card-title text-lg font-bold text-white mb-1 leading-snug cursor-pointer hover:text-amber-400 transition" onclick="openDetailModalByData(${originalIndex})">
                            ${post.title || 'ไม่มีชื่อรายการ'}
                        </h3>
                        <p class="text-xs text-slate-400 mb-4 flex items-center gap-1">📍 ${post.zone || 'ไม่ระบุพิกัด'}</p>

                        <div class="bg-slate-950/80 p-3.5 rounded-xl text-xs space-y-2 border border-slate-800/80">
                            <div class="flex justify-between text-slate-300">
                                <span class="text-slate-400">${seatLabel}</span>
                                <span class="font-medium">${post.seat_info || (isTicket ? 'บัตรทั่วไป' : 'โต๊ะทั่วไป')}</span>
                            </div>
                            
                            <div class="flex justify-between text-slate-400">
                                <span>${priceLabel}</span>
                                <span class="line-through">฿${post.original_price || '-'}</span>
                            </div>
                            
                            <div class="flex justify-between text-sm border-t border-slate-800/80 pt-2 items-center">
                                <span class="font-medium text-slate-300">${sellLabel}</span>
                                <span class="font-black ${sellColor} text-lg">฿${post.price || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                            ${(post.contact || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span class="text-xs text-slate-300 font-medium">${post.contact || 'ผู้ลงประกาศ'}</span>
                    </div>
                    <button onclick="openDetailModalByData(${originalIndex})" class="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition">
                        ดูรายละเอียด
                    </button>
                </div>
            </div>
        `;
    });

    const countEl = document.getElementById('itemCount');
    if (countEl) countEl.innerText = postsToRender.length;
}

// ==========================================
// 4. ระบบลงประกาศขาย (Insert Post ลง Supabase)
// ==========================================
async function handleSellSubmit(event) {
    if (event) event.preventDefault();

    if (!currentUser) {
        alert('🔒 กรุณาเข้าสู่ระบบก่อนลงประกาศครับ');
        openAuthModal('login');
        return;
    }

    const title = document.getElementById('fTitle')?.value;
    const original_price = document.getElementById('fRealPrice')?.value || document.getElementById('fOriginalPrice')?.value; 
    const price = document.getElementById('fSellPrice')?.value;
    const contact = document.getElementById('fContact')?.value || currentUser.name;
    const type = document.getElementById('fCategory')?.value || 'table';
    const zone = document.getElementById('fZone')?.value;
    const note = document.getElementById('fNote')?.value;
    const seat_info = document.getElementById('fSeats')?.value;
    const image_url = document.getElementById('fImg')?.value || document.getElementById('fImage')?.value || document.getElementById('fImgUrl')?.value || "";

    if (!title || !price) {
        alert('กรุณากรอกหัวข้อประกาศและราคาปล่อยต่อให้ครบถ้วนครับ');
        return;
    }

    if (_supabase) {
        const { error } = await _supabase
            .from('posts')
            .insert([{ 
                title, 
                original_price: original_price ? Number(original_price) : null,
                price: Number(price), 
                contact, 
                type, 
                zone,
                note,
                seat_info,
                image_url: image_url.trim() !== "" ? image_url.trim() : null
            }]);

        if (error) {
            alert('เกิดข้อผิดพลาดในการลงประกาศ: ' + error.message);
        } else {
            alert('🎉 ลงประกาศสำเร็จแล้ว!');
            closeModal('sellModal');
            closeModal('postModal');
            document.getElementById('sellForm')?.reset();
            fetchPosts();
        }
    }
}

// ==========================================
// 5. ระบบแบ่งหมวดหมู่ & รายละเอียด & ค้นหา
// ==========================================
function updateFormFieldsByCategory() {
    const fCategory = document.getElementById('fCategory');
    if (!fCategory) return;
    const cat = fCategory.value;

    const lblTitle = document.getElementById('lblTitle');
    const fTitle = document.getElementById('fTitle');
    const lblZone = document.getElementById('lblZone');
    const fZone = document.getElementById('fZone');
    const lblDate = document.getElementById('lblDate');
    const fDate = document.getElementById('fDate');
    const lblSeats = document.getElementById('lblSeats');
    const fSeats = document.getElementById('fSeats');
    const lblTime = document.getElementById('lblTime');
    const fTime = document.getElementById('fTime');
    const lblRealPrice = document.getElementById('lblRealPrice');
    const lblContact = document.getElementById('lblContact');
    const fContact = document.getElementById('fContact');

    if (cat === 'table') {
        if (lblTitle) lblTitle.innerText = "ชื่อร้านอาหาร/คาเฟ่";
        if (fTitle) fTitle.placeholder = "เช่น ร้านหลังมัก (โซน A หน้าเวที)";
        if (lblZone) lblZone.innerText = "พิกัด/โซนร้าน";
        if (fZone) fZone.placeholder = "เช่น โซนกังสดาล";
        if (lblDate) lblDate.innerText = "วันที่จองไว้";
        if (fDate) fDate.placeholder = "เช่น คืนนี้, 15 ส.ค.";
        if (lblSeats) lblSeats.innerText = "จำนวนที่นั่ง";
        if (fSeats) fSeats.placeholder = "เช่น โต๊ะ 4-6 คน";
        if (lblTime) lblTime.innerText = "เงื่อนไขเวลาเข้าโต๊ะ";
        if (fTime) fTime.placeholder = "เช่น ต้องเข้าก่อน 20:30 น.";
        if (lblRealPrice) lblRealPrice.innerText = "ราคามัดจำเดิม (บาท)";
        if (lblContact) lblContact.innerText = "ช่องทางติดต่อ / พิกัดส่งมอบโต๊ะ";
        if (fContact) fContact.placeholder = "เช่น Line ID: @xxx / นัดเจอหน้าร้าน";
    } else if (cat === 'ticket') {
        if (lblTitle) lblTitle.innerText = "ชื่อคอนเสิร์ต / ชื่องาน";
        if (fTitle) fTitle.placeholder = "เช่น Three Man Down Live in KKU";
        if (lblZone) lblZone.innerText = "สถานที่จัดงาน";
        if (fZone) fZone.placeholder = "เช่น ศูนย์ประชุมฯ มข.";
        if (lblDate) lblDate.innerText = "วันแสดงคอนเสิร์ต";
        if (fDate) fDate.placeholder = "เช่น เสาร์นี้, 20 ส.ค.";
        if (lblSeats) lblSeats.innerText = "รายละเอียดโซน/บัตร";
        if (fSeats) fSeats.placeholder = "เช่น บัตรยืน (Zone A) x 2 ใบ";
        if (lblTime) lblTime.innerText = "เวลาประตูเปิด / เริ่มแสดง";
        if (fTime) fTime.placeholder = "เช่น ประตูเปิด 18:00 น.";
        if (lblRealPrice) lblRealPrice.innerText = "ราคาหน้าป้าย/ราคาเดิม (บาท)";
        if (lblContact) lblContact.innerText = "ช่องทางติดต่อ / รูปแบบการส่งมอบบัตร";
        if (fContact) fContact.placeholder = "เช่น Line ID: @xxx / นัดรับบัตรจริงหน้างาน";
    }
}

function filterCategory(category) {
    currentCategory = category;
    const btnAll = document.getElementById('btn-all');
    const btnTable = document.getElementById('btn-table');
    const btnTicket = document.getElementById('btn-ticket');

    const activeClass = "tab-btn bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs sm:text-sm px-4 py-2 rounded-xl font-medium shadow-md transition";
    const inactiveClass = "tab-btn bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm px-4 py-2 rounded-xl border border-slate-700 transition";

    if (btnAll) btnAll.className = category === 'all' ? activeClass : inactiveClass;
    if (btnTable) btnTable.className = category === 'table' ? activeClass : inactiveClass;
    if (btnTicket) btnTicket.className = category === 'ticket' ? activeClass : inactiveClass;

    if (category === 'all') renderPosts(allPosts);
    else if (category === 'table') renderPosts(allPosts.filter(p => p.type === 'table' || p.type === 'โต๊ะร้านอาหาร/ร้านเหล้า' || p.type === 'โต๊ะร้านอาหาร'));
    else if (category === 'ticket') renderPosts(allPosts.filter(p => p.type === 'ticket' || p.type === 'บัตรคอนเสิร์ต'));
}

function searchCards() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (query === '') {
        filterCategory(currentCategory);
        return;
    }

    const filtered = allPosts.filter(post => {
        const matchCategory = (currentCategory === 'all' || post.type === currentCategory);
        const matchQuery = (post.title && post.title.toLowerCase().includes(query)) || (post.zone && post.zone.toLowerCase().includes(query));
        return matchCategory && matchQuery;
    });

    renderPosts(filtered);
}

function openDetailModalByData(index) {
    const post = allPosts[index];
    if (!post) return;

    const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val || '-';
    };

    const isTicket = post.type === 'ticket' || post.type === 'บัตรคอนเสิร์ต';

    setEl('mName', post.title);
    setEl('mZoneDate', `📍 ${post.zone || 'ไม่ระบุพิกัด'}`);
    setEl('mSeats', post.seat_info || (isTicket ? 'บัตรคอนเสิร์ต' : 'โต๊ะร้านอาหาร'));
    setEl('mTime', 'ตามตกลง');
    setEl('mRealPrice', post.original_price ? `฿${post.original_price}` : '-');
    setEl('mSellPrice', `฿${post.price || 0}`);
    
    const noteText = post.note ? `หมายเหตุ: ${post.note}\nติดต่อ: ${post.contact || '-'}` : `ติดต่อ: ${post.contact || '-'}`;
    setEl('mNote', noteText);

    openModal('detailModal');
}

// ==========================================
// 6. เริ่มทำงานเมื่อโหลดหน้า
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    fetchPosts();
});