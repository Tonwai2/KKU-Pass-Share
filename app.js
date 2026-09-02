// 1. นำ URL และ Anon Key มาวางที่นี่
const supabaseUrl = 'https://fsrkmwoctfnuwuwzvhcc.supabase.co'
const supabaseAnonKey = 'sb_publishable_X9N7zEUn-dGwfZvYaFDokQ_Va7ncEFw' // ใช้ค่า anon public

// 2. สร้างตัวเชื่อมต่อ Supabase
const _supabase = supabase.createClient(supabaseUrl, supabaseAnonKey)

// 3. ฟังก์ชันดึงข้อมูลโพสต์ทั้งหมดมาแสดง
async function fetchPosts() {
  const { data: posts, error } = await _supabase
    .from('posts')
    .select('*')
    .eq('status', 'available') // ดึงเฉพาะรายการที่ยังไม่ขาย
    .order('created_at', { ascending: false }); // เอาโพสต์ใหม่ขึ้นก่อน

  if (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
    return;
  }

  console.log('ข้อมูลโพสต์จากฐานข้อมูล:', posts);
  // ตรงนี้สามารถเขียนโค้ดเอาข้อมูลไปแสดงบน HTML ได้เลย
}

// 4. ฟังก์ชันสำหรับสร้างประกาศใหม่ (เมื่อมีคนลงขาย)
async function createPost(title, type, price, contact) {
  const { data, error } = await _supabase
    .from('posts')
    .insert([
      { title: title, type: type, price: price, contact: contact, status: 'available' }
    ]);

  if (error) {
    alert('ลงประกาศไม่สำเร็จ: ' + error.message);
  } else {
    alert('ลงประกาศสำเร็จแล้ว!');
    fetchPosts(); // ดึงข้อมูลใหม่มาแสดงทันที
  }
}

// เรียกให้ทำงานทันทีเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();
});