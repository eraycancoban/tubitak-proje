import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../css/diary.css";

const AdminForm = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userScores, setUserScores] = useState(null);

  // Kullanıcıları backend'den al
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8800/users/get');
        setUsers(response.data);
      } catch (error) {
        console.error('Kullanıcılar alınırken hata oluştu:', error);
      }
    };

    fetchUsers();
  }, []);

  // Kullanıcıya tıklanınca detayları al
  const handleUserClick = async (user) => {
    // Eğer tıklanan kullanıcı zaten seçiliyse, seçimi temizle (kapat)
    if (selectedUser && selectedUser.id === user.user_id) {
      setSelectedUser(null);
      setUserScores(null); // Seçim kaldırıldığında skorları da temizle
    } else {
      setSelectedUser(user);
      setUserScores(null); // Yeni kullanıcı seçildiğinde eski skorları temizle
      try {
        // Kullanıcı ID'sini backend'e gönderiyoruz
        const response = await axios.post('http://localhost:8800/users/getLast', {
          id: user.user_id // ID'yi doğru şekilde gönderiyoruz
        });
        setUserScores(response.data); // Yeni kullanıcının skorlarını al ve state'e ata
        console.log(response.data); // Backend'den gelen veriyi konsola yazdır
      } catch (error) {
        console.error('Kullanıcı skorları alınırken hata oluştu:', error);
      }
    }
  };

  return (
    <div className="admin-container">
      <h2>Son Kullanıcılar</h2>
      
      {/* Kullanıcıları liste halinde göster */}
      <div className="user-list">
        {users.map((user) => (
          <div key={user.user_id} className="user-card" onClick={() => handleUserClick(user)}>
            <p>{user.username}</p>
            <p>{user.lastEntryDate}</p>
          </div>
        ))}
      </div>
      
      {/* Seçilen kullanıcı detaylarını göster */}
      {selectedUser && <UserDetail user={selectedUser} scores={userScores} />}
    </div>
  );
};

// Kullanıcı detaylarını gösteren bileşen
const UserDetail = ({ user, scores }) => {
  return (
    <div className="user-detail">
      <h3>{user.name} Detayları</h3>      
      {/* Kullanıcının en yüksek 3 puanı */}
      {scores && (
        <div>          
          <p><strong>Son Girdi Zamanı:</strong> {scores.timestamp}</p>
          <p><strong>Zarar Verme Durumu:</strong> {scores.suicidality}</p>
          <p><strong>Görüntü Duygu:</strong> {scores.emotion}</p>
          <h4>En Yüksek 3 Duygu:</h4>
          <ul>
            {scores.top3Emotions.map((emotion, index) => (
              <li key={index}>
                <strong>{emotion.emotion}</strong>: {emotion.score}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminForm;
