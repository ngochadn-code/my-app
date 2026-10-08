import { useState, useEffect } from 'react'

const URL_SERVER = 'https://so-uoc-mo-server.onrender.com/api/uoc-mo'
const URL_DANG_NHAP = 'https://so-uoc-mo-server.onrender.com/api/dang-nhap'
const URL_DANG_KY = 'https://so-uoc-mo-server.onrender.com/api/dang-ky'

function App() {
  // === TRẠNG THÁI ĐĂNG NHẬP ===
  const [nguoiDung, setNguoiDung] = useState(null)
  const [dangNhapForm, setDangNhapForm] = useState(true) // true=Đăng nhập, false=Đăng ký
  const [tenDangNhap, setTenDangNhap] = useState('')
  const [matKhau, setMatKhau] = useState('')
  const [thongBao, setThongBao] = useState('')

  // === DANH SÁCH ƯỚC MƠ ===
  const [danhSach, setDanhSach] = useState([])
  const [noiDung, setNoiDung] = useState('')
  const [mucTien, setMucTien] = useState('')
  const [dangTai, setDangTai] = useState(false)
  // === THÊM 2 HÀM MỚI VÀO TRONG function App() ===
const danhDauHoanThanh = async (id) => {
  try {
    await fetch(`${URL_SERVER}/${id}/hoan-thanh`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nguoiDungId: nguoiDung.nguoiDungId })
    })
    await layDanhSach()
  } catch (loi) {
    setThongBao('Lỗi cập nhật! 😅')
  }
}

