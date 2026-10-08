import { useState, useEffect } from 'react'

// === KẾT NỐI VỚI SERVER ===
const URL_SERVER = = 'https://so-uoc-mo-server.onrender.com/api/uoc-mo'

function App() {
  const [danhSach, setDanhSach] = useState([])
  const [noiDung, setNoiDung] = useState('')
  const [mucTien, setMucTien] = useState('')
  const [dangTai, setDangTai] = useState(false)

  // === LẤY DỮ LIỆU KHI MỞ TRANG ===
  useEffect(() => {
    layDanhSach()
  }, [])

  const layDanhSach = async () => {
    try {
      const phanHoi = await fetch(URL_SERVER)
      const duLieu = await phanHoi.json()
      setDanhSach(duLieu)
    } catch (loi) {
      console.log('❌ Lỗi lấy dữ liệu:', loi)
    }
  }

  // === THÊM ƯỚC MƠ MỚI ===
  const themUocMo = async () => {
    if (!noiDung.trim()) return alert('Nhập nội dung ước mơ nhé! 💫')
    
    setDangTai(true)
    try {
      await fetch(URL_SERVER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noiDung,
          mucTien: Number(mucTien) || 0
        })
      })
      
      setNoiDung('')
      setMucTien('')
      await layDanhSach() // Tải lại danh sách
    } catch (loi) {
      alert('❌ Lỗi lưu: ' + loi.message)
    } finally {
      setDangTai(false)
    }
  }

  // === ĐÁNH DẤU HOÀN THÀNH ===
  const danhDauHoanThanh = async (id, trangThai) => {
    try {
      await fetch(`${URL_SERVER}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoanThanh: !trangThai })
      })
      await layDanhSach()
    } catch (loi) {
      console.log('❌ Lỗi cập nhật:', loi)
    }
  }

  // === XÓA ƯỚC MƠ ===
  const xoaUocMo = async (id) => {
    if (!confirm('Chắc chắn xóa? 🗑️')) return
    try {
      await fetch(`${URL_SERVER}/${id}`, { method: 'DELETE' })
      await layDanhSach()
    } catch (loi) {
      alert('❌ Lỗi xóa: ' + loi.message)
    }
  }

  // === TÍNH TỔNG TIỀN ===
  const tongTien = danhSach.reduce((tong, item) => tong + (item.mucTien || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: 'white', fontSize: '2.5rem', marginBottom: '2rem' }}>
          ✨ Sổ Ước Mơ Của Tôi ✨
        </h1>

        {/* === FORM NHẬP === */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginTop: 0, color: '#4a5568' }}>Thêm ước mơ mới 💫</h3>
          
          <input
            type="text"
            placeholder="Bạn muốn điều gì?"
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }}
          />
          
          <input
            type="number"
            placeholder="Cần bao nhiêu tiền (đồng)?"
            value={mucTien}
            onChange={(e) => setMucTien(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }}
          />
          
          <button
            onClick={themUocMo}
            disabled={dangTai}
            style={{
              width: '100%',
              padding: '0.9rem',
              marginTop: '1rem',
              background: dangTai ? '#cbd5e0' : 'linear-gradient(90deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: dangTai ? 'not-allowed' : 'pointer'
            }}
          >
            {dangTai ? 'Đang lưu... ☁️' : 'Lưu Lên Đám Mây ☁️'}
          </button>
        </div>

        {/* === TỔNG KẾT === */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#718096' }}>Tổng giá trị ước mơ</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#667eea', margin: '0.5rem 0' }}>
            {tongTien.toLocaleString('vi-VN')} ₫
          </p>
        </div>

        {/* === DANH SÁCH === */}
        <div>
          {danhSach.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
              Chưa có ước mơ nào... Hãy viết điều mong muốn đầu tiên! 🌟
            </p>
          ) : (
            danhSach.map((uocMo) => (
              <div
                key={uocMo._id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.2rem',
                  marginBottom: '1rem',
                  opacity: uocMo.hoanThanh ? 0.7 : 1,
                  textDecoration: uocMo.hoanThanh ? 'line-through' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#2d3748' }}>
                      {uocMo.hoanThanh && '✅ '}{uocMo.noiDung}
                    </h4>
                    <p style={{ margin: '0.3rem 0 0 0', color: '#718096' }}>
                      {uocMo.mucTien > 0 ? `${uocMo.mucTien.toLocaleString('vi-VN')} ₫` : 'Không đặt mục tiền'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => danhDauHoanThanh(uocMo._id, uocMo.hoanThanh)}
                      style={{
                        border: 'none',
                        background: uocMo.hoanThanh ? '#f6e05e' : '#68d391',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                      title={uocMo.hoanThanh ? 'Chưa xong' : 'Đã xong!'}
                    >
                      {uocMo.hoanThanh ? '↩️' : '✓'}
                    </button>
                    <button
                      onClick={() => xoaUocMo(uocMo._id)}
                      style={{
                        border: 'none',
                        background: '#fc8181',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                      title="Xóa"
                    >
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