import React from 'react';
import "../css/footer.css";

const Footer = () => {
  return (
    <div id='footer'>
      <div className='footerColumn'>
        <a href="/">Anasayfa</a>
        <a href="/about">Hakkımızda</a>
        <a href="/contact">İletişim</a>
        <p>Bu site okul projesidir, lütfen ciddiye almayınız.</p>
      </div>
      
    </div>
  );
};

export default Footer;
