import React, { useState, useEffect } from 'react';
import "./testgame.css";

const TestGame = () => {
  const [cubePosition, setCubePosition] = useState('top'); // Позиция кубика: top или bottom
  const [obstacles, setObstacles] = useState([]); // Массив препятствий
  const [isGameOver, setIsGameOver] = useState(false); // Состояние игры
  const [score, setScore] = useState(0); // Счёт
  const [isFlipping, setIsFlipping] = useState(false); // Анимация кувырка

  // Обработка прыжка (изменение позиции кубика и активация кувырка)
  const handleJump = () => {
    if (isGameOver) return;

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
  }, [isGameOver]);

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
    }, 100); // Увеличиваем частоту обновления для динамики

    return () => clearInterval(obstacleInterval);
  }, [cubePosition, isGameOver]);

  // Рендеринг
  return (
    <div className="game-container">
      <div className="line"></div>
      <div
        className={`cube ${cubePosition} ${isFlipping ? 'flipping' : ''}`}
      ></div>
      {obstacles.map(obstacle => (
        <div
          key={obstacle.id}
          className={`obstacle ${obstacle.type}`}
          style={{ left: `${obstacle.position}px` }}
        ></div>
      ))}
      <div className="score">Score: {score}</div>
      {isGameOver && <div className="game-over">Game Over</div>}
    </div>
  );
};

export default TestGame;