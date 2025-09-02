// src/components/DatabasePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DatabasePage = ({ onNavigate, user }) => {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndDisplayDiseases = async () => {
            try {
                // Теперь используем GET-запрос к новому публичному эндпоинту
                const response = await axios.get('/api/diseases/list-public');
                setDiseases(response.data);
                setLoading(false);
                setError(null);
            } catch (err) {
                console.error('Ошибка при загрузке базы данных:', err);
                setError('Ошибка при загрузке базы данных.');
                setLoading(false);
            }
        };

        fetchAndDisplayDiseases();
    }, []); // Зависимости нет, так как запрос не зависит от пропсов пользователя.

    const handleDeleteDisease = async (diseaseId) => {
        if (!user || !user.username) {
             alert('Для удаления болезни необходимо войти в систему.');
             return;
        }

        if (window.confirm('Вы уверены, что хотите удалить эту болезнь?')) {
            try {
                const response = await axios.post('/api/disease/delete', {
                    diseaseId: diseaseId,
                    requesterUsername: user.username,
                });
                alert(response.data.message);
                setDiseases(diseases.filter(d => d._id !== diseaseId));
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Произошла ошибка при удалении.';
                alert(`Ошибка: ${errorMessage}`);
            }
        }
    };

    const handleShowVaccine = async (vaccineName) => {
        try {
            const response = await axios.post('/api/vaccine/info', { name: vaccineName });
            const vaccine = response.data;
            alert(`Информация о вакцине "${vaccine.name}":\n\n` +
                `Болезнь: ${vaccine.diseaseName}\n` +
                `Дозировка: ${vaccine.dosage}\n` +
                `Эффективность: ${vaccine.effectiveness}%\n` +
                `Побочные эффекты: ${vaccine.sideEffects || 'Нет'}`);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Произошла ошибка при получении информации о вакцине.';
            alert(`Ошибка: ${errorMessage}`);
        }
    };

    const renderDiseaseList = () => {
        if (loading) {
            return <p>Загрузка...</p>;
        }
        if (error) {
            return <p>{error}</p>;
        }
        if (diseases.length === 0) {
            return <p>База данных болезней пуста.</p>;
        }

        return diseases.map(disease => (
            <div key={disease._id} className="task-card">
                {/* Кнопка "Удалить" отображается только если user существует и его роль 'admin' или 'superadmin' */}
                {user && ['admin', 'superadmin'].includes(user.role) && (
                    <button className="delete-btn" onClick={() => handleDeleteDisease(disease._id)}>
                        Удалить
                    </button>
                )}
                <h3>{disease.name} ({disease.type})</h3>
                <p><strong>Симптомы:</strong> {disease.symptoms}</p>
                <p><strong>Распространение:</strong> {disease.spread}</p>
                <p><strong>Устойчивость:</strong> {disease.resistance}</p>
                <p><strong>Уязвимости:</strong> {disease.vulnerabilities}</p>
                <p><strong>Лечение:</strong> {disease.treatment}</p>
                <p><strong>Вакцина:</strong> {disease.vaccine || 'Нет'}</p>
                {disease.vaccine && (
                    <button className="show-vaccine-btn" onClick={() => handleShowVaccine(disease.vaccine)}>
                        Показать вакцину
                    </button>
                )}
            </div>
        ));
    };

    return (
        <div className="page-container">
            <div className="header">
                <h1 className="page-title">База данных болезней</h1>
                <div className="header-credits">
                    <span id="credits">{user?.credits} R</span>
                </div>
            </div>
            <div className="container">
                <aside className="left-panel">
                    <h2>Навигация</h2>
                    <nav>
                        <button className="nav-button" onClick={() => onNavigate('dashboard')}>Назад</button>
                    </nav>
                </aside>
                <main className="center-panel">
                    <div id="disease-list-container" className="list-container">
                        {renderDiseaseList()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DatabasePage;