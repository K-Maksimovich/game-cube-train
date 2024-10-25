import React, { useState, useEffect } from 'react';
import "./testgame.css";

const TestGame = () => {
  const [cubePosition, setCubePosition] = useState('top'); // Позиция кубика: top или bottom
  const [cubeAngle, setCubeAngle] = useState(0); // Угол вращения кубика вокруг круга
  const [cubeRadius, setCubeRadius] = useState(150); // Радиус вращения кубика
  const [obstacles, setObstacles] = useState([]); // Массив препятствий
  const [isGameOver, setIsGameOver] = useState(false); // Состояние игры
  const [score, setScore] = useState(0); // Счёт
  const [isFlipping, setIsFlipping] = useState(false); // Анимация кувырка
  const [isCircleMode, setIsCircleMode] = useState(false); // Режим круга

  // Обработка прыжка (изменение позиции кубика и активация кувырка)
  const handleJump = () => {
    if (isGameOver || isCircleMode) return; // В круговом режиме прыжок не нужен

    setIsFlipping(true);
    setCubePosition(prevPosition => (prevPosition === 'top' ? 'bottom' : 'top'));

    setTimeout(() => setIsFlipping(false), 300); // Анимация кувырка 0.3 секунды
  };

  // Добавляем обработчик клика для всей области экрана
  useEffect(() => {
    const handleScreenClick = () => handleJump();
    window.addEventListener('click', handleScreenClick);

    return () => {
      window.removeEventListener('click', handleScreenClick);
    };
  }, [isGameOver, isCircleMode]);

  // Логика трансформации в круг при достижении 1000 очков
  useEffect(() => {
    if (score >= 1000 && !isCircleMode) {
      setIsCircleMode(true); // Переход в круговой режим
    }
  }, [score]);

  // Вращение кубика вокруг круга в круговом режиме
  useEffect(() => {
    if (!isCircleMode) return;

    const cubeRotationInterval = setInterval(() => {
      setCubeAngle(prevAngle => (prevAngle + 3) % 360); // Вращение кубика по кругу
    }, 30); // Скорость вращения

    return () => clearInterval(cubeRotationInterval);
  }, [isCircleMode]);

  // Обновление позиции препятствий
  useEffect(() => {
    if (isGameOver) return;

    const obstacleInterval = setInterval(() => {
      setObstacles(prevObstacles => {
        const newObstacles = prevObstacles.map(obstacle => ({
          ...obstacle,
          position: obstacle.position - 10 // Смещаем препятствие влево
        }));

        // Добавляем новое препятствие
        if (newObstacles.length === 0 || newObstacles[newObstacles.length - 1].position < window.innerWidth - 300) {
          newObstacles.push({
            id: Math.random(),
            position: window.innerWidth,
            type: Math.random() > 0.5 ? 'top' : 'bottom' // Препятствие на верхней или нижней части
          });
        }

        // Проверка на столкновение
        const collision = newObstacles.some(
            obstacle => obstacle.position < 60 && obstacle.position > 0 && obstacle.type === cubePosition
        );

        if (collision) {
          setIsGameOver(true);
          clearInterval(obstacleInterval);
        } else {
          setScore(prevScore => prevScore + 1);
        }

        return newObstacles.filter(obstacle => obstacle.position > 0); // Удаляем препятствия, которые вышли за экран
      });
    }, 100); // Частота обновления

    return () => clearInterval(obstacleInterval);
  }, [cubePosition, isGameOver]);

  // Рендеринг
  return (
      <div className="game-container">
      </div>
  );
};

export default TestGame;