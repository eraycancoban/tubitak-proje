import React, { useContext } from 'react';
import ChatForm from '../components/Chat_form';
import { AuthContext } from "../context/authContext";

const Chat = () => {
  const { currentUser } = useContext(AuthContext);

  // Check if user is authenticated
  const isAuthenticated = currentUser !== null && currentUser !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {isAuthenticated ? (
        // Kullanıcı giriş yapmışsa Chat göster
        <div className="container mx-auto px-4 py-8">
          <ChatForm />
        </div>
      ) : (
        // Kullanıcı giriş yapmamışsa tanıtım yazısı göster
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Lütfen Giriş Yapınız!
          </h1>
        </div>
      )}
    </div>
  );
};

export default Chat;
