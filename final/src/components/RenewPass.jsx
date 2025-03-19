import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios importu eklenmeli
import "../css/diary.css";

const RenewPass = () => {
    const [user, setUser] = useState({
        password: '',
        password_again: ''
    });

    const navigate = useNavigate();
    const token = window.location.pathname.split("/")[2];  // URL'den token'ı al

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleClick = async (e) => {
      e.preventDefault();
      if (user.password !== user.password_again) {
          alert('Şifreler eşleşmiyor!');
          return;
      }
      try {
          await axios.post(`http://localhost:8800/auth/reset/${token}`, {
              newPassword: user.password
          });
          alert("Şifre başarıyla güncellendi! Şimdi giriş yapabilirsiniz.");
          navigate('/login');
      } catch (err) {
          console.error(err);
          alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
  };
  

    return (
        <div>
            <div className="register-container">
                <h2>Şifreyi Yenile</h2>
                <form onSubmit={handleClick} className="entry-form">
                    <div className="form-group">
                        <label htmlFor="password" className="journal-label">Yeni Şifre:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={user.password}
                            onChange={handleChange}
                            className="entry-text-title"
                            placeholder="Yeni Şifre"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password_again" className="journal-label">Yeni Şifreyi Tekrar Girin:</label>
                        <input
                            type="password"
                            id="password_again"
                            name="password_again"
                            value={user.password_again}
                            onChange={handleChange}
                            className="entry-text-title"
                            placeholder="Yeni Şifreyi Tekrar Girin"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-main">Şifreyi Yenile</button>
                </form>
            </div>
        </div>
    );
};

export default RenewPass;
