import { config } from 'dotenv';
import axios from 'axios';
import { db } from "../db.js";

config(); // .env dosyasını yükler

const apiKey = process.env.OPENAI_API_KEY; // API anahtarını .env dosyasından alır

// Kullanıcıdan alınan mesajı OpenAI API'ye gönderir
export const getChatReply = async (req, res) => {
    const { userMessage } = req.body; // Kullanıcı mesajı

    if (!userMessage) {
        return res.status(400).json({ message: 'Mesaj girilmesi gerekiyor.' });
    }

    try {
        console.log('API Key:', apiKey); // Debugging the API key value
        // OpenAI API'ye istek gönderme
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4', // Modeli belirleyin (gpt-4 veya gpt-3.5 vb.)
            messages: [
                { role: 'user', content: userMessage }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const botReply = response.data.choices[0].message.content; // OpenAI'den gelen cevap

        return res.json({ reply: botReply }); // API'den gelen yanıtı frontend'e gönder
    } catch (error) {
        console.error('OpenAI API isteği sırasında hata:', error);
        return res.status(500).json({ message: 'OpenAI API isteği sırasında bir hata oluştu.' });
    }
};


export const addChatLog = async (req, res) => {
    const { userId, chatLog } = req.body; // Kullanıcı ID'si ve chat logu body'den alır
    const emotion = req.body.emotion; // Duyguları alır

    if (!userId || !chatLog) {
        return res.status(400).json({ message: 'Kullanıcı ID\'si ve chat logu girilmesi gerekiyor.' });
    }

    // Güncel tarih ve saati alır, 3 saat ekler
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 3); // 3 saat ekle
    const currentDateTime = currentDate.toISOString().slice(0, 19).replace('T', ' '); // 'YYYY-MM-DD HH:MM:SS' formatı

    // `chat_logs` tablosuna veri eklemek için SQL sorgusu
    const query = "INSERT INTO chat_logs (user_id, chat_log, log_date,emotion) VALUES (?, ?, ?, ?)";

    // Veriyi veritabanına kaydet
    db.query(query, [userId, chatLog, currentDateTime,emotion], (err, result) => {
        if (err) {
            console.error('Veritabanına log eklerken hata oluştu:', err);
            return res.status(500).json({ message: 'Veritabanına log eklenirken bir hata oluştu.' });
        }

        return res.status(200).json({ message: 'Chat logu başarıyla kaydedildi.' });
    });
};
