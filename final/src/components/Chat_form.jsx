import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "../css/diary.css";

const ChatForm = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId] = useState(1); // Kullanıcı ID'sini buraya ekleyin
  const [chatLog, setChatLog] = useState(''); // Tüm chat logunu saklamak için
  const [emotions, setEmotions] = useState([]);
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);

  // Kamera başlatma işlemi
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (error) {
      console.error("Kamera açılırken hata oluştu", error);
    }
  };

  // Kamera durdurma işlemi
  const stopCamera = () => {
    if (cameraStream) {
      const tracks = cameraStream.getTracks();
      tracks.forEach((track) => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
    }
  };

  // Görüntü yakalama ve duygu analizi gönderme
  const captureImage = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Görüntüyü base64 formatında al
      const imageBase64 = canvas.toDataURL('image/jpeg');

      // Flask API'ye POST olarak gönder
      try {
        const response = await axios.post('http://localhost:5000/analyze-emotion', {
          image: imageBase64,
        });

        if (response.data && response.data.dominant_emotion) {
          console.log(response.data);
          setEmotions((prev) => [...prev, response.data.dominant_emotion]);
        } else {
          console.error("Duygu analizi sonucu bulunamadı.");
        }
      } catch (error) {
        console.error("Görüntü gönderilemedi", error);
      }
    }
  };

  // En yaygın duyguyu hesaplama
  const getMostFrequentEmotion = () => {
    if (!emotions || emotions.length === 0) return "Henüz bir duygu alınmadı.";

    const emotionCount = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(emotionCount).reduce((a, b) =>
      emotionCount[a] > emotionCount[b] ? a : b
    );
  };

  // Kamera açıkken her 2 saniyede bir görüntü yakalama
  useEffect(() => {
    let emotionInterval;

    if (isCameraActive) {
      emotionInterval = setInterval(() => {
        captureImage();
      }, 2000);
    } else {
      clearInterval(emotionInterval);
    }

    return () => {
      clearInterval(emotionInterval);
    };
  }, [isCameraActive]);

  const handleSend = async () => {
    if (input.trim() !== '') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: true, text: input },
      ]);
      setLoading(true);

      try {
        const mostFrequentEmotion = getMostFrequentEmotion();

        // Backend API'ye istek gönder
        const response = await axios.post('http://localhost:8800/chat/getChatReply', {
          userMessage: input,
          emotion: mostFrequentEmotion, // Duygu da ekleniyor
        });

        // Backend'den gelen bot yanıtını ekle
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: false, text: response.data.reply },
        ]);

        // Chat logunu güncelle
        setChatLog((prevChatLog) =>
          prevChatLog +
          `\nUser: ${input}\nEmotion: ${mostFrequentEmotion}\nBot: ${response.data.reply}`
        );
      } catch (error) {
        console.error('ChatGPT yanıtı alınamadı:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: false, text: 'Üzgünüm, bir hata oluştu.' },
        ]);
      }

      setInput('');
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleEndChat = async () => {
    try {
      const response = await axios.post('http://localhost:8800/chat/addChatLog', {
        userId: userId,
        chatLog: chatLog,
        emotion: getMostFrequentEmotion(), // En yaygın duyguyu ekleyin
      });

      if (response.status === 200) {
        console.log('Chat başarıyla kaydedildi!');
        setMessages([]);
        setChatLog('');
      }
    } catch (error) {
      console.error('Chat kaydederken hata oluştu:', error);
    }
  };

  return (
    <div className="chat-container">
       <div className="camera-emotion">
        <button className="btn-light" onClick={startCamera}>Kamerayı Başlat</button>
        <button className="btn-dark" onClick={stopCamera}>Kamerayı Durdur</button>
        <video ref={videoRef} autoPlay style={{ display:'none', width: 360, height: 480 }}></video>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.user ? 'user-message' : 'bot-message'}`}
            style={{ alignSelf: msg.user ? 'flex-end' : 'flex-start' }}
          >
            {msg.text}
          </div>
        ))}
      </div>
     
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Mesajınızı yazın..."
          className="entry-text-title"
        />
        <button 
          onClick={handleSend} 
          className="btn-main send-button" 
          disabled={loading}
        >
          {loading ? 'Yükleniyor...' : 'Gönder'}
        </button>
      </div>
      <button onClick={handleEndChat} className="btn-end-chat">
        Konuşmayı Bitir
      </button>
    </div>
  );
};

export default ChatForm;
