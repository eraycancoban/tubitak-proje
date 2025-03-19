import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import "../css/diary.css";

const Diary = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [entryContent, setEntryContent] = useState("");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [emotions, setEmotions] = useState([]);
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false); // Track camera status
  const videoRef = useRef(null);  // Kameranın video akışını alacak referans
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Kamera başlatma işlemi
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      videoRef.current.srcObject = stream;
      setIsCameraActive(true); // Set camera active state to true
    } catch (error) {
      console.error("Kamera açılırken hata oluştu", error);
    }
  };

  // Kamera durdurma işlemi
  const stopCamera = () => {
    if (cameraStream) {
      const tracks = cameraStream.getTracks();
      tracks.forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraActive(false); // Set camera active state to false
    }
  };

  // Görüntü yakalama ve duygu analizi gönderme
  const captureImage = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Görüntüyü base64 formatında al
      const imageBase64 = canvas.toDataURL("image/jpeg");

      // Flask API'ye POST olarak gönder
      try {
        const response = await axios.post("http://localhost:5000/analyze-emotion", {
          image: imageBase64,
        });

        // API yanıtını kontrol et
        console.log(response.data);

        if (response.data && response.data.dominant_emotion) {
          setEmotions((prev) => [...prev, response.data.dominant_emotion]); // Collect emotions
        } else {
          console.error("Duygu analizi sonucu bulunamadı.");
        }
      } catch (error) {
        console.error("Görüntü gönderilemedi", error);
      }

    }
  };

  // Start emotion analysis loop every 2 seconds
  useEffect(() => {
    let emotionInterval;

    if (isCameraActive) {
      emotionInterval = setInterval(() => {
        captureImage(); // Capture image and send for analysis
      }, 2000); // Every 2 seconds

    } else {
      clearInterval(emotionInterval); // Clear interval when camera is not active
    }

    return () => {
      clearInterval(emotionInterval); // Clean up interval on unmount
    };
  }, [isCameraActive]);

  // Sidebar'ı açıp kapatma
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Profil sayfasına yönlendirme
  const goToProfile = () => navigate("/personel");

  // Metin içerik değişimi
  const handleContentChange = (e) => setEntryContent(e.target.value);

  // Günlük kaydetme
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!entryContent) {
      setMessage("Lütfen tüm alanları doldurun.");
      return;
    }

    const mostFrequentEmotion = getMostFrequentEmotion();

    try {
      const response = await axios.post("http://localhost:8800/users/addLog", {
        user_id: currentUser.user_id,
        input_text: entryContent,
        emotion: mostFrequentEmotion, // Duyguyu da ekliyoruz
      });

      if (response.status === 200) {
        if(response.data.message === "Chat"){
          navigate("/chat");
        }
        setMessage("Günlük başarıyla kaydedildi!");
        setEntryContent("");
        fetchLogs(selectedDate);
      } else {
        setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      if (error.response.status === 400) {
        setMessage(error.response.data.message);
      }
      else{console.error(error);
      setMessage("Sunucuya bağlanırken bir hata oluştu.");}
    }
  };

  // Tarih değişimi
  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    setSelectedDate(selectedDate);
    fetchLogs(selectedDate);
  };

  // Günlükleri API'den alma
  const fetchLogs = async (date) => {
    if (!date) return;
    console.log("Tarih:", date);
    try {
      const response = await axios.post("http://localhost:8800/users/getLogs", {
        id: currentUser.user_id,
        timestamp: date,
      });
      console.log("Günlükler:", response.data);
      setLogs(response.data.length > 0 ? response.data : []);
    } catch (error) {
      console.error(error);
      setMessage("Günlükleri alırken bir hata oluştu.");
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


  // Component yüklenince seçili tarih varsa logları al
  useEffect(() => {
    if (selectedDate) fetchLogs(selectedDate);
  }, [selectedDate]);

  return (
    <div className="diary-page">
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Menü</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            &times;
          </button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>Tarih Seç</h3>
            <input
              type="date"
              id="entryDate"
              name="entryDate"
              className="entry-date-picker"
              onChange={handleDateChange}
            />
          </div>

          <div className="sidebar-section">
            <h3>Profil Ayarları</h3>
            <button className="btn-profile" onClick={goToProfile}>
              Profil Düzenle
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        <section className="section journal-section">
          <div className="container">
            <div className="journal-header">
              <button className="menu-btn" onClick={toggleSidebar}>
                ☰ Menü
              </button>
              <h1 className="section-title">Günlük</h1>
            </div>
            <div className="camera-emotion">
              <button className="btn-light" onClick={startCamera}>Kamera Kaydını Başlat</button>
              <button className="btn-dark" onClick={stopCamera}>Kameray Kaydını Durdur</button>
            </div>
            <div className="camera-container" style={{ display: "none" }}>
              <video ref={videoRef} autoPlay style={{ display: "none", height: 480, width: 360 }}></video>
            </div>


            <div className="journal-content">
              <form id="entryForm" onSubmit={handleSubmit} className="entry-form">
                <label htmlFor="entry" className="journal-label">
                  Bugünün Kayıdı
                </label>
                <textarea
                  name="daily-entry"
                  id="entry"
                  className="entry-text-box"
                  placeholder="Bugün aklından neler geçiyor ? 💭"
                  value={entryContent}
                  onChange={handleContentChange}
                ></textarea>

                <button className="btn-main entry-submit-btn" type="submit">
                  Günlüğe Ekle
                </button>
              </form>
              {message && <p>{message}</p>}
            </div>
          </div>
        </section>

        <section className="section section-entry-results">
          <div className="container">
            {logs.length > 0 && <h2 className="section-title">Kayıtlı Girdiler</h2>}
            <div className="entry-results">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div className="entry-card" key={index}>
                    <p className="entry-date">
                      {new Date(new Date(log.timestamp).getTime() + 3 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]}
                    </p>                    
                    <p className="entry-text">{log.input_text}</p>
                  </div>
                ))
              ) : (
                <p></p>
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ display: "none" }}> 
            <p>{getMostFrequentEmotion()}</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Diary;
