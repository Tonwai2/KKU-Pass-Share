// 1. ตั้งค่า Supabase Client
const supabaseUrl = 'https://fsrkmwoctfnuwuwzvhcc.supabase.co';
const supabaseAnonKey = 'sb_publishable_X9N7zEUn-dGwfZvYaFDokQ_Va7ncEFw'; // ⚠️ ใส่ Publishable key ของคุณให้ครบ

const _supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// 2. ฟังก์ชันดึงข้อมูลมาแสดงผล (Fetch Posts)
async function fetchPosts() {
  const { data: posts, error } = await _supabase
    .from('posts')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
    return;
  }

  const container = document.getElementById('posts-container');
  if (!container) return;

  container.innerHTML = ''; // ล้างค่าเก่า

  if (posts.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 glass-card rounded-2xl border border-slate-800">
        <p class="text-slate-400 text-sm">ยังไม่มีรายการส่งต่อในขณะนี้</p>
      </div>`;
    return;
  }

  // สร้างการ์ดแสดงผล
  posts.forEach((post) => {
    const isTicket = post.type === 'ticket' || post.type === 'บัตรคอนเสิร์ต';
    const badgeText = isTicket ? '🎟️ บัตรคอนเสิร์ต' : '🍽️ โต๊ะร้านอาหาร';
    const badgeColor = isTicket ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20';

    container.innerHTML += `
      <div class="card-item glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between p-5 space-y-4">
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${badgeColor}">
              ${badgeText}
            </span>
            <span class="text-[11px] text-slate-500 font-light">เมื่อซักครู่</span>
          </div>
          <h3 class="text-base font-bold text-white mb-1">${post.title}</h3>
          <p class="text-xs text-slate-400 mb-3">📍 ${post.zone || 'ไม่ระบุพิกัด'}</p>
          <div class="bg-slate-900/80 p-3 rounded-xl text-xs space-y-1 border border-slate-800">
            <div class="flex justify-between text-slate-400"><span>ราคาปล่อยต่อ:</span><span class="font-extrabold text-amber-400 text-base">฿${post.price || 0}</span></div>
          </div>
        </div>
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span class="text-xs text-slate-400">ผู้ติดต่อ: ${post.contact || 'ไม่ระบุ'}</span>
          <button onclick="alert('ช่องทางติดต่อ: ${post.contact}')" class="bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 text-xs font-medium px-3.5 py-1.5 rounded-lg transition">
            ติดต่อรับสิทธิ์
          </button>
        </div>
      </div>
    `;
  });

  // อัปเดตจำนวนรายการ
  const countEl = document.getElementById('itemCount');
  if (countEl) countEl.innerText = posts.length;
}

// 3. ฟังก์ชันบันทึกข้อมูลประกาศใหม่ลง Supabase
async function handleSellSubmit(event) {
  event.preventDefault(); // กันไม่ให้หน้ารีเฟรช

  // ดึงค่าจาก ฟอร์ม sellForm ใน HTML
  const title = document.getElementById('fTitle')?.value;
  const price = document.getElementById('fSellPrice')?.value;
  const contact = document.getElementById('fContact')?.value;
  const type = document.getElementById('fCategory')?.value;
  const zone = document.getElementById('fZone')?.value;

  // ส่งข้อมูลเข้า Supabase
  const { data, error } = await _supabase
    .from('posts')
    .insert([
      { 
        title: title, 
        price: Number(price), 
        contact: contact, 
        type: type,
        zone: zone 
      }
    ]);

  if (error) {
    alert('เกิดข้อผิดพลาดในการลงประกาศ: ' + error.message);
    console.error(error);
  } else {
    alert('🎉 ลงประกาศสำเร็จแล้ว!');
    closeModal('sellModal'); // ปิดหน้าต่าง Modal
    document.getElementById('sellForm').reset(); // ล้างข้อมูลในฟอร์ม
    fetchPosts(); // ดึงข้อมูลมาแสดงใหม่ทันที
  }
}

// 4. ฟังก์ชัน เปิด/ปิด Modal
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

// เรียกให้ทำงานทันทีเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', fetchPosts);