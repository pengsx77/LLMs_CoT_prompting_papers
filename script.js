// 获取DOM元素
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');

// 游戏配置
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = 7;

// 游戏状态
let gameRunning = false;
let gamePaused = false;
let score = 0;
let gameLoop;

// 蛇的初始位置和速度
let snake = [
    { x: 5, y: 5 }
];
let velocityX = 0;
let velocityY = 0;
let nextVelocityX = 0;
let nextVelocityY = 0;

// 食物位置
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};

// 游戏主循环
function gameUpdate() {
    if (gamePaused) return;
    
    moveSnake();
    
    // 检查游戏结束条件
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    checkFood();
    
    // 清空画布
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制食物
    drawFood();
    
    // 绘制蛇
    drawSnake();
}

// 移动蛇
function moveSnake() {
    // 更新速度
    velocityX = nextVelocityX;
    velocityY = nextVelocityY;
    
    // 移动蛇头
    const head = { 
        x: snake[0].x + velocityX, 
        y: snake[0].y + velocityY 
    };
    
    snake.unshift(head);
    
    // 如果没有吃到食物，移除蛇尾
    if (!(head.x === food.x && head.y === food.y)) {
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 检查是否吃到食物
function checkFood() {
    const head = snake[0];
    
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 每100分增加速度
        if (score % 100 === 0) {
            speed += 1;
        }
        
        // 生成新食物
        generateFood();
    }
}

// 生成新食物
function generateFood() {
    // 生成随机位置
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // 检查食物是否在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        // 蛇头和蛇身使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#4CAF50';
        } else {
            ctx.fillStyle = '#8BC34A';
        }
        
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
        
        // 添加蛇眼睛（只在蛇头上）
        if (index === 0) {
            ctx.fillStyle = 'white';
            
            // 根据移动方向调整眼睛位置
            if (velocityX === 1) { // 向右
                ctx.fillRect(segment.x * gridSize + gridSize * 0.7, segment.y * gridSize + gridSize * 0.3, gridSize * 0.2, gridSize * 0.2);
                ctx.fillRect(segment.x * gridSize + gridSize * 0.7, segment.y * gridSize + gridSize * 0.7, gridSize * 0.2, gridSize * 0.2);
            } else if (velocityX === -1) { // 向左
                ctx.fillRect(segment.x * gridSize + gridSize * 0.1, segment.y * gridSize + gridSize * 0.3, gridSize * 0.2, gridSize * 0.2);
                ctx.fillRect(segment.x * gridSize + gridSize * 0.1, segment.y * gridSize + gridSize * 0.7, gridSize * 0.2, gridSize * 0.2);
            } else if (velocityY === -1) { // 向上
                ctx.fillRect(segment.x * gridSize + gridSize * 0.3, segment.y * gridSize + gridSize * 0.1, gridSize * 0.2, gridSize * 0.2);
                ctx.fillRect(segment.x * gridSize + gridSize * 0.7, segment.y * gridSize + gridSize * 0.1, gridSize * 0.2, gridSize * 0.2);
            } else if (velocityY === 1) { // 向下
                ctx.fillRect(segment.x * gridSize + gridSize * 0.3, segment.y * gridSize + gridSize * 0.7, gridSize * 0.2, gridSize * 0.2);
                ctx.fillRect(segment.x * gridSize + gridSize * 0.7, segment.y * gridSize + gridSize * 0.7, gridSize * 0.2, gridSize * 0.2);
            }
        }
    });
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;
    const radius = gridSize / 2 - 1;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
}

// 游戏开始
function startGame() {
    if (gameRunning && !gamePaused) return;
    
    if (!gameRunning) {
        // 重置游戏状态
        resetGame();
        gameRunning = true;
        startButton.textContent = '重新开始';
    }
    
    gamePaused = false;
    pauseButton.textContent = '暂停';
    
    // 启动游戏循环
    clearInterval(gameLoop);
    gameLoop = setInterval(gameUpdate, 1000 / speed);
}

// 暂停游戏
function pauseGame() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        pauseButton.textContent = '继续';
        clearInterval(gameLoop);
    } else {
        pauseButton.textContent = '暂停';
        gameLoop = setInterval(gameUpdate, 1000 / speed);
    }
}

// 重置游戏
function resetGame() {
    snake = [{ x: 5, y: 5 }];
    velocityX = 0;
    velocityY = 0;
    nextVelocityX = 0;
    nextVelocityY = 0;
    score = 0;
    speed = 7;
    scoreElement.textContent = score;
    generateFood();
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    // 显示游戏结束信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.font = '20px Arial';
    ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    
    startButton.textContent = '重新开始';
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    // 防止按键导致页面滚动
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    // 如果游戏未开始，按任意方向键开始
    if (!gameRunning && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        startGame();
    }
    
    // 控制方向
    switch (e.key) {
        case 'ArrowUp':
            if (velocityY !== 1) { // 防止反向移动
                nextVelocityX = 0;
                nextVelocityY = -1;
            }
            break;
        case 'ArrowDown':
            if (velocityY !== -1) {
                nextVelocityX = 0;
                nextVelocityY = 1;
            }
            break;
        case 'ArrowLeft':
            if (velocityX !== 1) {
                nextVelocityX = -1;
                nextVelocityY = 0;
            }
            break;
        case 'ArrowRight':
            if (velocityX !== -1) {
                nextVelocityX = 1;
                nextVelocityY = 0;
            }
            break;
        case ' ': // 空格键暂停/继续
            if (gameRunning) {
                pauseGame();
            } else {
                startGame();
            }
            break;
    }
});

// 按钮事件监听
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
restartButton.addEventListener('click', () => {
    resetGame();
    startGame();
});

// 初始化游戏
resetGame();
drawSnake();
drawFood();

// 添加触摸控制支持
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (!gameRunning) {
        startGame();
    }
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    // 确定滑动方向
    if (Math.abs(dx) > Math.abs(dy)) {
        // 水平滑动
        if (dx > 0 && velocityX !== -1) {
            nextVelocityX = 1;
            nextVelocityY = 0;
        } else if (dx < 0 && velocityX !== 1) {
            nextVelocityX = -1;
            nextVelocityY = 0;
        }
    } else {
        // 垂直滑动
        if (dy > 0 && velocityY !== -1) {
            nextVelocityX = 0;
            nextVelocityY = 1;
        } else if (dy < 0 && velocityY !== 1) {
            nextVelocityX = 0;
            nextVelocityY = -1;
        }
    }
    
    touchStartX = touchEndX;
    touchStartY = touchEndY;
    e.preventDefault();
});