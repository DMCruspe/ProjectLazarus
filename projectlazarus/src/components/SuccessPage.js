import React from 'react';
import '../App.css'; // **ДОБАВЛЕН ЭТОТ ИМПОРТ**
import VersionInfo from './VersionInfo';

const SuccessPage = ({ onNavigate }) => {
    return (
        <div id="success-page" className="page-container">
            <div className="content-box">
                <h2>Вы успешно зарегистрировались!</h2>
                <p>Теперь войдите в систему.</p>
                <button className="btn-primary" onClick={() => onNavigate('login')}>Перейти к входу</button>
            </div>
            <div className="footer">
                <p>Powered by Follow Me</p>
                <VersionInfo />
            </div>
        </div>
    );
};

export default SuccessPage;