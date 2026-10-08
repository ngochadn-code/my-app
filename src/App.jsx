import { useState, useEffect, useCallback, useMemo } from 'react'

const URL_SERVER = 'https://so-uoc-mo-server.onrender.com/api' // ✅ Đổi link của bạn!

function App() {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('token') } catch { return null }
  })
  const [tenDangNhap, setTenDangNhap] = useState(() => {
    try { return localStorage.getItem('tenDangNhap') || '' } catch { return '' }
  })
  const [chuDe, setChuDe] = useState(() => {
    try { return localStorage.getItem('chuDe') || 'tim' } catch { return 'tim' }
  })
  const [lanCapNhatCuoi, setLanCapNhatCuoi] = useState(Date.now())
  
  const [dangNhapForm, setDangNhapForm] = useState(true)
  const [tenDN, setTenDN] = useState('')
  const [matKhau, setMatKhau] = useState('')
  const [thongBao, setThongBao] = useState('')
  const [danhSachGoc, setDanhSachGoc] = useState([])
  const [danhSachHienThi, setDanhSachHienThi] = useState([])
  const [goiY, setGoiY] = useState([])
  const [thongKe, setThongKe] = useState(null)
  const [lichSu, setLichSu] = useState([])
  const [dangSua, setDangSua] = useState(null)
  const [noiDung, setNoiDung] = useState('')
  const [mucTien, setMucTien] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [ngayHen, setNgayHen] = useState('')
  const [doUuTien, setDoUuTien] = useState('binh')
  const [dangTai, setDangTai] = useState(false)
  const [boLoc, setBoLoc] = useState('tat-ca')
  const [tuKhoaTim, setTuKhoaTim] = useState('')
  const [tieuChiSapXep, setTieuChiSapXep] = useState('ngayTao')
  const [thuTuSapXep, setThuTuSapXep] = useState('giam')
  const [daSanSang, setDaSanSang] = useState(false)
  const [tabHienTai, setTabHienTai] = useState('danh-sach')
  const [danhSachLoi, setDanhSachLoi] = useState([])

  useEffect(() => { setDaSanSang(true) }, [])

  // === 📋 LỌC & SẮP XẾP DỮ LIỆU HIỂN THỊ ===
  useEffect(() => {
    if (!Array.isArray(danhSachGoc)) return
    
    let ketQua = [...danhSachGoc]
    
    // Lọc theo từ khóa
    if (tuKhoaTim.trim()) {
      const tu = tuKhoaTim.toLowerCase()
      ketQua = ketQua.filter(u =>
        u.noiDung?.toLowerCase().includes(tu) ||
        u.ghiChu?.toLowerCase().includes(tu)
      )
    }
    
    // Lọc theo trạng thái
    if (boLoc === 'da-hoan-thanh') {
      ketQua = ketQua.filter(u => u.hoanThanh)
    } else if (boLoc === 'chua-hoan-thanh') {
      ketQua = ketQua.filter(u => !u.hoanThanh)
    } else if (boLoc === 'cao-uu-tien') {
      ketQua = ketQua.filter(u => u.doUuTien === 'cao')
    } else if (boLoc === 'sap-den-han') {
      const hienTai = new Date()
      const tuanSau = new Date(hienTai.getTime() + 7 * 24 * 60 * 60 * 1000)
      ketQua = ketQua.filter(u => {
        if (!u.ngayHen || u.hoanThanh) return false
        const ngay = new Date(u.ngayHen)
        return ngay >= hienTai && ngay <= tuanSau
      })
    }
    
    // Sắp xếp
    ketQua.sort((a, b) => {
      let giaTriA, giaTriB
      if (tieuChiSapXep === 'mucTien') {
        giaTriA = Number(a.mucTien) || 0
        giaTriB = Number(b.mucTien) || 0
      } else if (tieuChiSapXep === 'doUuTien') {
        const cap = { thap: 1, binh: 2, cao: 3 }
        giaTriA = cap[a.doUuTien] || 2
        giaTriB = cap[b.doUuTien] || 2
      } else {
        giaTriA = new Date(a.ngayTao || 0)
        giaTriB = new Date(b.ngayTao || 0)
      }
      
      if (giaTriA < giaTriB) return thuTuSapXep === 'tang' ? -1 : 1
      if (giaTriA > giaTriB) return thuTuSapXep === 'tang' ? 1 : -1
      return 0
    })
    
    setDanhSachHienThi(ketQua)
  }, [danhSachGoc, boLoc, tuKhoaTim, tieuChiSapXep, thuTuSapXep])

  const taiLaiTatCa = useCallback(async () => {
    if (!token) return
    await Promise.all([layDanhSach(), layThongKe(), layGoiY(), layLichSu()])
    setLanCapNhatCuoi(Date.now())
    setDanhSachLoi([])
  }, [token])

  useEffect(() => {
    if (token && daSanSang) {
      taiLaiTatCa()
      const kiemTra = setInterval(async () => {
        try {
          const phanHoi = await fetch(`${URL_SERVER}/kiem-tra-thay-doi?lanCuoi=${lanCapNhatCuoi}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const duLieu = await phanHoi.json()
          if (duLieu.coThayDoi) {
            await taiLaiTatCa()
            setThongBao('🔄 Có cập nhật mới! Dữ liệu đã làm mới ✅')
          }
        } catch {}
      }, 30000)
      return () => clearInterval(kiemTra)
    }
  }, [token, daSanSang, lanCapNhatCuoi, taiLaiTatCa])

  useEffect(() => {
    try { localStorage.setItem('chuDe', chuDe) } catch {}
  }, [chuDe])

  const layDanhSach = async () => {
    if (!token) return
    try {
      const phanHoi = await fetch(`${URL_SERVER}/uoc-mo`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const duLieu = await phanHoi.json()
      if (Array.isArray(duLieu)) {
        setDanhSachGoc(duLieu)
      } else {
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('tenDangNhap')
        setThongBao('Phiên hết hạn, vui lòng đăng nhập lại 🔄')
      }
    } catch {
      setThongBao('Lỗi kết nối Server! 😅')
    }
  }

  const layThongKe = async () => {
    try {
      const phanHoi = await fetch(`${URL_SERVER}/thong-ke/chi-tiet`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const duLieu = await phanHoi.json()
      if (!duLieu.loi) setThongKe(duLieu)
    } catch {}
  }

  const layGoiY = async () => {
    try {
      const phanHoi = await fetch(`${URL_SERVER}/goi-y/ngau-nhien`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const duLieu = await phanHoi.json()
      if (Array.isArray(duLieu)) setGoiY(duLieu)
    } catch {}
  }

  const layLichSu = async () => {
    try {
      const phanHoi = await fetch(`${URL_SERVER}/lich-su`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const duLieu = await phanHoi.json()
      if (Array.isArray(duLieu)) setLichSu(duLieu)
    } catch {}
  }

  const kiemTraDuLieu = async () => {
    try {
      const phanHoi = await fetch(`${URL_SERVER}/kiem-tra-dulieu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ noiDung, mucTien: Number(mucTien) || 0, ngayHen })
      })
      const kq = await phanHoi.json()
      if (!kq.hopLe) {
        setDanhSachLoi(kq.loi || ['Dữ liệu không hợp lệ!'])
        return false
      }
      setDanhSachLoi([])
      return true
    } catch {
      return true
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
        setTenDN(''); setMatKhau('')
      } else if (ketQua.thanhCong) {
        setThongBao('Đăng ký thành công! Đăng nhập nhé! 🚀')
        setDangNhapForm(true)
      } else {
        setThongBao(ketQua.loi || 'Lỗi không xác định 😅')
      }
    } catch {
      setThongBao('Lỗi kết nối! Kiểm tra Server nhé 😅')
    } finally {
      setDangTai(false)
    }
  }

  const dangXuat = () => {
    setToken(null); setTenDangNhap(''); setDanhSachGoc([]); setThongKe(null); setLichSu([])
    try { localStorage.removeItem('token'); localStorage.removeItem('tenDangNhap') } catch {}
    setThongBao('Tạm biệt! Hẹn gặp lại 👋')
  }

  const layLinkChiaSe = () => {
    try {
      const phanTach = token.split('.')[1]
      const giaiMa = JSON.parse(atob(phanTach))
      const link = `${URL_SERVER.replace('/api', '')}/chia-se/${giaiMa.nguoiDungId}`
      navigator.clipboard.writeText(link)
        .then(() => setThongBao('📋 Đã sao chép link! Gửi bạn bè nhé 💫'))
        .catch(() => setThongBao('Link: ' + link + ' — sao chép tay nhé'))
    } catch { setThongBao('Lỗi tạo link! 😅') }
  }

  const themTuGoiY = (g) => {
    setDangSua(null)
    setNoiDung(g.noiDung)
    setMucTien(g.mucTien?.toString() || '')
    setGhiChu(g.ghiChu || '')
    setNgayHen('')
    setDoUuTien('binh')
    setDanhSachLoi([])
  }

  const batDauSua = (u) => {
    setDangSua(u._id)
    setNoiDung(u.noiDung)
    setMucTien((u.mucTien || 0).toString())
    setGhiChu(u.ghiChu || '')
    setNgayHen(u.ngayHen ? new Date(u.ngayHen).toISOString().split('T')[0] : '')
    setDoUuTien(u.doUuTien || 'binh')
    setTabHienTai('danh-sach')
    setDanhSachLoi([])
  }

  const huySua = () => {
    setDangSua(null)
    setNoiDung(''); setMucTien(''); setGhiChu(''); setNgayHen(''); setDoUuTien('binh')
    setDanhSachLoi([])
  }

  const luuUocMo = async () => {
    if (!noiDung.trim()) return setThongBao('Nhập nội dung nhé! 💫')
    
    const hopLe = await kiemTraDuLieu()
    if (!hopLe) return
    
    setDangTai(true)
    try {
      let phanHoi
      if (dangSua) {
        phanHoi = await fetch(`${URL_SERVER}/uoc-mo/${dangSua}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ noiDung, mucTien: Number(mucTien) || 0, ghiChu, ngayHen, doUuTien })
        })
      } else {
        phanHoi = await fetch(`${URL_SERVER}/uoc-mo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ noiDung, mucTien: Number(mucTien) || 0, ghiChu, ngayHen, doUuTien })
        })
      }
      const ketQua = await phanHoi.json()
      if (ketQua.loi) return setThongBao(ketQua.loi)
      
      huySua()
      await taiLaiTatCa()
      setThongBao(dangSua ? '✅ Đã cập nhật!' : '✅ Đã lưu lên đám mây! ☁️')
    } catch {
      setThongBao('Lỗi lưu! 😅')
    } finally {
      setDangTai(false)
    }
  }

  const danhDauHoanThanh = async (id, trangThai = true) => {
    try {
      await fetch(`${URL_SERVER}/uoc-mo/${id}/hoan-thanh`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ hoanThanh: trangThai })
      })
      await taiLaiTatCa()
      setThongBao(trangThai ? '🎉 Chúc mừng hoàn thành!' : '↩️ Đã mở lại!')
    } catch { setThongBao('Lỗi cập nhật! 😅') }
  }

  const xoaUocMo = async (id) => {
    if (!window.confirm('Chắc chắn xóa? 🗑️ Không thể hoàn tác!')) return
    try {
      await fetch(`${URL_SERVER}/uoc-mo/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (dangSua === id) huySua()
      await taiLaiTatCa()
      setThongBao('🗑️ Đã xóa!')
    } catch { setThongBao('Lỗi xóa! 😅') }
  }

  const xuatDuLieu = async () => {
    try {
      const phanHoi = await fetch(`${URL_SERVER}/xuat-du-lieu`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const duLieu = await phanHoi.json()
      if (duLieu.loi) return setThongBao('Lỗi xuất: ' + duLieu.loi)
      
      const blob = new Blob([JSON.stringify(duLieu, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `so-uoc-mo-${new Date().toISOString().slice(0,10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setThongBao('📤 Đã tải JSON về máy! ✅')
    } catch { setThongBao('Lỗi xuất dữ liệu! 😅') }
  }

  const xuatCSV = async () => {
    try {
      const phanHoi = await fetch(`${URL_SERVER}/xuat-csv`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const blob = await phanHoi.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `so-uoc-mo-${new Date().toISOString().slice(0,10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setThongBao('📊 Đã tải CSV — mở trong Excel được ngay! ✅')
    } catch { setThongBao('Lỗi xuất CSV! 😅') }
  }

  const tongTien = useMemo(() => 
    danhSachGoc.reduce((t, i) => t + (Number(i.mucTien) || 0), 0),
    [danhSachGoc]
  )
  const daHoanThanh = useMemo(() => 
    danhSachGoc.filter(i => i.hoanThanh).length,
    [danhSachGoc]
  )
  const tongTienHT = useMemo(() => 
    danhSachGoc.filter(i => i.hoanThanh).reduce((t, i) => t + (Number(i.mucTien) || 0), 0),
    [danhSachGoc]
  )
  const phanTram = tongTien > 0 ? Math.round((tongTienHT / tongTien) * 100) : 0

  const chuDeMau = {
    tim: { nen: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', nut: '#667eea' },
    xanh: { nen: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', nut: '#11998e' },
    cam: { nen: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', nut: '#f5576c' }
  }[chuDe]

  if (!daSanSang) return <div style={{minHeight:'100vh',background:chuDeMau.nen,display:'flex',alignItems:'center',justifyContent:'center'}}><h2 style={{color:'white'}}>Đang khởi tạo... ⏳</h2></div>

  if (!token) {
    return (
      <div style={{minHeight:'100vh',background:chuDeMau.nen,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
        <div style={{background:'white',borderRadius:'20px',padding:'2rem',maxWidth:'400px',width:'100%',boxShadow:'0 15px 40px rgba(0,0,0,0.2)'}}>
          <h1 style={{textAlign:'center',color:'#4a5568',marginBottom:'0.5rem'}}>✨ Sổ Ước Mơ ✨</h1>
          <p style={{textAlign:'center',color:'#718096',marginBottom:'1.5rem'}}>{dangNhapForm?'Đăng nhập để theo dõi ước mơ':'Tạo tài khoản riêng của bạn'}</p>
          <div style={{display:'flex',marginBottom:'1.5rem'}}>
            <button onClick={()=>{setDangNhapForm(true);setThongBao('')}} style={{flex:1,padding:'0.8rem',border:'none',background:dangNhapForm?'#667eea':'#e2e8f0',color:dangNhapForm?'white':'#4a5568',borderRadius:'8px 0 0 8px',fontWeight:'bold',cursor:'pointer'}}>Đăng Nhập</button>
            <button onClick={()=>{setDangNhapForm(false);setThongBao('')}} style={{flex:1,padding:'0.8rem',border:'none',background:!dangNhapForm?'#667eea':'#e2e8f0',color:!dangNhapForm?'white':'#4a5568',borderRadius:'0 8px 8px 0',fontWeight:'bold',cursor:'pointer'}}>Đăng Ký</button>
          </div>
          {thongBao&&<p style={{color:thongBao.includes('thành công')?'#48bb78':'#e53e3e',textAlign:'center',marginBottom:'1rem'}}>{thongBao}</p>}
          <input type="text" placeholder="Tên đăng nhập" value={tenDN} onChange={(e)=>setTenDN(e.target.value)} style={{width:'100%',padding:'0.9rem',marginBottom:'1rem',borderRadius:'8px',border:'2px solid #e2e8f0'}} />
          <input type="password" placeholder="Mật khẩu (≥ 6 ký tự)" value={matKhau} onChange={(e)=>setMatKhau(e.target.value)} style={{width:'100%',padding:'0.9rem',marginBottom:'1.5rem',borderRadius:'8px',border:'2px solid #e2e8f0'}} />
          <button onClick={xuLyDangNhap} disabled={dangTai} style={{width:'100%',padding:'1rem',background:dangTai?'#cbd5e0':chuDeMau.nen,color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:dangTai?'not-allowed':'pointer'}}>{dangTai?'⏳ Đang xử lý...':(dangNhapForm?'🚀 Đăng Nhập':'✨ Tạo Tài Khoản')}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:chuDeMau.nen,padding:'1rem',fontFamily:'system-ui'}}>
      <div style={{maxWidth:'600px',margin:'0 auto'}}>
        {/* === Đầu trang === */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'0.5rem'}}>
          <h1 style={{color:'white',fontSize:'1.4rem',margin:0}}>✨ Sổ Ước Mơ</h1>
          <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
            {['tim','xanh','cam'].map(c=>(
              <button key={c} onClick={()=>setChuDe(c)} style={{width:'26px',height:'26px',borderRadius:'50%',border:chuDe===c?'2px solid white':'none',background:chuDeMau.nen,cursor:'pointer',padding:0}} title="Đổi màu" />
            ))}
            <span style={{color:'white',fontSize:'0.85rem',marginLeft:'0.5rem'}}>👤 {tenDangNhap}</span>
            <button onClick={layLinkChiaSe} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'0.4rem 0.5rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.8rem'}}>📤 Chia sẻ</button>
            <button onClick={dangXuat} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'0.4rem 0.5rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.8rem'}}>Thoát</button>
          </div>
        </div>

        {thongBao&&<p style={{background:thongBao.includes('Lỗi')||thongBao.includes('sai')?'#fff5f5':'#f0fff4',color:thongBao.includes('Lỗi')||thongBao.includes('sai')?'#c53030':'#276749',padding:'0.8rem',borderRadius:'10px',textAlign:'center',marginBottom:'1rem'}}>{thongBao}</p>}

        {/* === Tab điều hướng === */}
        <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
          {[{k:'danh-sach',t:'📋 Danh sách'},{k:'thong-ke',t:'📊 Thống kê'},{k:'lich-su',t:'🕐 Lịch sử'},{k:'huong-dan',t:'📖 Hướng dẫn'}].map(tab=>(
            <button key={tab.k} onClick={()=>setTabHienTai(tab.k)} style={{flex:1,minWidth:'100px',padding:'0.7rem',border:'none',borderRadius:'10px',background:tabHienTai===tab.k?'white':'rgba(255,255,255,0.2)',color:tabHienTai===tab.k?chuDeMau.nut:'white',fontWeight:tabHienTai===tab.k?'bold':'normal',cursor:'pointer',fontSize:'0.85rem'}}>{tab.t}</button>
          ))}
        </div>

        {/* === Tab: Danh sách === */}
        {tabHienTai === 'danh-sach' && (
          <>
            {/* 🔍 Tìm kiếm */}
            <div style={{marginBottom:'1rem'}}>
              <input 
                type="text" 
                placeholder="🔍 Tìm kiếm theo nội dung, ghi chú..." 
                value={tuKhoaTim} 
                onChange={(e)=>setTuKhoaTim(e.target.value)} 
                style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'none',fontSize:'0.95rem'}} 
              />
            </div>

            {/* Bộ lọc */}
            <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap'}}>
              {[{k:'tat-ca',t:'Tất cả'},{k:'chua-hoan-thanh',t:'⏳ Chưa xong'},{k:'da-hoan-thanh',t:'✅ Đã xong'},{k:'cao-uu-tien',t:'⭐ Ưu tiên cao'},{k:'sap-den-han',t:'🔔 Sắp đến hạn'}].map(b=>(
                <button key={b.k} onClick={()=>setBoLoc(b.k)} style={{padding:'0.5rem 0.9rem',border:'none',borderRadius:'20px',background:boLoc===b.k?'white':'rgba(255,255,255,0.2)',color:boLoc===b.k?chuDeMau.nut:'white',cursor:'pointer',fontSize:'0.85rem',fontWeight:boLoc===b.k?'bold':'normal'}}>{b.t}</button>
              ))}
            </div>

            {/* 📅 Sắp xếp */}
            <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem',alignItems:'center',flexWrap:'wrap'}}>
              <span style={{color:'white',fontSize:'0.85rem'}}>Sắp xếp:</span>
              {[{k:'ngayTao',t:'Ngày tạo'},{k:'mucTien',t:'Số tiền'},{k:'doUuTien',t:'Độ ưu tiên'}].map(s=>(
                <button key={s.k} onClick={()=>setTieuChiSapXep(s.k)} style={{padding:'0.4rem 0.7rem',border:'none',borderRadius:'15px',background:tieuChiSapXep===s.k?'white':'rgba(255,255,255,0.2)',color:tieuChiSapXep===s.k?chuDeMau.nut:'white',cursor:'pointer',fontSize:'0.8rem'}}>{s.t}</button>
              ))}
              <button onClick={()=>setThuTuSapXep(thuTuSapXep==='tang'?'giam':'tang')} style={{padding:'0.4rem 0.7rem',border:'none',borderRadius:'15px',background:'rgba(255,255,255,0.2)',color:'white',cursor:'pointer',fontSize:'0.8rem'}}>
                {thuTuSapXep==='tang'?'⬆️ Tăng':'⬇️ Giảm'}
              </button>
            </div>

            {thongKe && thongKe.sapDenHan > 0 && boLoc === 'tat-ca' && !tuKhoaTim && (
              <div style={{background:'#fff3cd',border:'1px solid #ffc107',borderRadius:'10px',padding:'0.8rem',marginBottom:'1rem',color:'#856404'}}>
                ⏰ <strong>{thongKe.sapDenHan}</strong> ước mơ sắp đến hạn trong tuần này!
              </div>
            )}

            {boLoc === 'tat-ca' && !dangSua && !tuKhoaTim && goiY.length > 0 && (
              <div style={{background:'rgba(255,255,255,0.15)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
                <p style={{color:'white',margin:'0 0 0.5rem 0',fontWeight:'bold'}}>💡 Gợi ý cho bạn:</p>
                {goiY.map((g,i)=>(
                  <button key={i} onClick={()=>themTuGoiY(g)} style={{width:'100%',textAlign:'left',background:'white',border:'none',borderRadius:'8px',padding:'0.7rem',marginBottom:'0.4rem',cursor:'pointer',fontSize:'0.9rem',color:'#2d3748'}}>
                    {g.noiDung} {g.mucTien>0&&`— ${g.mucTien.toLocaleString('vi-VN')} ₫`}
                  </button>
                ))}
                <button onClick={layGoiY} style={{color:'white',background:'none',border:'none',cursor:'pointer',fontSize:'0.85rem',marginTop:'0.3rem'}}>🔄 Gợi ý khác</button>
              </div>
            )}

            {danhSachLoi.length > 0 && (
              <div style={{background:'#fff5f5',border:'1px solid #feb2b2',borderRadius:'10px',padding:'0.8rem',marginBottom:'1rem',color:'#c53030'}}>
                {danhSachLoi.map((l,i)=>(<p key={i} style={{margin:'0.2rem 0'}}>⚠️ {l}</p>))}
              </div>
            )}

            <div style={{background:'white',borderRadius:'16px',padding:'1.3rem',marginBottom:'1.3rem',boxShadow:'0 10px 30px rgba(0,0,0,0.15)'}}>
              <h3 style={{marginTop:0,color:'#4a5568',fontSize:'1rem'}}>
                {dangSua ? '✏️ Chỉnh sửa ước mơ' : 'Thêm ước mơ mới 💫'}
              </h3>
              <input type="text" placeholder="Bạn muốn điều gì? (3-200 ký tự)" value={noiDung} onChange={(e)=>setNoiDung(e.target.value)} style={{width:'100%',padding:'0.7rem',margin:'0.4rem 0',borderRadius:'8px',border:danhSachLoi.some(l=>l.includes('Nội dung'))?'2px solid #fc8181':'2px solid #e2e8f0'}} />
              <input type="number" placeholder="Cần bao nhiêu tiền?" value={mucTien} onChange={(e)=>setMucTien(e.target.value)} style={{width:'100%',padding:'0.7rem',margin:'0.4rem 0',borderRadius:'8px',border:'2px solid #e2e8f0'}} />
              <input type="text" placeholder="Ghi chú (tùy chọn)" value={ghiChu} onChange={(e)=>setGhiChu(e.target.value)} style={{width:'100%',padding:'0.7rem',margin:'0.4rem 0',borderRadius:'8px',border:'2px solid #e2e8f0'}} />
              <div style={{display:'flex',gap:'0.5rem',margin:'0.4rem 0',flexWrap:'wrap'}}>
                <input type="date" value={ngayHen} onChange={(e)=>setNgayHen(e.target.value)} style={{flex:1,minWidth:'140px',padding:'0.7rem',borderRadius:'8px',border:danhSachLoi.some(l=>l.includes('Ngày'))?'2px solid #fc8181':'2px solid #e2e8f0'}} />
                <select value={doUuTien} onChange={(e)=>setDoUuTien(e.target.value)} style={{flex:1,minWidth:'140px',padding:'0.7rem',borderRadius:'8px',border:'2px solid #e2e8f0'}}>
                  <option value="thap">🔵 Thấp</option>
                  <option value="binh">🟢 Bình thường</option>
                  <option value="cao">🔴 Ưu tiên cao</option>
                </select>
              </div>
              <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
                <button onClick={luuUocMo} disabled={dangTai} style={{flex:2,padding:'0.85rem',background:dangTai?'#cbd5e0':chuDeMau.nen,color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:dangTai?'not-allowed':'pointer'}}>
                  {dangTai?'☁️ Đang lưu...':(dangSua?'💾 Cập nhật':'☁️ Lưu Lên Đám Mây')}
                </button>
                {dangSua && (
                  <button onClick={huySua} style={{flex:1,padding:'0.85rem',background:'#e2e8f0',color:'#4a5568',border:'none',borderRadius:'8px',cursor:'pointer'}}>Hủy</button>
                )}
              </div>
            </div>

            <div style={{background:'white',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-around',flexWrap:'wrap',gap:'0.5rem'}}>
                <div style={{textAlign:'center'}}><p style={{margin:0,color:'#718096',fontSize:'0.8rem'}}>Tổng giá trị</p><p style={{fontSize:'1.2rem',fontWeight:'bold',color:'#667eea'}}>{tongTien.toLocaleString('vi-VN')} ₫</p></div>
                <div style={{textAlign:'center'}}><p style={{margin:0,color:'#718096',fontSize:'0.8rem'}}>Đã hoàn thành</p><p style={{fontSize:'1.2rem',fontWeight:'bold',color:'#48bb78'}}>{phanTram}%</p></div>
                <div style={{textAlign:'center'}}><p style={{margin:0,color:'#718096',fontSize:'0.8rem'}}>Hiện thị</p><p style={{fontSize:'1.2rem',fontWeight:'bold',color:'#f6ad55'}}>{danhSachHienThi.length}/{danhSachGoc.length}</p></div>
              </div>
              <div style={{height:'8px',background:'#e2e8f0',borderRadius:'4px',marginTop:'0.8rem',overflow:'hidden'}}><div style={{height:'100%',width:`${phanTram}%`,background:'linear-gradient(90deg,#48bb78,#38a169)',borderRadius:'4px',transition:'width 0.5s ease'}} /></div>
            </div>

            <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}>
              <button onClick={xuatDuLieu} style={{flex:1,padding:'0.8rem',background:'white',color:'#4a5568',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>📤 Xuất JSON</button>
              <button onClick={xuatCSV} style={{flex:1,padding:'0.8rem',background:'white',color:'#4a5568',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>📊 Xuất CSV/Excel</button>
            </div>

            <div>
              {danhSachHienThi.length===0?(
                <p style={{textAlign:'center',color:'white',fontSize:'1rem'}}>
                  {tuKhoaTim||boLoc!=='tat-ca'?'Không tìm thấy kết quả nào 🔍':'Chưa có gì... Nhấn gợi ý để bắt đầu! 🌟'}
                </p>
              ):(
                danhSachHienThi.map(u=>(
                  <div key={u._id} style={{background:'white',borderRadius:'12px',padding:'0.9rem',marginBottom:'0.7rem',opacity:u.hoanThanh?0.7:1,border:dangSua===u._id?'2px solid #667eea':'none'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div style={{flex:1,cursor:'pointer'}} onClick={()=>batDauSua(u)}>
                        <h4 style={{margin:0,fontSize:'0.95rem',color:'#2d3748'}}>{u.hoanThanh&&'✅ '}{u.noiDung}</h4>
                        {u.ghiChu&&<p style={{margin:'0.2rem 0',fontSize:'0.8rem',color:'#718096',fontStyle:'italic'}}>"{u.ghiChu}"</p>}
                        <p style={{margin:'0.3rem 0',color:'#667eea',fontWeight:'bold'}}>{Number(u.mucTien||0).toLocaleString('vi-VN')} ₫</p>
                        <p style={{margin:0,fontSize:'0.75rem',color:'#a0aec0'}}>
                          {u.doUuTien==='cao'&&'⭐ '}
                          {u.ngayHen?`Đến hạn: ${new Date(u.ngayHen).toLocaleDateString('vi-VN')}`:`Tạo: ${new Date(u.ngayTao).toLocaleDateString('vi-VN')}`}
                        </p>
                      </div>
                      <div style={{display:'flex',gap:'0.3rem',marginLeft:'0.5rem'}}>
                        <button onClick={()=>danhDauHoanThanh(u._id,!u.hoanThanh)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1rem'}} title={u.hoanThanh?'Mở lại':'Đánh dấu xong'}>{u.hoanThanh?'↩️':'✅'}</button>
                        <button onClick={()=>batDauSua(u)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1rem'}} title="Sửa">✏️</button>
                        <button onClick={()=>xoaUocMo(u._id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1rem'}} title="Xóa">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* === Tab: Thống kê === */}
        {tabHienTai === 'thong-ke' && (
          <div style={{background:'white',borderRadius:'16px',padding:'1.5rem'}}>
            <h2 style={{textAlign:'center',color:'#4a5568',marginTop:0}}>📊 Thống kê Tổng quan</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'1rem',margin:'1.5rem 0'}}>
              <div style={{textAlign:'center',padding:'1rem',background:'#f7fafc',borderRadius:'12px'}}>
                <p style={{margin:0,color:'#718096'}}>Tổng ước mơ</p>
                <p style={{fontSize:'1.5rem',fontWeight:'bold',color:'#667eea'}}>{danhSachGoc.length}</p>
              </div>
              <div style={{textAlign:'center',padding:'1rem',background:'#f0fff4',borderRadius:'12px'}}>
                <p style={{margin:0,color:'#718096'}}>Đã hoàn thành</p>
                <p style={{fontSize:'1.5rem',fontWeight:'bold',color:'#48bb78'}}>{daHoanThanh}</p>
              </div>
              <div style={{textAlign:'center',padding:'1rem',background:'#fffaf0',borderRadius:'12px'}}>
                <p style={{margin:0,color:'#718096'}}>Tổng giá trị</p>
                <p style={{fontSize:'1.2rem',fontWeight:'bold',color:'#ed8936'}}>{tongTien.toLocaleString('vi-VN')} ₫</p>
              </div>
              <div style={{textAlign:'center',padding:'1rem',background:'#ebf8ff',borderRadius:'12px'}}>
                <p style={{margin:0,color:'#718096'}}>Đạt được</p>
                <p style={{fontSize:'1.2rem',fontWeight:'bold',color:'#3182ce'}}>{tongTienHT.toLocaleString('vi-VN')} ₫</p>
              </div>
            </div>
            <div style={{margin:'1.5rem 0'}}>
              <p style={{textAlign:'center',fontWeight:'bold',color:'#4a5568'}}>Tiến độ tổng thể: {phanTram}%</p>
              <div style={{height:'20px',background:'#e2e8f0',borderRadius:'10px',overflow:'hidden',marginTop:'0.5rem'}}>
                <div style={{height:'100%',width:`${phanTram}%`,background:'linear-gradient(90deg,#48bb78,#38a169)',borderRadius:'10px',transition:'width 0.5s ease'}} />
              </div>
            </div>
            {thongKe && (
              <div style={{marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid #e2e8f0'}}>
                <p style={{color:'#4a5568'}}>📅 Sắp đến hạn: <strong>{thongKe.sapDenHan || 0}</strong></p>
                <p style={{color:'#4a5568'}}>⭐ Ưu tiên cao: <strong>{thongKe.uuTienCao || 0}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* === Tab: Lịch sử === */}
        {tabHienTai === 'lich-su' && (
          <div style={{background:'white',borderRadius:'16px',padding:'1.5rem'}}>
            <h2 style={{textAlign:'center',color:'#4a5568',marginTop:0}}>🕐 Lịch sử hoạt động</h2>
            {lichSu.length === 0 ? (
              <p style={{textAlign:'center',color:'#718096',padding:'2rem'}}>Chưa có hoạt động nào. Bắt đầu thêm ước mơ nhé! ✨</p>
            ) : (
              lichSu.map((ls,i)=>(
                <div key={i} style={{padding:'0.8rem 0',borderBottom:'1px solid #e2e8f0'}}>
                  <p style={{margin:0,color:'#2d3748'}}>{ls.hanhDong}</p>
                  <p style={{margin:'0.2rem 0 0 0',fontSize:'0.8rem',color:'#a0aec0'}}>{new Date(ls.ngayTao).toLocaleString('vi-VN')}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* === Tab: Hướng dẫn === */}
        {tabHienTai === 'huong-dan' && (
          <div style={{background:'white',borderRadius:'16px',padding:'1.5rem'}}>
            <h2 style={{textAlign:'center',color:'#4a5568',marginTop:0}}>📖 Hướng dẫn sử dụng</h2>
            <ul style={{color:'#4a5568',lineHeight:'1.8rem',paddingLeft:'1rem'}}>
              <li>💡 Nhấn <strong>"Gợi ý khác"</strong> để có thêm ý tưởng mới</li>
              <li>🔍 Gõ chữ ô tìm kiếm để lọc nhanh danh sách</li>
              <li>📊 Tab Thống kê xem tổng quan tiến độ</li>
              <li>📤 Xuất dữ liệu ra JSON/CSV để lưu trữ hoặc mở trong Excel</li>
              <li>🎨 Nhấn các vòng tròn màu trên cùng để đổi giao diện</li>
              <li>📋 Nhấn <strong>Chia sẻ</strong> để gửi tiến độ cho người thân</li>
              <li>✏️ Nhấn vào nội dung bất kỳ để chỉnh sửa</li>
              <li>☁️ Dữ liệu tự động đồng bộ trên mọi thiết bị</li>
            </ul>
            <p style={{textAlign:'center',marginTop:'2rem',color:'#667eea',fontWeight:'bold'}}>
              💻 Xây dựng trên máy i3 + 4GB RAM — chứng minh đam mê không cần máy mạnh!