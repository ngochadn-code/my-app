// ==============================================
// NGÀY 1: NÚT BIẾN HÌNH — Gặp Gỡ React 🎭
// ==============================================
import { useState } from 'react'

function App() {
  // Biến trạng thái — khi đổi → màn hình tự cập nhật! ✨
  const [mauNen, setMauNen] = useState('#87CEEB')
  const [noiDung, setNoiDung] = useState('Nhấn mình đi! 😊')
  const [dem, setDem] = useState(0)

  // Danh sách màu ngẫu nhiên 🎨
  const danhMau = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
    '#F38181', '#AA96DA', '#FCBAD3', '#87CEEB'
  ]

  const bamNut = () => {
    const mauNgauNhien = danhMau[Math.floor(Math.random() * danhMau.length)]
    setMauNen(mauNgauNhien)
    setDem(dem + 1)
    
    // Thay đổi lời nói theo số lần nhấn 💬
    const loiNhan = [
      'A! Đau hông 😳',
      'Lại nữa à 😤',
      'Ừ thì thôi 😌',
      'Bạn hay nhỉ 😄',
      'Đủ rồi đó 😘',
      'Yêu bạn lắm ❤️'
    ]
    setNoiDung(loiNhan[Math.min(dem, loiNhan.length - 1)])
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: mauNen,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui',
      transition: 'background 0.4s ease',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
        🎭 Nút Biến Hình Kìa!
      </h1>
      
      <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#222' }}>
        Đã nhấn: <strong style={{ fontSize: '1.5rem' }}>{dem}</strong> lần
      </p>

      <button
        onClick={bamNut}
        style={{
          padding: '20px 40px',
          fontSize: '1.3rem',
          border: 'none',
          borderRadius: '50px',
          background: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transform: 'scale(1)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        {noiDung} ✨
      </button>
    </div>
  )
}

export default App