import React, { useContext } from 'react';
import Diary from '../components/Diary';
import DiaryNav from '../components/DiaryNav';
import { AuthContext } from "../context/authContext";

const Home = () => {
  // Get current user from context
  const { currentUser } = useContext(AuthContext);  // AuthContext muhtemelen bir obje döndürüyor

  // Check if user is authenticated
  const isAuthenticated = currentUser !== null && currentUser !== undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        // Kullanıcı giriş yapmışsa Diary ve DiaryNav göster
        <div className="container mx-auto px-4 py-8">
          <Diary />
          <DiaryNav />
        </div>
      ) : (
        // Kullanıcı giriş yapmamışsa tanıtım yazısı göster
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Günlüğünüze Hoş Geldiniz
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Düşüncelerinizi, anılarınızı ve hayallerinizi güvenle saklayabileceğiniz 
            dijital günlüğünüz. Deneyiminizi kişiselleştirin ve anılarınızı ölümsüzleştirin.
          </p>
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Başlamak için lütfen giriş yapın veya hesap oluşturun.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;