import React, { useState } from 'react';
import './style-lab.css';

const LabPage = () => {
  const [activeGame, setActiveGame] = useState('');
  const [labWelcome, setLabWelcome] = useState('Добро пожаловать в лабораторию!');
  // Пример состояний для мини-игр
  const [symptoms, setSymptoms] = useState(['', '', '']);
  const [spreadPath, setSpreadPath] = useState('воздушно-капельный');
  const [factor, setFactor] = useState('влажность');
  const [percentage, setPercentage] = useState(50);

  return (
    <div>
      <div className="header">
        <h1 className="page-title">Лаборатория</h1>
        <div className="header-credits">
          <span id="credits">...</span>
        </div>
      </div>
      <div className="container">
        <aside className="left-panel">
          <h2>Навигация</h2>
          <nav>
            <button onClick={() => setActiveGame('symptoms')} className="nav-button">Узнать симптомы</button>
            <button onClick={() => setActiveGame('spread')} className="nav-button">Моделирование распространения</button>
            <button onClick={() => setActiveGame('vulnerability')} className="nav-button">Поиск уязвимостей</button>
            <button onClick={() => setActiveGame('vaccine')} className="nav-button">Создать вакцину</button>
            <button onClick={() => setActiveGame('identify')} className="nav-button">Определить тип</button>
            <button onClick={() => window.location.href = '/'} className="nav-button">Назад</button>
          </nav>
        </aside>
        <main className="center-panel lab-panel">
          <h2 id="lab-welcome-message">{labWelcome}</h2>

          {/* Мини-игра: Исследование симптомов */}
          {activeGame === 'symptoms' && (
            <div className="game-card">
              <h3>Мини-игра: Исследование симптомов</h3>
              <p>Нажмите "Начать исследование", чтобы провести серию исследований. Ваша задача — найти повторяющиеся симптомы. Их может быть от 2 до 3.</p>
              <div>
                <button className="nav-button">Начать исследование</button>
              </div>
              <div>
                <h4>Введите найденные симптомы:</h4>
                <div>
                  {symptoms.map((s, i) => (
                    <input
                      key={i}
                      type="text"
                      className="symptom-input"
                      placeholder={`Симптом ${i + 1}`}
                      value={s}
                      onChange={e => {
                        const arr = [...symptoms];
                        arr[i] = e.target.value;
                        setSymptoms(arr);
                      }}
                    />
                  ))}
                </div>
                <button className="nav-button">Проверить</button>
              </div>
              <div></div>
              <button className="nav-button" style={{ display: 'none' }}>Повторить исследование</button>
            </div>
          )}

          {/* Мини-игра: Моделирование распространения */}
          {activeGame === 'spread' && (
            <div className="game-card">
              <h3>Мини-игра: Моделирование распространения</h3>
              <p>Исследуйте различные пути передачи, чтобы найти основной способ распространения болезни.</p>
              <div>
                <label htmlFor="spread-path-select">Выберите путь передачи:</label>
                <select
                  id="spread-path-select"
                  value={spreadPath}
                  onChange={e => setSpreadPath(e.target.value)}
                >
                  <option value="воздушно-капельный">Воздушно-капельный</option>
                  <option value="контактный">Контактный</option>
                  <option value="через-воду">Через воду</option>
                  <option value="через-пищу">Через пищу</option>
                </select>
                <button className="nav-button">Исследовать</button>
              </div>
              <div></div>
              <div style={{ display: 'none' }}>
                <h4>Подтвердите основной путь передачи:</h4>
                <button className="nav-button">Подтвердить</button>
              </div>
              <div></div>
              <button className="nav-button" style={{ display: 'none' }}>Повторить исследование</button>
            </div>
          )}

          {/* Мини-игра: Поиск уязвимостей */}
          {activeGame === 'vulnerability' && (
            <div className="game-card">
              <h3>Мини-игра: Поиск уязвимостей</h3>
              <p>Выберите фактор и укажите его процентное значение, чтобы определить, к чему вирус уязвим или устойчив.</p>
              <div>
                <label htmlFor="vulnerability-factor-select">Выберите фактор для исследования:</label>
                <select
                  id="vulnerability-factor-select"
                  value={factor}
                  onChange={e => setFactor(e.target.value)}
                >
                  <option value="влажность">Реакция на влажность</option>
                  <option value="свет">Реакция на свет</option>
                  <option value="радиация">Реакция на радиацию</option>
                  <option value="температура">Реакция на температуру</option>
                </select>
                <div>
                  <label htmlFor="factor-percentage">Укажите процент фактора (от 1 до 100):</label>
                  <input
                    type="number"
                    id="factor-percentage"
                    min="1"
                    max="100"
                    value={percentage}
                    onChange={e => setPercentage(e.target.value)}
                  />
                </div>
                <button className="nav-button">Исследовать</button>
              </div>
              <div></div>
              <div style={{ display: 'none' }}>
                <h4>Укажите уязвимые и устойчивые факторы:</h4>
                <div>
                  <label htmlFor="vulnerable-factors">Уязвимые факторы:</label>
                  <input type="text" id="vulnerable-factors" placeholder="Введите через запятую" />
                  <label htmlFor="resistant-factors">Устойчивые факторы:</label>
                  <input type="text" id="resistant-factors" placeholder="Введите через запятую" />
                </div>
                <button className="nav-button">Проверить</button>
              </div>
              <div></div>
              <button className="nav-button" style={{ display: 'none' }}>Повторить</button>
            </div>
          )}

          {/* Мини-игра: Создание вакцины */}
          {activeGame === 'vaccine' && (
            <div className="game-card">
              <h3>Мини-игра: Создание вакцины</h3>
              <p>Выберите два препарата из списка, чтобы объединить их. Ваша цель — создать вакцину, которая полностью уничтожит вирус, при этом её побочные эффекты и доза не должны быть слишком высокими.</p>
              <div>
                <h4>Доступные препараты:</h4>
                <div className="compound-list"></div>
                <div>
                  <h4>Объединить:</h4>
                  <div>
                    <span>Препарат 1</span> + <span>Препарат 2</span>
                  </div>
                  <button className="nav-button">Объединить</button>
                </div>
              </div>
              <div></div>
              <div></div>
              <button className="nav-button" style={{ display: 'none' }}>Начать заново</button>
            </div>
          )}

          {/* Мини-игра: Определи тип болезни */}
          {activeGame === 'identify' && (
            <div className="game-card">
              <h2>Определи тип болезни</h2>
              <div>
                <p>Загрузка...</p>
              </div>
              <button className="nav-button" style={{ display: 'none' }}>Следующая игра</button>
            </div>
          )}
        </main>
      </div>
      <div className="footer">
        <p>Powered by Follow Me</p>
        <p className="app-version">Version alpha ...</p>
      </div>
    </div>
  );
};

export default LabPage;