create database diary;
use diary;
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,
    resetPasswordToken VARCHAR(255) NULL,
    resetPasswordExpires TIMESTAMP NULL
);


CREATE TABLE Emotion_Analysis_Results (
    analysis_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    input_type VARCHAR(50) NOT NULL,
    analysis_type VARCHAR(50) NOT NULL,
    detected_emotion VARCHAR(50) NOT NULL,
    emotion_score FLOAT CHECK (emotion_score BETWEEN 0 AND 1),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE User_Inputs (
    input_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    input_text TEXT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Emotion_Scenarios (
    scenario_id INT AUTO_INCREMENT PRIMARY KEY,
    detected_emotion VARCHAR(50) NOT NULL,
    response_message TEXT NOT NULL,
    recommended_action VARCHAR(255) NOT NULL
);

CREATE TABLE Emotion_Logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    detected_emotion VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    additional_notes TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE scores (
    score_id INT PRIMARY KEY AUTO_INCREMENT, -- Primary key olarak tanımlanır ve otomatik artar
    input_id INT NOT NULL,                   -- User_Inputs tablosundan FOREIGN KEY
    joy FLOAT,
    excitement FLOAT,
    admiration FLOAT,
    surprise FLOAT,
    optimism FLOAT,
    love FLOAT,
    approval FLOAT,
    neutral FLOAT,
    desire FLOAT,
    realization FLOAT,
    pride FLOAT,
    amusement FLOAT,
    relief FLOAT,
    gratitude FLOAT,
    curiosity FLOAT,
    caring FLOAT,
    confusion FLOAT,
    annoyance FLOAT,
    disapproval FLOAT,
    disappointment FLOAT,
    nervousness FLOAT,
    fear FLOAT,
    sadness FLOAT,
    anger FLOAT,
    grief FLOAT,
    disgust FLOAT,
    embarrassment FLOAT,
    remorse FLOAT,
    FOREIGN KEY (input_id) REFERENCES User_Inputs(input_id) -- FOREIGN KEY tanımlaması
);

CREATE TABLE chat_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    chat_log TEXT,
    log_date DATETIME,
    emotion varchar(45),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);



