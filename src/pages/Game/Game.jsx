import React, { useEffect, useRef, useState } from 'react';
import "./game.css"

const Game = () => {
    const canvasRef = useRef(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [divePos, setDivePos] = useState('top');
    let gravity = 0.20;
    const jumpStrength = -10;
    let spikeSpeed = 1.1;
    let velocityY = 1.8;

    let cube = {
        x: 40,
        y: 40,
        width: 40,
        height: 40,
        color: "#1d4de8",
        rotationAngle: 0,
        isRotating: false,
        rotationStartTime: 0,
        isJump: false
    };
    let spikes = [];
    let spikesBottom = [];

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

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        let roadHeight = canvas.height / 2;
        const minSpikeSpacing = 180;
        let divepos = 'top';

        const handleDiveBottom = () => {
            if (!isGameOver && cube.y <= roadHeight + 24) {
                velocityY = -jumpStrength;
                cube.isRotating = true;
                cube.rotationStartTime = Date.now();
                setDivePos('bottom');
                divepos = 'bottom';
                cube.isJump = true;
            }
        };

        const handleDiveTop = () => {
            if (!isGameOver && cube.y >= roadHeight - 24) {
                velocityY = jumpStrength;
                cube.isRotating = true;
                cube.rotationStartTime = Date.now();
                setDivePos('top');
                divepos = 'top';
                cube.isJump = true;
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'ArrowDown') {
                handleDiveBottom();
            } else if (event.key === 'ArrowUp') {
                handleDiveTop();
            }
        };

        let startY = 0;

        const handleTouchStart = (event) => {
            startY = event.touches[0].clientY;
        };

        const handleTouchEnd = (event) => {
            const endY = event.changedTouches[0].clientY;
            const diffY = startY - endY;

            if (Math.abs(diffY) > 30) {
                if (diffY > 0) {
                    handleDiveTop();
                } else {
                    handleDiveBottom();
                }
            }
        };

        const update = () => {
            if (isGameOver) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setScore((prevScore) => prevScore + 1 / 120);

            if (cube.isRotating) {
                cube.color = "#61c761";
            } else {
                cube.color = "#1d4de8";
            }

            ctx.beginPath();
            ctx.moveTo(0, roadHeight);
            ctx.lineTo(canvas.width, roadHeight);
            ctx.strokeStyle = "#191919";
            ctx.lineWidth = 6;
            ctx.stroke();

            // Existing velocity update with gravity
            velocityY += gravity;
            cube.y += velocityY;

            // Stick to road based on `divepos`
            if (divepos === 'top' && cube.y > roadHeight - cube.height + 20) {
                cube.y = roadHeight - cube.height + 20;
                velocityY = 0;
                cube.isJump = false;
            } else if (divepos === 'bottom' && cube.y < roadHeight + cube.height - 18) {
                cube.y = roadHeight + cube.height - 18;
                velocityY = 0;
                cube.isJump = false;
            }

            ctx.save();
            ctx.translate(cube.x + cube.width / 2, cube.y - 20 + cube.height / 2);
            if (cube.isRotating) {
                cube.rotationAngle -= 0.025;
            }
            ctx.rotate(cube.rotationAngle);

            ctx.fillStyle = cube.color;
            ctx.fillRect(-cube.width / 2, -cube.height / 2, cube.width, cube.height);
            ctx.restore();

            if (cube.isRotating && Date.now() - cube.rotationStartTime > 950) {
                cube.isRotating = false;
                cube.isJump = false;
                cube.rotationAngle = 0;
            }

            function updateAndFilterSpikes(spikesArray, spikeSpeed, roadHeight, spikeDirection) {
                spikesArray = spikesArray.map((spike) => ({ ...spike, x: spike.x - spikeSpeed }));
                spikesArray = spikesArray.filter((spike) => spike.x > -20);

                if (spikesArray.length < 9) {
                    const lastSpikeX = spikesArray[spikesArray.length - 1]?.x || 0;
                    const maxAttempts = 10;
                    let newSpikeX;
                    let attempts = 0;

                    do {
                        newSpikeX = lastSpikeX + minSpikeSpacing + Math.random() * 100 + Math.random() * 50;
                        attempts++;
                    } while (newSpikeX - lastSpikeX < minSpikeSpacing && attempts < maxAttempts);

                    if (attempts < maxAttempts) {
                        const newY = roadHeight + spikeDirection * -30;
                        spikesArray.push({ x: newSpikeX, y: newY });
                        if (Math.random() < 0.3) {
                            const pairSpikeX = newSpikeX + 20;
                            spikesArray.push({ x: pairSpikeX, y: newY });
                        }
                    }
                }

                return spikesArray;
            }

            function drawSpikes(ctx, spikesArray, spikeDirection) {
                ctx.fillStyle = "red";
                spikesArray.forEach((spike) => {
                    ctx.beginPath();
                    ctx.moveTo(spike.x, spike.y);
                    ctx.lineTo(spike.x + 10, spike.y + spikeDirection * 30);
                    ctx.lineTo(spike.x - 10, spike.y + spikeDirection * 30);
                    ctx.closePath();
                    ctx.fill();
                });
            }

            // spikes = updateAndFilterSpikes(spikes, spikeSpeed, roadHeight, -1);
            // spikesBottom = updateAndFilterSpikes(spikesBottom, spikeSpeed, roadHeight, 1);
            //
            // drawSpikes(ctx, spikes, -1);
            // drawSpikes(ctx, spikesBottom, 1);

            for (let spike of [...spikes, ...spikesBottom]) {
                if (checkCollision(cube.x, spike)) {
                    setIsGameOver(true);
                    return;
                }
            }

            spikeSpeed += 0.0002;

            requestAnimationFrame(update);
        };
        update();

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isGameOver]);

    return (
        <div className={'game-container'}>
            <header className="header">
                <h1 id="title">Game</h1>
                <span id="score">Score: {Math.trunc(score)}</span>
                <span id="dive">{divePos}</span>
            </header>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default Game;
