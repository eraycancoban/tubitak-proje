import { db } from "../db.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { config } from "../config/auth.config.js";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'eraycancoban@gmail.com',
        pass: '' // Bu kısma gerçek şifreyi koyun
    }
});

export const resetPassword = (req, res) => {
    const token = req.params.token;
    const newPassword = req.body.newPassword;
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 3); // 3 saat ekle
    const currentDateTime = currentDate.toISOString().slice(0, 19).replace('T', ' ');

    console.log('Şifre sıfırlama işlemi başladı.');
    console.log('Token:', token);
    console.log('Yeni Şifre:', newPassword);
    console.log('Şu anki zaman:', currentDateTime);
    const q = "SELECT * FROM Users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?";
    const values = [
        token,
        currentDateTime
    ];

    db.query(q, values, (err, data) => {
        if (err) {
            console.error('Veritabanı sorgusu sırasında hata oluştu:', err);
            return res.json(err);
        }
        console.log('Veritabanı sorgusu başarılı. Kullanıcı sayısı:', data.length);

        if (!data.length) {
            console.warn("Şifre sıfırlama token'ı geçersiz veya süresi dolmuş.");
            return res.status(400).json("Şifre sıfırlama token'ı geçersiz veya süresi dolmuş");
        }

        const user = data[0];
        console.log('Kullanıcı bilgileri alındı:', user);

        const salt = bcrypt.genSaltSync(10);
        console.log('Salt üretildi:', salt);

        const hash = bcrypt.hashSync(newPassword, salt);
        console.log('Yeni şifre hash edildi:', hash);

        const q2 = "UPDATE users SET password_hash = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE user_id = ?";
        const values2 = [
            hash,
            user.user_id
        ];

        db.query(q2, values2, (err, data) => {
            if (err) {
                console.error('Şifre güncelleme sırasında hata oluştu:', err);
                return res.json(err);
            }
            console.log('Şifre güncelleme başarılı.');
            return res.status(200).json("Şifre başarıyla sıfırlandı");
        });
    });
};


export const forgetPassword = (req, res) => {
    const email = req.body.email;
    const q = "SELECT * FROM Users WHERE email = ?";

    db.query(q, [email], (err, data) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json('Bir hata oluştu');
        }

        if (!data.length) {
            console.warn('Kullanıcı bulunamadı:', email);
            return res.status(404).json("Kullanıcı bulunamadı");
        }

        const user = data[0];
        const token = crypto.randomBytes(20).toString('hex');
        const expiration = new Date(Date.now() + 3600000) // 1 saat eklenmiş bir `Date` objesi oluşturun

        const q2 = "UPDATE Users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?";
        const values = [
            token,
            expiration, // Date objesi otomatik olarak uygun formata dönüştürülür
            email
        ];

        db.query(q2, values, (err) => {
            if (err) {
                console.error('Veritabanı güncelleme hatası:', err);
                return res.status(500).json('Bir hata oluştu');
            }

            const mailOptions = {
                from: 'hesapa083@gmail.com',
                to: user.email,
                subject: 'Şifre Sıfırlama Talebi',
                text: `Şifre sıfırlama talebinde bulundunuz. Lütfen aşağıdaki bağlantıya tıklayarak şifrenizi sıfırlayın: \n\n` +
                      `http://localhost:3000/newpass/${token}\n\n` +
                      `Bu bağlantı 1 saat süreyle geçerlidir.`
            };

            transporter.sendMail(mailOptions, (err, response) => {
                if (err) {
                    console.error('E-posta gönderim hatası:', err);
                    return res.status(500).json('E-posta gönderilemedi');
                }
                console.log('Şifre sıfırlama bağlantısı gönderildi:', email);
                return res.status(200).json('Şifre sıfırlama bağlantısı e-posta ile gönderildi');
            });
        });
    });
};



export const changePassword = (req, res) => {
    const user_id = req.params.id;
    console.log('Şifre değiştirme işlemi başladı:', user_id);
    // Input validation
    if (!req.body.oldPassword || !req.body.newPassword) {
        return res.status(400).json("Eski ve yeni şifre gereklidir");
    }

    const q = "SELECT * FROM users WHERE user_id = ?";

    db.query(q, [user_id], (err, data) => {
        if (err) {
            console.error('Veritabanı sorgusu sırasında hata oluştu:', err);
            return res.status(500).json("Veritabanı hatası");
        }
        
        if (!data.length) {
            return res.status(404).json("Kullanıcı bulunamadı");
        }

        const user = data[0];
        const isPasswordValid = bcrypt.compareSync(req.body.oldPassword, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json("Mevcut şifre geçersiz");
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.newPassword, salt);

        const q2 = "UPDATE Users SET password_hash = ? WHERE user_id = ?";
        const values = [hash, user_id];

        db.query(q2, values, (err, data) => {
            if (err) {
                console.error('Şifre güncellenirken hata oluştu:', err);
                return res.status(500).json("Şifre güncellenirken hata oluştu");
            }
            return res.status(200).json("Şifre başarıyla değiştirildi");
        });
    });
};

export const register = (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json("Tüm alanlar doldurulmalıdır");
    }

    const q = "SELECT * FROM Users WHERE username = ? OR email = ?";

    db.query(q, [username, email], (err, data) => {
        if (err) return res.status(500).json("Sunucu hatası");
        if (data.length) return res.status(409).json("Bu kullanıcı adı veya e-posta zaten kayıtlı");

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const q2 = "INSERT INTO Users (username, email, password_hash) VALUES (?)";
        const values = [username, email, hash];

        db.query(q2, [values], (err) => {
            if (err) return res.status(500).json("Sunucu hatası");
            return res.status(200).json("Kullanıcı eklendi");
        });
    });
};


export const login = (req, res) => {
    const { username, password } = req.body;

    const q = "SELECT * FROM Users WHERE username = ?";

    db.query(q, [username], (err, data) => {
        if (err) return res.status(500).json(err);

        if (data.length === 0) return res.status(404).json("Kullanıcı bulunamadı");

        const user = data[0];
        const isPasswordCorrect = bcrypt.compareSync(password, user.password_hash);

        if (!isPasswordCorrect) return res.status(400).json("Parola hatası");

        const token = jwt.sign({ id: user.user_id }, config.secret, { expiresIn: '24h' });

        const { password_hash, ...other } = user;

        console.log("Başarılı giriş:", username);

        res
            .cookie("access_token", token, { httpOnly: true })
            .status(200)
            .json(other);
    });
};

export const logout = (req, res) => {
    res.clearCookie("access_token", {
        sameSite: "none",
        secure: true
    }).status(200).json("User has been logged out.");
};
