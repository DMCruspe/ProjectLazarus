import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import VersionInfo from './VersionInfo';

const MainPage = () => {
    return (
        <div id="main-page" className="page-container">
            <h1 className="site-title">Название сайта</h1>
            <div className="content-box">
                <Link to="/login" className="btn">Войти в систему</Link>
                <Link to="/register" className="btn">Присоединиться</Link>
                <Link to="/database" className="btn database-btn">База Данных</Link>
            </div>
            <div className="footer">
                <p>Powered by Follow Me</p>
                <VersionInfo />
            </div>
        </div>
    );
};

export default MainPage;