import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import "../css/diary.css";

const Register = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8800/auth/register", {
        username: user.username,
        email: user.email,
        password: user.password
      });
      navigate("/login");
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <div className="register-container">
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label htmlFor="username" className="journal-label">Kullanıcı Adı:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={user.username}
            onChange={handleChange}
            className="entry-text-title"
            placeholder="Kullanıcı Adı"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="journal-label">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="entry-text-title"
            placeholder="Email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="journal-label">Şifre:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className="entry-text-title"
            placeholder="Şifre"
            required
          />
        </div>
        <button type="submit" className="btn-main">Kayıt Ol</button>
      </form>
    </div>
  );
};

export default Register;