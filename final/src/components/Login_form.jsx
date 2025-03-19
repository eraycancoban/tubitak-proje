import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext'; // AuthContext bağlamını import ettik.
import "../css/diary.css";

const Login_form = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // AuthContext'ten login fonksiyonunu aldık.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData); // AuthContext'teki login fonksiyonuna verileri gönderiyoruz.
      if (formData.username === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data || "Giriş başarısız");
    }
  };

  return (
    <div className="register-container">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label htmlFor="username" className="journal-label">Kullanıcı Adı:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="entry-text-title"
            placeholder="Kullanıcı Adı"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="journal-label">Şifre:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange} 
            className="entry-text-title"
            placeholder="Şifre"
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <a href="/forgetpass">Şifremi Unuttum</a>
        <button type="submit" className="btn-main">Giriş Yap</button>
      </form>
    </div>
  );
};

export default Login_form;
