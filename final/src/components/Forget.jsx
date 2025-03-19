import { useState } from 'react';
import React from 'react';
import axios from 'axios';

const Forget = () => {
  const [user, setUser] = useState({
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8800/auth/forgetpassword', {
        email: user.email,
      });
      console.log('Şifre sıfırlama bağlantısı gönderildi');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="register-container">
        <h2>Şifremi Unuttum</h2>
        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-group">
            <label htmlFor="email" className="journal-label">
              Email:
            </label>
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
          <button type="submit" className="btn-main">
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
};

export default Forget;
