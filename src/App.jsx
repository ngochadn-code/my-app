import { useState, useEffect } from 'react'

// ===== KIỂM TRA LINK ĐÚNG =====
const URL_SERVER = 'https://webngochadn.onrender.com/api'

function App() {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token')
    } catch {
      return null
    }
  })
  const [tenDangNhap, setTenDangNhap] = useState(() => {
    try {
      return localStorage.getItem('tenDangNhap') || ''
    } catch {
      return ''
    }
  })
  const [dangNhapForm, setDangNhapForm] = useState(true)
  const [tenDN, setTenDN] = useState('')
  const [matKhau, setMatKhau] = useState('')
  const [thongBao, setThongBao] = useState('')
  const [danhSach, setDanhSach] = useState([])
  const [noiDung, setNoiDung] = useState('')
  const [mucTien, setMucTien] = useState('')
  const [dangTai, setDangTai] = useState(false)
  const [daSanSang, setDaSanSang] = useState(false)

  // ===== Đảm bảo chỉ chạy sau khi giao diện sẵn sàng =====
  useEffect(() => {
    setDaSanSang(true)
  }, [])

  useEffect(() => {
    if (token && daSanSang) {
      layDanhSach()
    }
  }, [token, daSanSang])

  const layDanhSach = async () => {
    if (!token) return
    try {
      const phanHoi = await fetch(`${URL_SERVER}/uoc-mo`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const duLieu = await phanHoi.json()
      
      if (Array.isArray(duLieu)) {
        setDanhSach(duLieu)
      } else {
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('tenDangNhap')
        setThongBao('Phiên hết hạn, vui lòng đăng nhập lại 🔄')
      }
    } catch (loi) {
      console.log('Lỗi lấy danh sách:', loi)
    }
  }

  const xuLyDangNhap = async () => {
    if (!tenDN.trim() || matKhau.length < 6) {
      return setThongBao('Tên ≥ 3 ký tự, mật khẩu ≥ 6 ký tự! ✍️')
    }
    setDangTai(true)
    setThongBao('')
    try {
      const url = dangNhapForm ? `${URL_SERVER}/dang-nhap` : `${URL_SERVER}/dang-ky`
      const phanHoi = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDangNhap: tenDN, matKhau })
      })
      const ketQua = await phanHoi.json()
      
      if (ketQua.thanhCong && ketQua.token) {
        setToken(ketQua.token)
        setTenDangNhap(ketQua.tenDangNhap)
        localStorage.setItem('token', ketQua.token)
        localStorage.setItem('tenDangNhap', ketQua.tenDangNhap)
        setThongBao(ketQua.thongBao || 'Đăng nhập thành công! 🎉')
        setTenDN('')
        setMatKhau('')
      } else if (ketQua.thanhCong) {
        setThongBao((ketQua.thongBao || 'Đăng ký thành công!') + ' Bây giờ đăng nhập nhé! 🚀')
        setDangNhapForm(true)
      } else {
        setThongBao(ketQua.loi || 'Lỗi không xác định 😅')
      }
    } catch (loi) {
      setThongBao('Lỗi kết nối đến Server! Kiểm tra Server chạy chưa 😅')
    } finally {
      setDangTai(false)
    }
  }

  const dangXuat = () => {
    setToken(null)
    setTenDangNhap('')
    setDanhSach([])
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('tenDangNhap')
    } catch {}
    setThongBao('Tạm biệt! Hẹn gặp lại 👋')
  }

  const themUocMo = async () => {
    if (!noiDung.trim()) return setThongBao('Nhập nội dung nhé! 💫')
    setDangTai(true)
    try {
      const phanHoi = await fetch(`${URL_SERVER}/uoc-mo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          noiDung,
          mucTien: Number(mucTien) || 0
        })
      })
      if (!phanHoi.ok) throw new Error('Lỗi gửi dữ liệu')
      
      setNoiDung('')
      setMucTien('')
      await layDanhSach()
    } catch (loi) {
      setThongBao('Lỗi lưu! 😅')
    } finally {
      setDangTai(false)
    }
  }

  const danhDauHoanThanh = async (id) => {
    try {
      await fetch(`${URL_SERVER}/uoc-mo/${id}/hoan-thanh`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      await layDanhSach()
    } catch (loi) {
      setThongBao('Lỗi cập nhật! 😅')
    }
  }

  const xoaUocMo = async (id) => {
    if (!window.confirm('Chắc chắn xóa? 🗑️')) return
    try {
      await fetch(`${URL_SERVER}/uoc-mo/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      await layDanhSach()
      setThongBao('Đã xóa! 🗑️')
    } catch (loi) {
      setThongBao('Lỗi xóa! 😅')
    }
  }

  // ===== Tính toán an toàn =====
  const tongTien = Array.isArray(danhSach) 
    ? danhSach.reduce((tong, item) => tong + (Number(item.mucTien) || 0), 0) 
    : 0
  const daHoanThanh = Array.isArray(danhSach)
    ? danhSach.filter(i => i.hoanThanh).length
    : 0
  const tongTienHoanThanh = Array.isArray(danhSach)
    ? danhSach.filter(i => i.hoanThanh).reduce((t, i) => t + (Number(i.mucTien) || 0), 0)
    : 0
  const phanTram = tongTien > 0 ? Math.round((tongTienHoanThanh / tongTien) * 100) : 0

  // ===== Trang đang tải =====
  if (!daSanSang) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <h2 style={{ color: 'white' }}>Đang khởi tạo... ⏳</h2>
      </div>
    )
  }

  // ===== Giao diện chưa đăng nhập =====
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', maxWidth: '400px', width: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
          <h1 style={{ textAlign: 'center', color: '#4a5568', marginBottom: '0.5rem' }}>✨ Sổ Ước Mơ ✨</h1>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: '2rem' }}>
            {dangNhapForm ? 'Đăng nhập để theo dõi ước mơ của bạn' : 'Tạo tài khoản riêng của bạn'}
          </p>
          
          <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
            <button onClick={() => { setDangNhapForm(true); setThongBao('') }}
              style={{ flex: 1, padding: '0.8rem', border: 'none', background: dangNhapForm ? '#667eea' : '#e2e8f0', color: dangNhapForm ? 'white' : '#4a5568', borderRadius: '8px 0 0 8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Đăng Nhập
            </button>
            <button onClick={() => { setDangNhapForm(false); setThongBao('') }}
              style={{ flex: 1, padding: '0.8rem', border: 'none', background: !dangNhapForm ? '#667eea' : '#e2e8f0', color: !dangNhapForm ? 'white' : '#4a5568', borderRadius: '0 8px 8px 0', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Đăng Ký
            </button>
          </div>

          {thongBao && <p style={{ color: thongBao.includes('thành công') || thongBao.includes('Chào mừng') ? '#48bb78' : '#e53e3e', textAlign: 'center', marginBottom: '1rem' }}>{thongBao}</p>}
          
          <input type="text" placeholder="Tên đăng nhập" value={tenDN} onChange={(e) => setTenDN(e.target.value)}
            style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }} />
          <input type="password" placeholder="Mật khẩu (≥ 6 ký tự)" value={matKhau} onChange={(e) => setMatKhau(e.target.value)}
            style={{ width: '100%', padding: '0.9rem', marginBottom: '1.5rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }} />
          
          <button onClick={xuLyDangNhap} disabled={dangTai}
            style={{ width: '100%', padding: '1rem', background: dangTai ? '#cbd5e0' : 'linear-gradient(90deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: dangTai ? 'not-allowed' : 'pointer' }}>
            {dangTai ? 'Đang xử lý... ⏳' : (dangNhapForm ? 'Đăng Nhập 🚀' : 'Tạo Tài Khoản ✨')}
          </button>
        </div>
      </div>
    )
  }

  // ===== Giao diện đã đăng nhập =====
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'white', fontSize: '1.8rem', margin: 0 }}>✨ Sổ Ước Mơ</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'white', fontWeight: '500' }}>👤 {tenDangNhap}</span>
            <button onClick={dangXuat} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Đăng xuất</button>
          </div>
        </div>

        {thongBao && <p style={{ background: 'white', padding: '0.8rem', borderRadius: '8px', textAlign: 'center', color: '#48bb78', marginBottom: '1.5rem' }}>{thongBao}</p>}

        {/* Form thêm */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginTop: 0, color: '#4a5568' }}>Thêm ước mơ mới 💫</h3>
          <input type="text" placeholder="Bạn muốn điều gì?" value={noiDung} onChange={(e) => setNoiDung(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }} />
          <input type="number" placeholder="Cần bao nhiêu tiền?" value={mucTien} onChange={(e) => setMucTien(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }} />
          <button onClick={themUocMo} disabled={dangTai}
            style={{ width: '100%', padding: '0.9rem', marginTop: '1rem', background: dangTai ? '#cbd5e0' : 'linear-gradient(90deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: dangTai ? 'not-allowed' : 'pointer' }}>
            {dangTai ? 'Đang lưu... ☁️' : 'Lưu Lên Đám Mây ☁️'}
          </button>
        </div>

        {/* Thống kê */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>Tổng giá trị</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', margin: '0.3rem 0' }}>{tongTien.toLocaleString('vi-VN')} ₫</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>Đã hoàn thành</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#48bb78', margin: '0.3rem 0' }}>{phanTram}%</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>Số ước mơ</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f6ad55', margin: '0.3rem 0' }}>{daHoanThanh}/{danhSach.length}</p>
            </div>
          </div>
          <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${phanTram}%`, background: 'linear-gradient(90deg, #48bb78, #38a169)', borderRadius: '5px', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Danh sách */}
        <div>
          {!Array.isArray(danhSach) || danhSach.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>Chưa có ước mơ nào... Viết điều đầu tiên! 🌟</p>
          ) : (
            danhSach.map((uocMo) => (
              <div key={uocMo._id} style={{ background: 'white', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', opacity: uocMo.hoanThanh ? 0.7 : 1, textDecoration: uocMo.hoanThanh ? 'line-through' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#2d3748' }}>
                      {uocMo.hoanThanh && '✅ '}{uocMo.noiDung}
                    </h4>
                    <p style={{ margin: '0.3rem 0', color: '#718096' }}>
                      {uocMo.mucTien > 0 ? `${Number(uocMo.mucTien).toLocaleString('vi-VN')} ₫` : 'Không đặt mục tiền'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0' }}>
                      📅 Tạo: {new Date(uocMo.ngayTao).toLocaleDateString('vi-VN')}
                      {uocMo.ngayHoanThanh && ` — ✅ Hoàn thành: ${new Date(uocMo.ngayHoanThanh).toLocaleDateString('vi-VN')}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.8rem' }}>
                    <button onClick={() => danhDauHoanThanh(uocMo._id)}
                      style={{ border: 'none', background: uocMo.hoanThanh ? '#f6e05e' : '#68d391', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem' }}>
                      {uocMo.hoanThanh ? '↩️' : '✓'}
                    </button>
                    <button onClick={() => xoaUocMo(uocMo._id)}
                      style={{ border: 'none', background: '#fc8181', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem' }}>
                      🗑️
                    </button>
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