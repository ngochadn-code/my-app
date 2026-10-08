import { useState, useEffect, useCallback } from 'react'

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
  const [danhSach, setDanhSach] = useState([])
  const [goiY, setGoiY] = useState([])
  const [thongKe, setThongKe] = useState(null)
  const [lichSu, setLichSu] = useState([])
  const [dangSua, setDangSua] = useState(null) // id đang sửa
  const [noiDung, setNoiDung] = useState('')
  const [mucTien, setMucTien] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [ngayHen, setNgayHen] = useState('')
  const [doUuTien, setDoUuTien] = useState('binh')
  const [dangTai, setDangTai] = useState(false)
  const [boLoc, setBoLoc] = useState('tat-ca')
  const [daSanSang, setDaSanSang] = useState(false)
  const [tabHienTai, setTabHienTai] = useState('danh-sach')

  useEffect(() => { setDaSanSang(true) }, [])

  const taiLaiTatCa = useCallback(async () => {
    if (!token) return
    await Promise.all([layDanhSach(), layThongKe(), layGoiY(), layLichSu()])
    setLanCapNhatCuoi(Date.now())
  }, [token, boLoc])

  useEffect(() => {
    if (token && daSanSang) {
      taiLaiTatCa()
      // 🔔 Tự kiểm tra thay đổi mỗi 30 giây
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
  }, [token, daSanSang, boLoc, lanCapNhatCuoi, taiLaiTatCa])

  useEffect(() => {
    try { localStorage.setItem('chuDe', chuDe) } catch {}
  }, [chuDe])

  const layDanhSach = async () => {
    if (!token) return
    try {
      const duongDan = boLoc === 'tat-ca' ? 'uoc-mo' : `uoc-mo/filter/${boLoc}`
      const phanHoi = await fetch(`${URL_SERVER}/${duongDan}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const duLieu = await phanHoi.json()
      if (Array.isArray(duLieu)) setDanhSach(duLieu)
      else {
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
    setToken(null); setTenDangNhap(''); setDanhSach([]); setThongKe(null); setLichSu([])
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
    setDangSua(null) // Thoát chế độ sửa
    setNoiDung(g.noiDung)
    setMucTien(g.mucTien?.toString() || '')
    setGhiChu(g.ghiChu || '')
    setNgayHen('')
    setDoUuTien('binh')
  }

  const batDauSua = (u) => {
    setDangSua(u._id)
    setNoiDung(u.noiDung)
    setMucTien((u.mucTien || 0).toString())
    setGhiChu(u.ghiChu || '')
    setNgayHen(u.ngayHen ? new Date(u.ngayHen).toISOString().split('T')[0] : '')
    setDoUuTien(u.doUuTien || 'binh')
    setTabHienTai('danh-sach')
  }

  const huySua = () => {
    setDangSua(null)
    setNoiDung(''); setMucTien(''); setGhiChu(''); setNgayHen(''); setDoUuTien('binh')
  }

  const luuUocMo = async () => {
    if (!noiDung.trim()) return setThongBao('Nhập nội dung nhé! 💫')
    setDangTai(true)
    try {
      let phanHoi
      if (dangSua) {
        // ✏️ Cập nhật
        phanHoi = await fetch(`${URL_SERVER}/uoc-mo/${dangSua}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ noiDung, mucTien: Number(mucTien) || 0, ghiChu, ngayHen, doUuTien })
        })
      } else {
        // ➕ Thêm mới
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
      setThongBao('📤 Đã tải dữ liệu về máy! ✅')
    } catch { setThongBao('Lỗi xuất dữ liệu! 😅') }
  }

  // Tính toán
  const tongTien = Array.isArray(danhSach) ? danhSach.reduce((t, i) => t + (Number(i.mucTien) || 0), 0) : 0
  const daHoanThanh = Array.isArray(danhSach) ? danhSach.filter(i => i.hoanThanh).length : 0
  const tongTienHT = Array.isArray(danhSach) ? danhSach.filter(i => i.hoanThanh).reduce((t, i) => t + (Number(i.mucTien) || 0), 0) : 0
  const phanTram = tongTien > 0 ? Math.round((tongTienHT / tongTien) * 100) : 0

  // Màu chủ đề
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
            {/* Bộ lọc */}
            <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap'}}>
              {[{k:'tat-ca',t:'Tất cả'},{k:'sap-den-han',t:'🔔 Sắp đến hạn'},{k:'cao-uu-tien',t:'⭐ Ưu tiên cao'},{k:'da-hoan-thanh',t:'✅ Đã xong'}].map(b=>(
                <button key={b.k} onClick={()=>setBoLoc(b.k)} style={{padding:'0.5rem 0.9rem',border:'none',borderRadius:'20px',background:boLoc===b.k?'white':'rgba(255,255,255,0.2)',color:boLoc===b.k?chuDeMau.nut:'white',cursor:'pointer',fontSize:'0.85rem',fontWeight:boLoc===b.k?'bold':'normal'}}>{b.t}</button>
              ))}
            </div>

            {/* Thông báo sắp đến hạn */}
            {thongKe && thongKe.sapDenHan > 0 && (
              <div style={{background:'#fff3cd',border:'1px solid #ffc107',borderRadius:'10px',padding:'0.8rem',marginBottom:'1rem',color:'#856404'}}>
                ⏰ <strong>{thongKe.sapDenHan}</strong> ước mơ sắp đến hạn trong tuần này!
              </div>
            )}

            {/* Gợi ý thông minh */}
            {boLoc === 'tat-ca' && !dangSua && goiY.length > 0 && (
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

            {/* Form Thêm / Sửa */}
            <div style={{background:'white',borderRadius:'16px',padding:'1.3rem',marginBottom:'1.3rem',boxShadow:'0 10px 30px rgba(0,0,0,0.15)'}}>
              <h3 style={{marginTop:0,color:'#4a5568',fontSize:'1rem'}}>
                {dangSua ? '✏️ Chỉnh sửa ước mơ' : 'Thêm ước mơ mới 💫'}
              </h3>
              <input type="text" placeholder="Bạn muốn điều gì?" value={noiDung} onChange={(e)=>setNoiDung(e.target.value)} style={{width:'100%',padding:'0.7rem',margin:'0.4rem 0',borderRadius:'8px',border:'2px solid #e2e8f0'}} />
              <input type="number" placeholder="Cần bao nhiêu tiền?" value={mucTien} onChange={(e)=>setMucTien(e.target.value)} style={{width:'100%',padding:'0.7rem',margin:'0.4rem 0',borderRadius:'8px',border:'2px solid #e2e8f0'}} />
              <input type="text" placeholder="Ghi chú (tùy chọn)" value={ghiChu} onChange={(e)=>setGhiChu(e.target.value)} style={{width:'100%',padding:'0.7rem',margin:'0.4rem 0',borderRadius:'8px',border:'2px solid #e2e8f0'}} />
              <div style={{display:'flex',gap:'0.5rem',margin:'0.4rem 0',flexWrap:'wrap'}}>
                <input type="date" value={ngayHen} onChange={(e)=>setNgayHen(e.target.value)} style={{flex:1,minWidth:'140px',padding:'0.7rem',borderRadius:'8px',border:'2px solid #e2e8f0'}} />
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

            {/* Thống kê nhỏ */}
            <div style={{background:'white',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-around',flexWrap:'wrap',gap:'0.5rem'}}>
                <div style={{textAlign:'center'}}><p style={{margin:0,color:'#718096',fontSize:'0.8rem'}}>Tổng giá trị</p><p style={{fontSize:'1.2rem',fontWeight:'bold',color:'#667eea'}}>{tongTien.toLocaleString('vi-VN')} ₫</p></div>
                <div style={{textAlign:'center'}}><p style={{margin:0,color:'#718096',fontSize:'0.8rem'}}>Đã hoàn thành</p><p style={{fontSize:'1.2rem',fontWeight:'bold',color:'#48bb78'}}>{phanTram}%</p></div>
                <div style={{textAlign:'center'}}><p style={{margin:0,color:'#718096',fontSize:'0.8rem'}}>Số ước mơ</p><p style={{fontSize:'1.2rem',fontWeight:'bold',color:'#f6ad55'}}>{daHoanThanh}/{danhSach.length}</p></div>
              </div>
              <div style={{height:'8px',background:'#e2e8f0',borderRadius:'4px',marginTop:'0.8rem',overflow:'hidden'}}><div style={{height:'100%',width:`${phanTram}%`,background:'linear-gradient(90deg,#48bb78,#38a169)',borderRadius:'4px',transition:'width 0.5s ease'}} /></div>
            </div>

            {/* Danh sách */}
            <div>
              {!Array.isArray(danhSach)||danhSach.length===0?(
                <p style={{textAlign:'center',color:'white',fontSize:'1rem'}}>Chưa có gì {boLoc!=='tat-ca'?'trong bộ lọc này':'... Nhấn gợi ý để bắt đầu! 🌟'}</p>
              ):(
                danhSach.map(u=>(
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
                        {u.hoanThanh ? (
                          <button onClick={()=>danhDauHoanThanh(u._id,false)} style={{border:'none',background:'#f6e05e',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer'}} title="Mở lại">↩</button>
                        ) : (
                          <button onClick={()=>danhDauHoanThanh(u._id)} style={{border:'none',background:'#68d391',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer'}} title="Đánh dấu xong">✓</button>
                        )}
                        <button onClick={()=>xoaUocMo(u._id)} style={{border:'none',background:'#fc8181',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer'}} title="Xóa">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* === Tab: Thống kê === */}
        {tabHienTai === 'thong-ke' && thongKe && (
          <div style={{background:'white',borderRadius:'16px',padding:'1.5rem'}}>
            <h2 style={{textAlign:'center',color:'#4a5568',marginTop:0}}>📊 Thống kê chi tiết</h2>
            
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))',gap:'1rem',margin:'1.5rem 0'}}>
              {[
                {so:thongKe.tongSo,label:'Tổng ước mơ',mau:'#667eea'},
                {so:thongKe.daHoanThanh,label:'Đã hoàn thành',mau:'#48bb78'},
                {so:thongKe.tongGiaTri.toLocaleString('vi-VN')+' ₫',label:'Tổng giá trị',mau:'#f6ad55'},
                {so:thongKe.tuanNay,label:'Thêm trong tuần',mau:'#9f7aea'}
              ].map((s,i)=>(
                <div key={i} style={{textAlign:'center',padding:'1rem',background:'#f7fafc',borderRadius:'10px'}}>
                  <p style={{fontSize:'1.5rem',fontWeight:'bold',margin:0,color:s.mau}}>{s.so}</p>
                  <p style={{margin:'0.3rem 0 0 0',color:'#718096',fontSize:'0.85rem'}}>{s.label}</p>
                </div>
              ))}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'0.8rem',marginBottom:'1.5rem'}}>
              {[
                {so:thongKe.uuTienCaoChuaXong,label:'Ưu tiên cao chưa xong',mau:'#e53e3e'},
                {so:thongKe.sapDenHan,label:'Sắp đến hạn',mau:'#f6ad55'}
              ].map((s,i)=>(
                <div key={i} style={{padding:'0.9rem',background:s.so>0?'#fff5f5':'#f0fff4',borderRadius:'10px',border:`1px solid ${s.so>0?'#feb2b2':'#9ae6b4'}`}}>
                  <strong style={{color:s.mau}}>{s.so}</strong> — {s.label}
                </div>
              ))}
            </div>

            <button onClick={xuatDuLieu} style={{width:'100%',padding:'1rem',background:chuDeMau.nen,color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>📤 Tải toàn bộ dữ liệu về máy</button>
          </div>
        )}

        {/* === Tab: Lịch sử === */}
        {tabHienTai === 'lich-su' && (
          <div style={{background:'white',borderRadius:'16px',padding:'1.5rem'}}>
            <h2 style={{textAlign:'center',color:'#4a5568',marginTop:0}}>🕐 Lịch sử hoạt động</h2>
            {lichSu.length === 0 ? (
              <p style={{textAlign:'center',color:'#718096',padding:'2rem'}}>Chưa có hoạt động nào. Bắt đầu thêm ước mơ nhé! 💫</p>
            ) : (
              <div style={{marginTop:'1rem'}}>
                {lichSu.map((muc,i)=>(
                  <div key={i} style={{padding:'0.8rem 0',borderBottom:'1px solid #e2e8f0',display:'flex',gap:'0.8rem',alignItems:'flex-start'}}>
                    <span style={{fontSize:'1.2rem'}}>{muc.icon}</span>
                    <div style={{flex:1}}>
                      <p style={{margin:0,color:'#2d3748',fontWeight:'500'}}>{muc.noiDung}</p>
                      <p style={{margin:'0.2rem 0 0 0',color:'#718096',fontSize:'0.8rem'}}>{muc.hanhDong} — {new Date(muc.thoiGian).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === Tab: Hướng dẫn === */}
        {tabHienTai === 'huong-dan' && (
          <div style={{background:'white',borderRadius:'16px',padding:'1.5rem',lineHeight:'1.7'}}>
            <h2 style={{textAlign:'center',color:'#4a5568',marginTop:0}}>📖 Hướng dẫn sử dụng & Giới thiệu dự án</h2>
            
            {[
              {t:'✨ Tạo ước mơ mới',n:'Điền nội dung, số tiền, chọn ngày hẹn & mức độ ưu tiên → Nhấn "Lưu Lên Đám Mây". Dữ liệu lưu an toàn trên MongoDB ☁️'},
              {t:'✏️ Chỉnh sửa',n:'Nhấn vào bất kỳ mục nào → tự động điền vào form → sửa xong nhấn "Cập nhật" → thay đổi ngay ✏️'},
              {t:'💡 Gợi ý thông minh',n:'Ở trang Danh sách sẽ có các gợi ý ngẫu nhiên — nhấn để điền nhanh vào form, chỉnh sửa theo ý mình ✏️'},
              {t:'🔔 Đồng bộ tự động',n:'Trang tự kiểm tra cập nhật mỗi 30 giây. Nếu mở trên máy khác cũng thấy thay đổi ngay 🔄'},
              {t:'📊 Xem tiến độ & Lịch sử',n:'Qua tab Thống kê & Lịch sử bạn thấy tổng quan, số liệu, hoạt động gần đây — dễ theo dõi sự phát triển 📈'},
              {t:'📤 Sao lưu dữ liệu',n:'Nhấn "Tải toàn bộ dữ liệu về máy" để lưu file sao lưu an toàn. Có thể mở bằng trình soạn thảo văn bản bất kỳ 💾'},
              {t:'🎨 Đổi giao diện',n:'Nhấn 3 vòng tròn màu trên cùng để thay đổi chủ đề. Sẽ được ghi nhớ cho lần sau 🎭'},
              {t:'🔒 An toàn & Bảo mật',n:'Mật khẩu được mã hóa, dữ liệu riêng tư chỉ bạn xem được. Luôn đăng xuất trên máy không phải của mình 🔐'}
            ].map((muc,i)=>(
              <div key={i} style={{marginBottom:'1rem',paddingBottom:'1rem',borderBottom:'1px solid #e2e8f0'}}>
                <h4 style={{margin:'0 0 0.3rem 0',color:'#4a5568'}}>{muc.t}</h4>
                <p style={{margin:0,color:'#718096',fontSize:'0.9rem'}}>{muc.n}</p>
              </div>
            ))}

            <div style={{marginTop:'1.5rem',padding:'1rem',background:'#f7fafc',borderRadius:'10px'}}>
              <h3 style={{color:'#4a5568',marginTop:0}}>💻 Công nghệ sử dụng</h3>
              <ul style={{margin:'0.5rem 0',paddingLeft:'1.2rem',color:'#4a5568'}}>
                <li><strong>Frontend:</strong> React.js + Vite — nhanh, hiện đại, tối ưu</li>
                <li><strong>Backend:</strong> Node.js + Express — nhẹ, mạnh, dễ mở rộng</li>
                <li><strong>Cơ sở dữ liệu:</strong> MongoDB — lưu dữ liệu linh hoạt, an toàn trên đám mây</li>
                <li><strong>Triển khai:</strong> Vercel (Frontend) + Render (Backend) — miễn phí, ổn định</li>
                <li><strong>Xác thực:</strong> JWT — bảo mật phiên đăng nhập</li>
                <li><strong>Quản lý mã nguồn:</strong> Git + GitHub — chuẩn công ty</li>
              </ul>
            </div>

            <p style={{textAlign:'center',marginTop:'1.5rem',color:'#4a5568',fontWeight:'bold'}}>💚 Dự án hoàn chỉnh — sẵn sàng đưa vào hồ sơ xin việc! 💫</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App