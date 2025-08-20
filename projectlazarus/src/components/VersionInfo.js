import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Используем axios для запросов

const VersionInfo = () => {
    const [version, setVersion] = useState('...'); // Начальное состояние версии

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const response = await axios.get('/api/version');
                setVersion(response.data.version); // Обновляем состояние с версией из API
            } catch (error) {
                console.error('Ошибка при получении версии:', error);
                setVersion('Unknown'); // Устанавливаем "Unknown" в случае ошибки
            }
        };

        fetchVersion();
    }, []); // Пустой массив зависимостей означает, что эффект запустится один раз после первого рендера

    return (
        <p className="app-version">
            Build {version}
        </p>
    );
};

export default VersionInfo;