import React, {useState, useEffect, useRef} from 'react';
import "./testgame.css";

const TestGame = () => {
  const canvasRef = useRef(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0); // Счётчик очков
  const gravity = 0.4; // сила притяжения дороги
  const jumpStrength = -12; // сила прыжка кубика
  const spikeSpeed = 2; // Скорость шипов
  let velocityY = 1;  // начальная скорость кубика

  let cube = {
    x: 40,
    y: 60,
    width: 40,
    height: 40,
    color: "#1d4ed8",
    rotationAngle: 0,
    isRotating: false,
    rotationStartTime: 0
  }
  let spikes = [];

  // Проверка столкновения с шипами
  const checkCollision = (cubeX, spike) => {
    const spikeTop = spike.y;
    const spikeBottom = spike.y + 30;
    const spikeLeft = spike.x - 10;
    const spikeRight = spike.x + 10;
    const cubeBottom = cube.y + 30;
    const cubeRight = cubeX + 30;

    return (
        cubeBottom >= spikeTop &&
        cube.y <= spikeBottom &&
        cubeRight >= spikeLeft &&
        cubeX <= spikeRight
    );
  };

  // Основной эффект для обновления игры
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    let roadHeight = canvas.height / 2;
    const minSpikeSpacing = 180; // Минимальное расстояние между шипами
    console.log(roadHeight)


    // Обработчик прыжка
    const handleJump = () => {
      // Если игра не завершена и кубик на земле, то выполняем прыжок
      if (!isGameOver && cube.y >= roadHeight - 20) {
        velocityY = jumpStrength; // Задаем начальную скорость прыжка
      }
    };


    const update = () => {
      if (isGameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Обновляем счетчик очков
      setScore(prevScore => prevScore + 1 / 120);
      // setTotalScore(prevTotalScore => prevTotalScore + 0.008333333)

      // Отрисовка дороги
      ctx.beginPath();
      ctx.moveTo(0, roadHeight);
      ctx.lineTo(canvas.width, roadHeight);
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Обновление положения кубика
      velocityY += gravity;
      cube.y += velocityY;

      if (cube.y > roadHeight + 25) {
        cube.y = roadHeight + 25;
        velocityY = 0;
      }

      // Отрисовка кубика
      ctx.fillStyle = cube.color;
      ctx.fillRect(cube.x, cube.y - 20, 40, 40);


      // Движение шипов влево
      spikes = spikes.map(spike => ({...spike, x: spike.x - spikeSpeed}));

      // Проверка столкновения с шипами
      for (let spike of spikes) {
        if (checkCollision(cube.x, spike)) {
          setIsGameOver(true);
          return;
        }
      }

      // Отрисовка шипов (привязаны к дороге)
      ctx.fillStyle = "red";
      spikes.forEach(spike => {
        ctx.beginPath();
        ctx.moveTo(spike.x, spike.y);
        ctx.lineTo(spike.x + 10, spike.y + 30);
        ctx.lineTo(spike.x - 10, spike.y + 30);
        ctx.closePath();
        ctx.fill();
      });

      // Перезапуск шипов (если они вышли за пределы экрана)
      spikes = spikes.filter(spike => spike.x > -20);
      if (spikes.length < 7) {
        const lastSpikeX = spikes[spikes.length - 1]?.x || 0;
        const maxAttempts = 10; // Ограничение на количество попыток
        let newSpikeX;
        let attempts = 0;

        // Пытаемся создать новый шип на безопасном расстоянии от последнего
        do {
          newSpikeX = canvas.width + Math.random() * 100;
          attempts++;
        } while (newSpikeX - lastSpikeX < minSpikeSpacing && attempts < maxAttempts);

        // Добавляем новый шип, если удалось найти корректное положение
        if (attempts < maxAttempts) {
          spikes.push({x: newSpikeX, y: roadHeight - 30});
        }
      }

      requestAnimationFrame(update);
    };

    update();

    // Добавляем обработчик клика по canvas для прыжка
    canvas.addEventListener('click', handleJump);

    // Удаляем обработчик при размонтировании
    return () => {
      canvas.removeEventListener('click', handleJump);
    };
  }, [isGameOver]);


  return (
      <div>
        <canvas ref={canvasRef}/>
        <p id={'score'}>Score: {Math.trunc(score)}</p>
      </div>
  );
};

export default TestGame;