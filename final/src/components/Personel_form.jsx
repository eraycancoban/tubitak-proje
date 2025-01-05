import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext'; // AuthContext'ten user'ı al
import axios from 'axios'; // axios importu eklenmeli
import "../css/diary.css";

const PersonelForm = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const navigate = useNavigate();
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const { currentUser, logout } = useContext(AuthContext);
  const id = currentUser?.user_id; // Kullanıcı ID'sini al

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  const handleLogoutAndNavigate = () => {
    logout(); // Kullanıcı çıkış yap
    navigate('/login'); // Giriş sayfasına yönlendir
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!id) {
      alert("Kullanıcı ID'si bulunamadı. Lütfen tekrar giriş yapın.");
      logout();
      navigate('/login');
      return;
    }

    if (password !== passwordAgain) {
      alert('Şifreler eşleşmiyor!');
      return;
    }

    try {
      await axios.put(`http://localhost:8800/auth/changepass/${id}`, {
        oldPassword: currentPassword,
        newPassword: password
      });

      alert("Şifre başarıyla güncellendi! Şimdi giriş yapabilirsiniz.");
      logout();
      navigate('/login');
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 404:
            alert(`Kullanıcı bulunamadı. (ID: ${id})`);
            break;
          case 401:
            alert("Mevcut şifre geçersiz.");
            break;
          default:
            alert(`Bir hata oluştu. (Hata kodu: ${err.response?.status})`);
        }
      } else {
        alert("Sunucuya bağlanırken bir hata oluştu.");
      }
    }
  };

  return (
    <div className="diary-page">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Menü</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            &times;
          </button>
        </div>
        <div className="sidebar-content">
          {/* Yeni Buton */}
          <button className="btn-diary" onClick={handleLogoutAndNavigate}>
            Günlük Sayfasına Git
          </button>

          {/* Profil Ayarları */}
          <div className="sidebar-section">
            <h3>Profil Ayarları</h3>
            <button className="btn-profile">Profil Düzenle</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <button className="menu-btn" onClick={toggleSidebar}>
          ☰ Menü
        </button>
        <div className="personel-container">
          <div className="personel-card">
            <h2 className="title">Personel Bilgileri</h2>
            <div className="info">
              <p>
                <strong>Ad:</strong> {currentUser.username}
              </p>
              <p>
                <strong>Email:</strong> {currentUser.email}
              </p>
            </div>
            <div className="change-password-section">
              <h3 className="subtitle">Parola Değiştir</h3>
              <form className="password-form" onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Mevcut Parola</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Mevcut parolanızı giriniz"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">Yeni Parola</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Yeni parolanızı giriniz"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Yeni Parola (Tekrar)</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordAgain}
                    onChange={(e) => setPasswordAgain(e.target.value)}
                    placeholder="Yeni parolanızı tekrar giriniz"
                  />
                </div>
                <button type="submit" className="btn-main">
                  Parolayı Güncelle
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonelForm;
