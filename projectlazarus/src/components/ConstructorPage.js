import React, { useState, useEffect } from 'react';
import '../App.css';
import VersionInfo from './VersionInfo';

const ConstructorPage = ({ onNavigate }) => {
    const [user, setUser] = useState(null);
    const [activeForm, setActiveForm] = useState(null);
    const [players, setPlayers] = useState([]);
    const [symptoms, setSymptoms] = useState([]);

    useEffect(() => {
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        const credits = localStorage.getItem('credits');

        if (!username || (role !== 'admin' && role !== 'superadmin')) {
            alert('Доступ запрещён.');
            onNavigate('dashboard');
            return;
        }

        setUser({ username, role, credits });
    }, [onNavigate]);

    useEffect(() => {
        if (user) {
            fetchPlayers();
        }
        // eslint-disable-next-line
    }, [user]);

    const fetchPlayers = async () => {
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterUsername: user.username })
            });
            const playersList = await response.json();
            setPlayers(playersList);
        } catch (error) {
            console.error('Ошибка при загрузке списка игроков:', error);
        }
    };

    const fetchSymptoms = async () => {
        try {
            const response = await fetch('/api/symptoms/list');
            const symptomsList = await response.json();
            setSymptoms(symptomsList);
        } catch (error) {
            console.error('Ошибка при загрузке списка симптомов:', error);
        }
    };

    const handleFormSubmit = async (e, endpoint, data) => {
        e.preventDefault();
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                alert(result.message);
                if (endpoint.includes('symptom')) {
                    fetchSymptoms();
                }
            } else {
                alert('Ошибка: ' + result.message);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка.');
        }
    };

    const handleDeleteSymptom = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот симптом?')) {
            try {
                const response = await fetch('/api/symptom/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    fetchSymptoms();
                } else {
                    alert('Ошибка: ' + result.message);
                }
            } catch (error) {
                console.error('Ошибка при удалении симптома:', error);
                alert('Произошла ошибка при удалении.');
            }
        }
    };

    const renderForm = () => {
        switch (activeForm) {
            case 'create-task':
                return (
                    <form className="constructor-form" onSubmit={(e) => handleFormSubmit(e, '/api/tasks/create', {
                        requesterUsername: user.username,
                        title: e.target.title.value,
                        taskType: e.target.taskType.value,
                        description: e.target.description.value,
                        reward: parseInt(e.target.reward.value),
                        performer: e.target.performer.value
                    })}>
                        <h2>Создание нового задания</h2>
                        <div className="form-row">
                            <label>Название задания:</label>
                            <input type="text" name="title" required />
                        </div>
                        <div className="form-row">
                            <label>Вид задания:</label>
                            <select name="taskType" required>
                                <option value="изучение болезни">Изучение болезни</option>
                                <option value="изучение территории">Изучение территории</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Описание:</label>
                            <textarea name="description" required></textarea>
                        </div>
                        <div className="form-row">
                            <label>Награда (R):</label>
                            <input type="number" name="reward" min="0" required />
                        </div>
                        <div className="form-row">
                            <label>Исполнитель:</label>
                            <select name="performer">
                                <option value="All">Все</option>
                                {players.map(p => <option key={p.username} value={p.username}>{p.username}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="nav-button">Создать</button>
                    </form>
                );
            case 'create-disease':
                return (
                    <form className="constructor-form" onSubmit={(e) => handleFormSubmit(e, '/api/disease/create', {
                        name: e.target.name.value,
                        type: e.target.type.value,
                        symptoms: e.target.symptoms.value,
                        spread: e.target.spread.value,
                        resistance: e.target.resistance.value,
                        vulnerabilities: e.target.vulnerabilities.value,
                        treatment: e.target.treatment.value,
                        vaccine: e.target.vaccine.value,
                    })}>
                        <h2>Создание новой болезни</h2>
                        <div className="form-row"><label>Название:</label><input type="text" name="name" required /></div>
                        <div className="form-row"><label>Тип:</label><select name="type"><option value="">-- Выберите тип --</option><option value="вирус">Вирус</option><option value="бактерия">Бактерия</option><option value="грибок">Грибок</option><option value="паразит">Паразит</option><option value="прион">Прион</option></select></div>
                        <div className="form-row"><label>Симптомы:</label><textarea name="symptoms"></textarea></div>
                        <div className="form-row"><label>Распространение:</label><input type="text" name="spread" /></div>
                        <div className="form-row"><label>Устойчивость:</label><textarea name="resistance"></textarea></div>
                        <div className="form-row"><label>Уязвимости:</label><textarea name="vulnerabilities"></textarea></div>
                        <div className="form-row"><label>Лечение:</label><textarea name="treatment"></textarea></div>
                        <div className="form-row"><label>Вакцина:</label><input type="text" name="vaccine" /></div>
                        <button type="submit" className="nav-button">Создать</button>
                    </form>
                );
            case 'create-vaccine':
                return (
                    <form className="constructor-form" onSubmit={(e) => handleFormSubmit(e, '/api/vaccine/create', {
                        name: e.target.name.value,
                        diseaseName: e.target.diseaseName.value,
                        dosage: e.target.dosage.value,
                        effectiveness: e.target.effectiveness.value,
                        sideEffects: e.target.sideEffects.value,
                    })}>
                        <h2>Создание новой вакцины</h2>
                        <div className="form-row"><label>Название:</label><input type="text" name="name" required /></div>
                        <div className="form-row"><label>Название Болезни:</label><input type="text" name="diseaseName" required /></div>
                        <div className="form-row"><label>Дозировка:</label><input type="text" name="dosage" required /></div>
                        <div className="form-row"><label>Эффективность (%):</label><input type="number" name="effectiveness" min="0" max="100" required /></div>
                        <div className="form-row"><label>Побочные эффекты:</label><textarea name="sideEffects"></textarea></div>
                        <button type="submit" className="nav-button">Создать</button>
                    </form>
                );
            case 'symptoms':
                const groupedSymptoms = symptoms.reduce((groups, symptom) => {
                    const group = symptom.subgroup || 'Без подгруппы';
                    if (!groups[group]) {
                        groups[group] = [];
                    }
                    groups[group].push(symptom);
                    return groups;
                }, {});

                const sortedGroups = Object.keys(groupedSymptoms).sort();

                return (
                    <>
                        <h2>Управление симптомами</h2>
                        <div id="symptoms-list-container">
                            {sortedGroups.length > 0 ? (
                                sortedGroups.map(groupName => (
                                    <React.Fragment key={groupName}>
                                        <h3>{groupName}</h3>
                                        {groupedSymptoms[groupName]
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(symptom => (
                                                <div key={symptom._id} className="symptom-card">
                                                    <h4>{symptom.name}</h4>
                                                    <button className="delete-symptom-btn" onClick={() => handleDeleteSymptom(symptom._id)}>
                                                        Удалить
                                                    </button>
                                                </div>
                                            ))}
                                    </React.Fragment>
                                ))
                            ) : (
                                <p>Список симптомов пуст.</p>
                            )}
                        </div>
                        <h3>Добавить новый симптом</h3>
                        <form className="constructor-form" onSubmit={(e) => handleFormSubmit(e, '/api/symptom/add', {
                            name: e.target.symptomName.value,
                            subgroup: e.target.symptomGroup.value
                        })}>
                            <div className="form-row">
                                <label>Название симптома:</label>
                                <input type="text" name="symptomName" required />
                            </div>
                            <div className="form-row">
                                <label>Подгруппа:</label>
                                <input type="text" name="symptomGroup" required />
                            </div>
                            <button type="submit" className="nav-button">Добавить</button>
                        </form>
                    </>
                );
            default:
                return <h2>Выберите действие</h2>;
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="constructor-page">
            <header className="header">
                <h1>Конструктор</h1>
                <div className="header-info">
                    <div className="header-credits">
                        <span id="credits">{user.credits} R</span>
                    </div>
                </div>
            </header>
            <div className="constructor-container">
                <aside className="left-panel">
                    <h2>Навигация</h2>
                    <nav>
                        <button className="nav-button" onClick={() => setActiveForm('create-task')}>Создать задание</button>
                        <button className="nav-button" onClick={() => setActiveForm('create-disease')}>Создать болезнь</button>
                        <button className="nav-button" onClick={() => setActiveForm('create-vaccine')}>Создать вакцину</button>
                        <button className="nav-button" onClick={() => { setActiveForm('symptoms'); fetchSymptoms(); }}>Симптомы</button>
                        <button className="nav-button" onClick={() => onNavigate('dashboard')}>Назад</button>
                    </nav>
                    <div className="version-info-container">
                        <VersionInfo />
                    </div>
                </aside>
                <main className="constructor-panel">
                    {renderForm()}
                </main>
            </div>
        </div>
    );
};

export default ConstructorPage;
// ...existing code...