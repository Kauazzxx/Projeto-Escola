// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 550;

// Load images
const backgroundImage = new Image();
backgroundImage.src = 'background.png';

const playerImage = new Image();
playerImage.src = 'player_ship.png';

const enemyImages = [
    new Image(),
    new Image(),
    new Image()
];
enemyImages[0].src = 'enemy_ship1.png';
enemyImages[1].src = 'enemy_ship2.png';
enemyImages[2].src = 'enemy_ship3.png';

const explosionImage = new Image();
explosionImage.src = 'explosion.png';

// Load sounds
const laserSound = new Audio('laser_sound.mp3');
const explosionSound = new Audio('explosion_sound.mp3');

// Game variables
let score = 0;
let lives = 3;
let gameOver = false;
let animationId;

// Player setup
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 40,
    speed: 8,
    dx: 0
};

// Player bullets
const bullets = [];
const bulletSpeed = 7;
const bulletCooldown = 500; // milliseconds
let lastBulletTime = 0;

// Enemies setup
const enemyRows = 5;
const enemyCols = 10;
const enemyWidth = 40;
const enemyHeight = 30;
const enemyPadding = 15;
const enemyOffsetTop = 60;
const enemyOffsetLeft = 60;
let enemyDirection = 1; // 1 for right, -1 for left
let enemySpeed = 1;
let enemyDropSpeed = 20;
let enemies = [];

// Enemy bullets
const enemyBullets = [];
const enemyBulletSpeed = 3;
const enemyFireRate = 0.005; // Probability of an enemy firing per update

// Explosions
const explosions = [];

// Animation frames for explosion
const explosionFrameWidth = 64; // Width of one explosion frame
const explosionFrameHeight = 64; // Height of one explosion frame
const explosionTotalFrames = 5; // Total number of frames in the explosion sprite

// Create enemies
function createEnemies() {
    enemies = [];
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            enemies.push({
                x: col * (enemyWidth + enemyPadding) + enemyOffsetLeft,
                y: row * (enemyHeight + enemyPadding) + enemyOffsetTop,
                width: enemyWidth,
                height: enemyHeight,
                alive: true,
                type: Math.min(row, 2) // Type based on row for different enemies, max 3 types
            });
        }
    }
}

// Keyboard controls
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Fire bullet with spacebar
    if (e.key === ' ' && !gameOver) {
        const currentTime = Date.now();
        if (currentTime - lastBulletTime > bulletCooldown) {
            bullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
                width: 4,
                height: 15
            });
            lastBulletTime = currentTime;
            
            // Play laser sound
            laserSound.currentTime = 0;
            laserSound.play();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Draw player
function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

// Draw bullets
function drawBullets() {
    ctx.fillStyle = '#00FFFF';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    ctx.fillStyle = '#FF5555';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.alive) {
            ctx.drawImage(
                enemyImages[enemy.type],
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height
            );
        }
    });
}

// Draw explosions
function drawExplosions() {
    explosions.forEach((explosion, index) => {
        // Calculate the current frame to display
        const frameX = Math.floor(explosion.frame) * explosionFrameWidth;
        
        ctx.drawImage(
            explosionImage,
            frameX, 0,
            explosionFrameWidth, explosionFrameHeight,
            explosion.x - explosionFrameWidth/2, explosion.y - explosionFrameHeight/2,
            explosionFrameWidth, explosionFrameHeight
        );
        
        // Update explosion animation
        explosion.frame += 0.2;
        if (explosion.frame >= explosionTotalFrames) {
            explosions.splice(index, 1);
        }
    });
}

