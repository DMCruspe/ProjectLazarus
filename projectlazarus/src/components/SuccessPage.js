import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import VersionInfo from './VersionInfo';

const SuccessPage = () => {
    const navigate = useNavigate();

    return (
        <div id="success-page" className="page-container">
            <div className="content-box">
                <h2>Вы успешно зарегистрировались!</h2>
                <p>Теперь войдите в систему.</p>
                <button className="btn-primary" onClick={() => navigate('/login')}>
                    Перейти к входу
                </button>
            </div>
            <div className="footer">
                <p>Powered by Follow Me</p>
                <VersionInfo />
            </div>
        </div>
    );
};

export default SuccessPage;