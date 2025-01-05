import { db } from "../db.js";
import bcrypt from "bcryptjs";
import axios from "axios";

export const updateUser = (req, res) => {
    const q = "Update users Set `username`=?,`email`=?, `password`=? where `user_id`=?"
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt)

    const values = [
        req.body.username,
        req.body.email,
        hash,
        req.body.user_id
    ]

    db.query(q, values, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })
}

export const deleteUser = (req, res) => {
    const userId = req.params.id;
    const q = "DELETE FROM users where user_id=?"
    db.query(q, [userId], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })

}

export const getUser = (req, res) => {
    const userId = req.params.id;
    const query = "SELECT * FROM users where user_id=?"
    db.query(query, userId, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })
}

export const getUsers = (req, res) => {
    const query = "SELECT * FROM users"
    db.query(query, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })
}


export const addLog = (req, res) => {
    const inputText = req.body.input_text;
    const userId = req.body.user_id;
    const emotion = req.body.emotion;

    // Aynı gün log var mı kontrolü
    const checkLogQuery = "SELECT * FROM user_inputs WHERE user_id = ? AND DATE(timestamp) = CURDATE()";
    db.query(checkLogQuery, [userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Veritabanı hatası', error: err });
        }

        if (result.length > 0) {
            // Eğer kullanıcı aynı gün bir log girdiyse
            return res.status(400).json({ message: 'Bugün zaten bir log kaydedildi' });
        }

        // Eğer yoksa, logu eklemeye devam et
        axios.post("http://127.0.0.1:5000/suicidality", { text: inputText })
            .then((response) => {
                const analysis = response.data.suicidality_analysis;
                let suicidalityScore = 0;

                if (analysis.label === "LABEL_1") {
                    suicidalityScore = analysis.score;
                } else if (analysis.label === "LABEL_0") {
                    suicidalityScore = -analysis.score;
                }

                console.log(`Suicidality Score for User ${userId}:`, suicidalityScore);

                // Veritabanına yeni log ekleme
                const insertQuery = "INSERT INTO user_inputs (user_id, input_text, suicidality,emotion) VALUES (?, ?, ?, ?)";
                const values = [userId, inputText, suicidalityScore, emotion];

                db.query(insertQuery, values, (err, data) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: 'Veritabanı hatası', error: err });
                    }

                    // user_id ve input_text'e göre veritabanında satırı bulma
                    const findQuery = "SELECT * FROM user_inputs WHERE user_id = ? AND input_text = ?";
                    db.query(findQuery, [userId, inputText], (err, result) => {
                        if (err) {
                            return res.status(500).json({ message: 'Veritabanı hatası', error: err });
                        }

                        if (result.length === 0) {
                            return res.status(404).json({ message: 'Veritabanında ilgili satır bulunamadı' });
                        }

                        console.log(result[0].input_id);

                        // API'ye ikinci isteği gönderme
                        axios.post('http://127.0.0.1:5000/analyze', { text: inputText })
                            .then((response) => {
                                const analysis = response.data.analysis;

                                // API yanıtını işleme
                                const scores = analysis.reduce((acc, item) => {
                                    acc[item.label] = item.score;
                                    return acc;
                                }, {});

                                console.log(scores.joy);

                                // Veritabanına yeni log ekleme
                                const insertScoresQuery = `
                                    INSERT INTO scores (input_id, joy, excitement, admiration, surprise, optimism, love, approval, 
                                        neutral, desire, realization, pride, amusement, relief, gratitude, curiosity, caring, confusion, 
                                        annoyance, disapproval, disappointment, nervousness, fear, sadness, anger, grief, disgust, embarrassment, remorse)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `;

                                const scoreValues = [
                                    result[0].input_id, // user_inputs tablosundaki satırın id'si
                                    scores.joy || 0, scores.excitement || 0, scores.admiration || 0, scores.surprise || 0,
                                    scores.optimism || 0, scores.love || 0, scores.approval || 0, scores.neutral || 0,
                                    scores.desire || 0, scores.realization || 0, scores.pride || 0, scores.amusement || 0,
                                    scores.relief || 0, scores.gratitude || 0, scores.curiosity || 0, scores.caring || 0,
                                    scores.confusion || 0, scores.annoyance || 0, scores.disapproval || 0, scores.disappointment || 0,
                                    scores.nervousness || 0, scores.fear || 0, scores.sadness || 0, scores.anger || 0,
                                    scores.grief || 0, scores.disgust || 0, scores.embarrassment || 0, scores.remorse || 0
                                ];

                                db.query(insertScoresQuery, scoreValues, (err, data) => {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).json({ message: 'Veritabanı hatası', error: err });
                                    }

                                    console.log(data);

                                    // Negatif duyguların toplamını kontrol et
                                    const negativeEmotionScore =
                                        (scores.sadness || 0) +
                                        (scores.anger || 0) +
                                        (scores.grief || 0) +
                                        (scores.disgust || 0) +
                                        (scores.fear || 0) +
                                        (scores.remorse || 0) +
                                        (scores.disappointment || 0);

                                    console.log("Negatif duygular toplamı:", negativeEmotionScore);

                                    if (negativeEmotionScore > 0.5) { // Belirli bir eşik değeri, örnek: 0.5
                                        return res.redirect('http://localhost:3000/chat'); // Kullanıcıyı yönlendir
                                    }

                                    return res.status(200).json({ message: 'Veriler başarıyla kaydedildi', data: data });
                                });
                            })
                            .catch((error) => {
                                console.error('API isteği hatası:', error);
                                return res.status(500).json({ message: 'API isteği sırasında bir hata oluştu', error });
                            });
                    });
                });
            })
            .catch((error) => {
                console.error("Error analyzing suicidality:", error);
                return res.status(500).json({ message: 'API isteği sırasında bir hata oluştu', error });
            });
    });
};

