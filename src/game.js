let canvas;
let ctx;

let player;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let score = 0;
let lives = 3;
let isGameOver = false;

const playerWidth = 40;
const playerHeight = 20;
const playerSpeed = 5;

const enemyWidth = 30;
const enemyHeight = 20;
const enemyRows = 3;
const enemyCols = 8;
const enemySpacingX = 40;
const enemySpacingY = 30;
let enemyDirection = 1; // 1 for right, -1 for left
let enemyMoveDown = false;

const bulletWidth = 5;
const bulletHeight = 10;
const bulletSpeed = 7;
const enemyBulletSpeed = 3;

function initGame() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  player = {
    x: canvas.width / 2 - playerWidth / 2,
    y: canvas.height - playerHeight - 10,
    width: playerWidth,
    height: playerHeight,
    speed: playerSpeed,
  };

  createEnemies();
  document.addEventListener('keydown', handleKeyDown);
  requestAnimationFrame(gameLoop);
}

function createEnemies() {
    enemies = [];
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            const enemy = {
                x: col * enemySpacingX + 50,
                y: row * enemySpacingY + 30,
                width: enemyWidth,
                height: enemyHeight,
                alive: true
            };
            enemies.push(enemy);
        }
    }
}

function handleKeyDown(event) {
  if (isGameOver) {
    if (event.key === 'r') {
      resetGame();
    }
    return;
  }
  if (event.key === 'ArrowLeft') {
    player.x -= player.speed;
    if (player.x < 0) {
      player.x = 0;
    }
  } else if (event.key === 'ArrowRight') {
    player.x += player.speed;
    if (player.x + player.width > canvas.width) {
      player.x = canvas.width - player.width;
    }
  } else if (event.key === ' ') {
    fireBullet();
  }
}

function fireBullet() {
  const bullet = {
    x: player.x + player.width / 2 - bulletWidth / 2,
    y: player.y,
    width: bulletWidth,
    height: bulletHeight,
    speed: bulletSpeed,
  };
  bullets.push(bullet);
}

function update() {
    updateBullets();
    updateEnemies();
    updateEnemyBullets();
    checkCollisions();
    checkGameOver();
}

function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].y -= bullets[i].speed;
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
      i--;
    }
  }
}

function updateEnemies() {
    let edgeReached = false;
    for (const enemy of enemies) {
        if (enemy.alive) {
            enemy.x += enemyDirection * 2; // Constant speed
            if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
                edgeReached = true;
            }
        }
    }

    if (edgeReached) {
        enemyDirection *= -1;
        enemyMoveDown = true;
    }

    if (enemyMoveDown) {
        for (const enemy of enemies) {
            if(enemy.alive) {
                enemy.y += enemySpacingY / 2;
            }
        }
        enemyMoveDown = false;
    }

    if (Math.random() < 0.005) { // Reduced firing rate
        fireEnemyBullet();
    }
}

function fireEnemyBullet() {
  const aliveEnemies = enemies.filter(e => e.alive);
  if (aliveEnemies.length > 0) {
    const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    const bullet = {
      x: randomEnemy.x + randomEnemy.width / 2 - bulletWidth / 2,
      y: randomEnemy.y + randomEnemy.height,
      width: bulletWidth,
      height: bulletHeight,
      speed: enemyBulletSpeed,
    };
    enemyBullets.push(bullet);
  }
}

function updateEnemyBullets() {
    for (let i = 0; i < enemyBullets.length; i++) {
        enemyBullets[i].y += enemyBullets[i].speed;
        if (enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
            i--;
        }
    }
}

function checkCollisions() {
    // Player bullets hitting enemies
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j].alive && isColliding(bullets[i], enemies[j])) {
                bullets.splice(i, 1);
                enemies[j].alive = false;
                score += 10;
                i--;
                break; // Important to break out of the inner loop
            }
        }
    }

    // Enemy bullets hitting player
    for (let i = 0; i < enemyBullets.length; i++) {
        if (isColliding(enemyBullets[i], player)) {
            enemyBullets.splice(i, 1);
            lives--;
            i--;
            if (lives <= 0) {
                isGameOver = true;
            }
        }
    }
}

function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function checkGameOver() {
    if (lives <= 0 || enemies.every(enemy => !enemy.alive))
    {
        isGameOver = true;
    }

    // Check if enemies reached the player
    for (const enemy of enemies) {
        if (enemy.alive && enemy.y + enemy.height >= player.y) {
            isGameOver = true;
            break;
        }
    }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawEnemies();
  drawBullets();
  drawEnemyBullets();
  drawScore();
  drawLives();

  if (isGameOver) {
    drawGameOver();
  }
}

function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawEnemies() {
  ctx.fillStyle = 'red';
  for (const enemy of enemies) {
    if (enemy.alive) {
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
  }
}

function drawBullets() {
  ctx.fillStyle = 'white';
  for (const bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

function drawEnemyBullets() {
    ctx.fillStyle = 'yellow';
    for (const bullet of enemyBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText('Score: ' + score, 10, 20);
}

function drawLives() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Lives: ' + lives, canvas.width - 70, 20);
}

function drawGameOver() {
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2);
  ctx.font = '20px Arial';
  ctx.fillText("Press 'R' to Restart", canvas.width/2 - 80, canvas.height/2 + 30)
}

function resetGame() {
    isGameOver = false;
    score = 0;
    lives = 3;
    bullets = [];
    enemyBullets = [];
    player.x = canvas.width / 2 - playerWidth / 2;
    createEnemies();
}

function gameLoop() {
  if (!isGameOver) {
    update();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

export { initGame };
