import React, { useContext } from "react";
import "../css/nav.css";
import { AuthContext } from "../context/authContext";

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext); // logout'u AuthContext'ten aldık

  return (
    <div id="navbar">
      <a href="/" id="companyName">Diary</a>
      <div id="Enterance">
        {!currentUser ? (
          <>
            <a href="/login">Giriş Yap</a>
            <a href="/register">Kayıt Ol</a>
          </>
        ) : (
          <a onClick={logout}>Çıkış Yap</a>
        )}
      </div>
    </div>
  );
};

export default Navbar;
