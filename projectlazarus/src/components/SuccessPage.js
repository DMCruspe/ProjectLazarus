// src/components/SuccessPage.js
import React from 'react';

const SuccessPage = ({ onNavigate }) => {
    return (
        <div id="success-page" className="page-container active">
            <div className="content-box">
                <h2>Вы успешно зарегистрировались!</h2>
                <p>Теперь войдите в систему.</p>
                <button className="btn-primary" onClick={() => onNavigate('login')}>Перейти к входу</button>
            </div>
            <div className="footer">
                <p>Powered by Follow Me</p>
                <p className="app-version">Version alpha ...</p>
            </div>
        </div>
    );
};

export default SuccessPage;