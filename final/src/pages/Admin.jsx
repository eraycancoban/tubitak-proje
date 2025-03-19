import React, { useContext } from 'react';
import AdminForm from '../components/Admin_form'
import { AuthContext } from "../context/authContext";

const Admin = () => {
  // Get current user from context
    const { currentUser } = useContext(AuthContext);  // AuthContext muhtemelen bir obje döndürüyor
  
    // Check if user is authenticated
    const isAuthenticated = currentUser !== null && currentUser !== undefined;
    return (
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated ? (
          // Kullanıcı giriş yapmışsa Diary ve DiaryNav göster
          <div className="container mx-auto px-4 py-8">
            <AdminForm />
            
          </div>
        ) : (
          // Kullanıcı giriş yapmamışsa tanıtım yazısı göster
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Admin Sayfasına Giriş İçin Yetkiniz Yok !
            </h1>
          </div>
        )}
      </div>
    );
  };

export default Admin
 