const xoaUocMo = async (id) => {
  if (!window.confirm('Chắc chắn xóa? 🗑️')) return
  
  try {
    await fetch(`${URL_SERVER}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nguoiDungId: nguoiDung.nguoiDungId })
    })
    await layDanhSach()
    setThongBao('Đã xóa thành công! 🗑️')
  } catch (loi) {
    setThongBao('Lỗi xóa! 😅')
  }
}<button 
  onClick={() => danhDauHoanThanh(uocMo._id)}
  style={{ border: 'none', background: uocMo.hoanThanh ? '#f6e05e' : '#68d391', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem' }}
>
  {uocMo.hoanThanh ? '↩️' : '✓'}
</button>
<button 
  onClick={() => xoaUocMo(uocMo._id)}
  style={{ border: 'none', background: '#fc8181', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem' }}
>
  🗑️
</button>

  // === KIỂM TRA ĐĂNG NHẬP KHI MỞ TRANG ===
  useEffect(() => {
    const daDangNhap = localStorage.getItem('nguoiDung')
    if (daDangNhap) {
      setNguoiDung(JSON.parse(daDangNhap))
    }
  }, [])

  // === LẤY DỮ LIỆU KHI ĐÃ ĐĂNG NHẬP ===
  useEffect(() => {
    if (nguoiDung) layDanhSach()
  }, [nguoiDung])

  const layDanhSach = async () => {
    try {
      const phanHoi = await fetch(`${URL_SERVER}?nguoiDungId=${nguoiDung.nguoiDungId}`)
      const duLieu = await phanHoi.json()
      setDanhSach(duLieu)
    } catch (loi) {
      console.log('❌ Lỗi:', loi)
    }
  }

  // === XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ ===
  const xuLyDangNhap = async () => {
    if (!tenDangNhap.trim() || !matKhau.trim()) {
      return setThongBao('Điền đầy đủ thông tin nhé! ✍️')
    }

    setDangTai(true)
    setThongBao('')
    
    try {
      const url = dangNhapForm ? URL_DANG_NHAP : URL_DANG_KY
      const phanHoi = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDangNhap, matKhau })
      })
      
      const ketQua = await phanHoi.json()
      
      if (ketQua.thanhCong) {
        setNguoiDung({
          nguoiDungId: ketQua.nguoiDungId,
          tenDangNhap: ketQua.tenDangNhap
        })
        localStorage.setItem('nguoiDung', JSON.stringify({
          nguoiDungId: ketQua.nguoiDungId,
          tenDangNhap: ketQua.tenDangNhap
        }))
        setThongBao(ketQua.thongBao)
        setTenDangNhap('')
        setMatKhau('')
      } else {
        setThongBao(ketQua.loi)
      }
    } catch (loi) {
      setThongBao('Lỗi kết nối! Hãy thử lại 😅')
    } finally {
      setDangTai(false)
    }
  }

  // === ĐĂNG XUẤT ===
  const dangXuat = () => {
    setNguoiDung(null)
    localStorage.removeItem('nguoiDung')
    setDanhSach([])
    setThongBao('Tạm biệt! Hẹn gặp lại 👋')
  }

  // === THÊM ƯỚC MƠ ===
  const themUocMo = async () => {
    if (!noiDung.trim()) return setThongBao('Nhập nội dung ước mơ nhé! 💫')
    
    setDangTai(true)
    setThongBao('')
    try {
      await fetch(URL_SERVER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noiDung,
          mucTien: Number(mucTien) || 0,
          nguoiDungId: nguoiDung.nguoiDungId
        })
      })
      setNoiDung('')
      setMucTien('')
      await layDanhSach()
    } catch (loi) {
      setThongBao('Lỗi lưu! 😅')
    } finally {
      setDangTai(false)
    }
  }

  // === TÍNH TỔNG TIỀN ===
  const tongTien = danhSach.reduce((tong, item) => tong + (item.mucTien || 0), 0)

  // === GIAO DIỆN ===
  if (!nguoiDung) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', maxWidth: '400px', width: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
          <h1 style={{ textAlign: 'center', color: '#4a5568', marginBottom: '0.5rem' }}>✨ Sổ Ước Mơ ✨</h1>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: '2rem' }}>
            {dangNhapForm ? 'Đăng nhập để xem ước mơ của bạn' : 'Tạo tài khoản riêng của bạn'}
          </p>
          
          <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => { setDangNhapForm(true); setThongBao('') }}
              style={{ flex: 1, padding: '0.8rem', border: 'none', background: dangNhapForm ? '#667eea' : '#e2e8f0', color: dangNhapForm ? 'white' : '#4a5568', borderRadius: '8px 0 0 8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Đăng Nhập
            </button>
            <button 
              onClick={() => { setDangNhapForm(false); setThongBao('') }}
              style={{ flex: 1, padding: '0.8rem', border: 'none', background: !dangNhapForm ? '#667eea' : '#e2e8f0', color: !dangNhapForm ? 'white' : '#4a5568', borderRadius: '0 8px 8px 0', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Đăng Ký
            </button>
          </div>

          {thongBao && <p style={{ color: thongBao.includes('thành công') || thongBao.includes('Chào mừng') ? '#48bb78' : '#e53e3e', textAlign: 'center', marginBottom: '1rem' }}>{thongBao}</p>}
          
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={tenDangNhap}
            onChange={(e) => setTenDangNhap(e.target.value)}
            style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            style={{ width: '100%', padding: '0.9rem', marginBottom: '1.5rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }}
          />
          
          <button
            onClick={xuLyDangNhap}
            disabled={dangTai}
            style={{ width: '100%', padding: '1rem', background: dangTai ? '#cbd5e0' : 'linear-gradient(90deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: dangTai ? 'not-allowed' : 'pointer' }}
          >
            {dangTai ? 'Đang xử lý... ⏳' : (dangNhapForm ? 'Đăng Nhập 🚀' : 'Tạo Tài Khoản ✨')}
          </button>
        </div>
      </div>
    )
  }

  // === GIAO DIỆN SAU KHI ĐĂNG NHẬP ===
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'white', fontSize: '1.8rem', margin: 0 }}>✨ Sổ Ước Mơ</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'white', fontWeight: '500' }}>👤 {nguoiDung.tenDangNhap}</span>
            <button onClick={dangXuat} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Đăng xuất</button>
          </div>
        </div>

        {thongBao && <p style={{ background: 'white', padding: '0.8rem', borderRadius: '8px', textAlign: 'center', color: '#48bb78', marginBottom: '1.5rem' }}>{thongBao}</p>}

        {/* FORM NHẬP */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginTop: 0, color: '#4a5568' }}>Thêm ước mơ mới 💫</h3>
          <input type="text" placeholder="Bạn muốn điều gì?" value={noiDung} onChange={(e) => setNoiDung(e.target.value)} style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }} />
          <input type="number" placeholder="Cần bao nhiêu tiền (đồng)?" value={mucTien} onChange={(e) => setMucTien(e.target.value)} style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }} />
          <button onClick={themUocMo} disabled={dangTai} style={{ width: '100%', padding: '0.9rem', marginTop: '1rem', background: dangTai ? '#cbd5e0' : 'linear-gradient(90deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: dangTai ? 'not-allowed' : 'pointer' }}>
            {dangTai ? 'Đang lưu... ☁️' : 'Lưu Lên Đám Mây ☁️'}
          </button>
        </div>

        {/* TỔNG KẾT */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#718096' }}>Tổng giá trị ước mơ</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#667eea', margin: '0.5rem 0' }}>{tongTien.toLocaleString('vi-VN')} ₫</p>
        </div>

        {/* DANH SÁCH */}
        <div>
          {danhSach.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>Chưa có ước mơ nào... Hãy viết điều đầu tiên! 🌟</p>
          ) : (
            danhSach.map((uocMo) => (
              <div key={uocMo._id} style={{ background: 'white', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', opacity: uocMo.hoanThanh ? 0.7 : 1, textDecoration: uocMo.hoanThanh ? 'line-through' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#2d3748' }}>{uocMo.hoanThanh && '✅ '}{uocMo.noiDung}</h4>
                    <p style={{ margin: '0.3rem 0 0 0', color: '#718096' }}>{uocMo.mucTien > 0 ? `${uocMo.mucTien.toLocaleString('vi-VN')} ₫` : 'Không đặt mục tiền'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ border: 'none', background: uocMo.hoanThanh ? '#f6e05e' : '#68d391', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem' }}>{uocMo.hoanThanh ? '↩️' : '✓'}</button>
                    <button style={{ border: 'none', background: '#fc8181', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App