// Draw game score and lives
function drawStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// Update player position
function updatePlayer() {
    player.dx = 0;
    
    if (keys['ArrowLeft'] || keys['a']) {
        player.dx = -player.speed;
    }
    
    if (keys['ArrowRight'] || keys['d']) {
        player.dx = player.speed;
    }
    
    player.x += player.dx;
    
    // Keep player within bounds
    if (player.x < 0) {
        player.x = 0;
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

// Update bullets
function updateBullets() {
    // Move player bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        
        // Remove bullets that go off screen
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check for collisions with enemies
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if (enemy.alive && 
                bullets[i] && 
                bullets[i].x < enemy.x + enemy.width &&
                bullets[i].x + bullets[i].width > enemy.x &&
                bullets[i].y < enemy.y + enemy.height &&
                bullets[i].y + bullets[i].height > enemy.y) {
                
                enemy.alive = false;
                bullets.splice(i, 1);
                
                // Play explosion sound
                explosionSound.currentTime = 0;
                explosionSound.play();
                
                // Add points based on enemy type
                score += (4 - enemy.type) * 10;
                
                // Create explosion
                explosions.push({
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height / 2,
                    frame: 0 // Start at first frame
                });
                
                break;
            }
        }
    }
    
    // Move enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += enemyBulletSpeed;
        
        // Remove bullets that go off screen
        if (enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
            continue;
        }
        
        // Check for collision with player
        if (enemyBullets[i] && 
            enemyBullets[i].x < player.x + player.width &&
            enemyBullets[i].x + enemyBullets[i].width > player.x &&
            enemyBullets[i].y < player.y + player.height &&
            enemyBullets[i].y + enemyBullets[i].height > player.y) {
            
            enemyBullets.splice(i, 1);
            lives--;
            
            // Play explosion sound
            explosionSound.currentTime = 0;
            explosionSound.play();
            
            // Create explosion for player hit
            explosions.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                frame: 0 // Start at first frame
            });
            
            if (lives <= 0) {
                gameOver = true;
                document.getElementById('gameOver').classList.remove('hidden');
                document.getElementById('finalScore').textContent = score;
            }
        }
    }
}

// Update enemies
function updateEnemies() {
    let moveDown = false;
    let aliveEnemies = enemies.filter(enemy => enemy.alive);
    
    if (aliveEnemies.length === 0) {
        // Level completed
        createEnemies();
        enemySpeed += 0.2;
        return;
    }
    
    // Find leftmost and rightmost enemies
    let leftmost = canvas.width;
    let rightmost = 0;
    
    aliveEnemies.forEach(enemy => {
        leftmost = Math.min(leftmost, enemy.x);
        rightmost = Math.max(rightmost, enemy.x + enemy.width);
    });
    
    // Check if enemies hit the edge
    if (rightmost >= canvas.width - 10 || leftmost <= 10) {
        enemyDirection *= -1;
        moveDown = true;
    }
    
    // Move enemies
    enemies.forEach(enemy => {
        if (enemy.alive) {
            enemy.x += enemySpeed * enemyDirection;
            if (moveDown) {
                enemy.y += enemyDropSpeed;
            }
            
            // Check if enemy reaches the bottom
            if (enemy.y + enemy.height >= player.y) {
                gameOver = true;
                document.getElementById('gameOver').classList.remove('hidden');
                document.getElementById('finalScore').textContent = score;
            }
            
            // Random enemy firing
            if (Math.random() < enemyFireRate) {
                enemyBullets.push({
                    x: enemy.x + enemy.width / 2 - 2,
                    y: enemy.y + enemy.height,
                    width: 4,
                    height: 10
                });
            }
        }
    });
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    
    if (!gameOver) {
        // Update game objects
        updatePlayer();
        updateBullets();
        updateEnemies();
        
        // Draw game objects
        drawPlayer();
        drawBullets();
        drawEnemies();
        drawExplosions();
        drawStats();
        
        // Continue animation
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Start game function
function startGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    bullets.length = 0;
    enemyBullets.length = 0;
    explosions.length = 0;
    
    createEnemies();
    document.getElementById('gameOver').classList.add('hidden');
    
    // Start game loop
    cancelAnimationFrame(animationId);
    gameLoop();
}

// Restart button
document.getElementById('restartButton').addEventListener('click', startGame);

// Initialize the game
startGame();