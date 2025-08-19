import React from 'react';
import '../App.css';

const DashboardPage = ({ onNavigate }) => {
    return (
        <div id="dashboard-page" className="page-container active">
            <div className="content-box">
                <h2>Добро пожаловать!</h2>
                <p>Вы успешно вошли в систему.</p>
                <button className="btn-primary" onClick={() => onNavigate('main')}>Выйти</button>
            </div>
        </div>
    );
};

export default DashboardPage;