export const getLogs = (req, res) => {
    const user_id = req.body.id;
    const timestamp = req.body.timestamp;
    console.log(user_id, timestamp);

    // Tarih kısmını alıp sadece yıl, ay, gün karşılaştırması yapmak için DATE() fonksiyonunu kullanıyoruz
    const query = "SELECT * FROM user_inputs WHERE user_id = ? AND DATE(timestamp) = DATE(?)";

    db.query(query, [user_id, timestamp], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
};

export const removeLog = (req, res) => {
    const q = "DELETE FROM user_inputs WHERE input_id = ?";
    const values = [req.params.id];

    db.query(q, values, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
}

export const getTopScores = (req, res) => {
    const user_id = req.body.id; // Kullanıcı ID'si

    // İlk olarak 'user_inputs' tablosundan son kaydın input_id, timestamp ve suicidality sütunlarını alalım
    const queryUserInput = `
        SELECT input_id, timestamp, suicidality, emotion
        FROM user_inputs 
        WHERE user_id = ? 
        ORDER BY input_id DESC 
        LIMIT 1
    `;

    db.query(queryUserInput, [user_id], (err, userInputData) => {
        if (err) return res.json(err);

        // Eğer son kayıtta bir sonuç varsa
        if (userInputData.length > 0) {
            const input_id = userInputData[0].input_id; // Son kaydın input_id değeri

            const queryScores = `
                SELECT joy, excitement, admiration, surprise, optimism, love, approval, neutral, desire, realization, pride, amusement, relief, gratitude, curiosity, caring, confusion, annoyance, disapproval, disappointment, nervousness, fear, sadness, anger, grief, disgust, embarrassment, remorse
                FROM scores
                WHERE input_id = ? 
            `;

            db.query(queryScores, [input_id], (err, scoresData) => {
                if (err) return res.json(err);

                // Eğer skor verisi varsa
                if (scoresData.length > 0) {
                    const scores = scoresData[0]; // İlk (tek) kaydı al

                    // Skorları array'e çevir ve değerlerini büyükten küçüğe sıralayalım
                    const emotionScores = Object.entries(scores)
                        .map(([emotion, score]) => ({ emotion, score }))
                        .sort((a, b) => b.score - a.score); // Büyükten küçüğe sıralama

                    // İlk 3 duyguyu al
                    const top3Emotions = emotionScores.slice(0, 3);

                    // En yüksek 3 duyguyu etiketleriyle hazırlayalım
                    const top3EmotionLabels = top3Emotions.map(item => {
                        return { emotion: item.emotion, score: item.score };
                    });

                    // Verileri birleştirip cevabı gönder
                    const responseData = {
                        timestamp: userInputData[0].timestamp,
                        suicidality: userInputData[0].suicidality,
                        emotion: userInputData[0].emotion,
                        top3Emotions: top3EmotionLabels // En yüksek 3 duyguyu içeren liste
                    };

                    return res.json(responseData);
                } else {
                    return res.status(404).json({ message: 'Skor verisi bulunamadı.' });
                }
            });
        } else {
            // Eğer user_inputs tablosunda sonuç yoksa, uygun bir mesaj döndürebiliriz
            return res.status(404).json({ message: 'Kullanıcı verisi bulunamadı.' });
        }
    });
};
