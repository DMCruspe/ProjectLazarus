// src/components/MainPage.js
import React from 'react';
import '../App.css'; 

const MainPage = ({ onNavigate }) => {
    return (
        <div id="main-page" className="page-container">
            <h1 className="site-title">Название сайта</h1>
            <div className="content-box">
                <button className="btn" onClick={() => onNavigate('login')}>Войти в систему</button>
                <button className="btn" onClick={() => onNavigate('register')}>Присоединиться</button>
                <a href="/database.html" className="btn database-btn">База Данных</a>
            </div>
            <div className="footer">
                <p>Powered by Follow Me</p>
                <VersionInfo />
            </div>
        </div>
    );
};

export default MainPage;