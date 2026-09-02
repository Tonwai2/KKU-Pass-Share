// 1. ตั้งค่า Supabase Client
const supabaseUrl = 'https://fsrkmwoctfnuwuwzvhcc.supabase.co';
const supabaseAnonKey = 'sb_publishable_X9N7zEUn-dGwfZvYaFDokQ_Va7ncEFw'; // ⚠️ ใส่ Publishable key ของคุณให้ครบ

const _supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

let currentPosts = []; // เก็บข้อมูลไว้เปิด Modal ดูรายละเอียด

// 2. ดึงข้อมูลและสร้างการ์ดหน้าตาเหมือนแบบเดิม
async function fetchPosts() {
  const { data: posts, error } = await _supabase
    .from('posts')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }

  currentPosts = posts || [];
  const container = document.getElementById('posts-container');
  if (!container) return;

  container.innerHTML = '';

  if (currentPosts.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 glass-card rounded-2xl border border-slate-800">
        <p class="text-slate-400 text-sm">ยังไม่มีรายการส่งต่อในขณะนี้</p>
      </div>`;
    return;
  }

  currentPosts.forEach((post, index) => {
    const isTicket = post.type === 'ticket' || post.type === 'บัตรคอนเสิร์ต';
    const badgeText = isTicket ? '🎟️ บัตรคอนเสิร์ต' : '🍽️ โต๊ะร้านอาหาร';
    const badgeStyle = isTicket 
      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
      : 'bg-amber-500/10 text-amber-500 border-amber-500/20';

    container.innerHTML += `
      <div class="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-medium px-2.5 py-1 rounded-lg border ${badgeStyle}">
              ${badgeText}
            </span>
            <span class="text-xs text-slate-500">เมื่อซักครู่</span>
          </div>
          <h3 class="text-lg font-bold text-white mb-1 cursor-pointer hover:text-amber-400 transition" onclick="openDetailModal(${index})">
            ${post.title}
          </h3>
          <p class="text-xs text-slate-400 mb-4">📍 ${post.zone || 'ไม่ระบุพิกัด'}</p>

          <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
            <span class="text-xs text-slate-400">ราคาปล่อยต่อ:</span>
            <span class="text-lg font-extrabold text-amber-400">฿${post.price || 0}</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span class="text-xs text-slate-400">ผู้ติดต่อ: <span class="text-slate-200">${post.contact || '-'}</span></span>
          <button onclick="openDetailModal(${index})" class="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 border border-amber-500/30 text-xs font-semibold px-4 py-2 rounded-xl transition">
            ดูรายละเอียด
          </button>
        </div>
      </div>
    `;
  });

  const countEl = document.getElementById('itemCount');
  if (countEl) countEl.innerText = currentPosts.length;
}

// 3. ฟังก์ชันเปิด Pop-up ดูรายละเอียด
function openDetailModal(index) {
  const post = currentPosts[index];
  if (!post) return;

  const detailModal = document.getElementById('detailModal');
  if (detailModal) {
    document.getElementById('detailTitle').innerText = post.title || '-';
    document.getElementById('detailPrice').innerText = `฿${post.price || 0}`;
    document.getElementById('detailZone').innerText = post.zone || 'ไม่ระบุพิกัด';
    document.getElementById('detailContact').innerText = post.contact || '-';
    document.getElementById('detailCategory').innerText = post.type || '-';
    openModal('detailModal');
  } else {
    // กรณีใน HTML ไม่มี detailModal ให้แสดง Alert ติดต่อแทน
    alert(`📌 ${post.title}\n📍 โซน: ${post.zone || '-'}\n💰 ราคา: ฿${post.price}\n📞 ติดต่อ: ${post.contact}`);
  }
}

// 4. ฟังก์ชันลงประกาศใหม่
async function handleSellSubmit(event) {
  event.preventDefault();

  const title = document.getElementById('fTitle')?.value;
  const price = document.getElementById('fSellPrice')?.value;
  const contact = document.getElementById('fContact')?.value;
  const type = document.getElementById('fCategory')?.value;
  const zone = document.getElementById('fZone')?.value;

  const { error } = await _supabase
    .from('posts')
    .insert([{ title, price: Number(price), contact, type, zone }]);

  if (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message);
  } else {
    alert('🎉 ลงประกาศสำเร็จแล้ว!');
    closeModal('sellModal');
    document.getElementById('sellForm').reset();
    fetchPosts();
  }
}

// 5. เปิด/ปิด Modal
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', fetchPosts);