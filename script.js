// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// Music & sound effects

const backgroundMusic = new Audio('Assets/background.mp3');
backgroundMusic.volume = 0.4;
backgroundMusic.loop = true;

const ggs = new Audio('Assets/GameOver.mp3');

const prepare = new Audio('Assets/PrepareForAction.mp3');
prepare.volume=0.9;
prepare.play();

backgroundMusic.pause();


// Play the background music
backgroundMusic.play().catch(error => {
    console.log("Music couldn't play automatically due to browser restrictions:", error);
});

// Game variables
let player, bullets = [], enemies = [], keys = {};

// Handle player input
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);


// Main world values
const gravity = 0.09;
const thrustPower = 0.3;
const maxFallSpeed = 10;
const rotationSpeed = 0.018;
const maxSpeed = 3.6;
const roofHeight = 50;
let score = 0;



function displayScore() {
    // Set font and text style
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    // Draw the text with a white outline
    ctx.strokeText(`Score: ${score}`, canvas.width - 150, 30);
    ctx.fillText(`Score: ${score}`, canvas.width - 150, 30);
}


class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.angle = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.alive = true;
        this.lives = 3; // Set initial lives

        // Load jet icon as an image
        this.jetImage = new Image();
        this.jetImage.src = 'Assets/jet.png';

        // Load heart images
        this.fullHeartImage = new Image();
        this.fullHeartImage.src = 'Assets/heart.png';
        this.emptyHeartImage = new Image();
        this.emptyHeartImage.src = 'Assets/emptyHeart.png';
    }

    update() {
        if (!this.alive) return;

        if (keys['a']) this.angle -= rotationSpeed;

        if (keys['d']) this.angle += rotationSpeed;


        if (keys['w']) {
            this.velocityX += Math.cos(this.angle) * thrustPower;
            this.velocityY += Math.sin(this.angle) * thrustPower;
        }

        // Apply gravity
        this.velocityY += gravity;
        if (this.velocityY > maxFallSpeed) this.velocityY = maxFallSpeed;

        // Limit the maximum speed for the player
        let speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        if (speed > maxSpeed) {
            this.velocityX *= maxSpeed / speed;
            this.velocityY *= maxSpeed / speed;
        }

        // Update position based on velocity
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Prevent player from going off the canvas sides or roof
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
            this.velocityX = 0;
        }
        if (this.y < roofHeight) {
            this.y = roofHeight;
            this.velocityY = 0;
        }
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
        }
    }

    draw() {
        if (!this.alive) return; // Don't draw if player is dead

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw the jet icon if loaded
        if (this.jetImage.complete) {
            ctx.drawImage(this.jetImage, -this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();
    }


}

// Initialize player
player = new Player(canvas.width / 2, canvas.height / 2);

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 8;
        this.radius = 5;
    }
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }
}

// Shooting bullets
window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        bullets.push(new Bullet(player.x, player.y, player.angle));
        const shoot = new Audio('Assets/shoot.mp3');
        shoot.play();
    }
});

// Update bullets in the game loop
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });
}
// Enemy class
class Enemy {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.width = 30;
        this.height = 30;
        this.speed = 1.0;
        this.health = 1;
        this.angle = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.thrustPower = 0.1;
        this.gravity = 0.05;
        this.maxSpeed = 1.5;

        // Load missile image
        this.missileImage = new Image();
        this.missileImage.src = 'Assets/missile.png';
    }

    update() {
        // Calculate angle towards the player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        this.angle = Math.atan2(dy, dx); // Update angle 

        // Thrust forward 
        this.velocityX += Math.cos(this.angle) * this.thrustPower;
        this.velocityY += Math.sin(this.angle) * this.thrustPower;

        // Apply gravity to the vertical velocity
        this.velocityY += this.gravity;

        // Limit maximum speed
        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        if (speed > this.maxSpeed) {
            this.velocityX *= this.maxSpeed / speed;
            this.velocityY *= this.maxSpeed / speed;
        }

        // Update position based 
        this.x += this.velocityX;
        this.y += this.velocityY;


        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
            this.velocityX = 0;
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0;
        }
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.missileImage, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

let lastEnemySpawnTime = 0; // Track last spawn time
const enemySpawnInterval = 10000; // 10 seconds

function spawnRegularEnemies() {
    const currentTime = Date.now();
    if (currentTime - lastEnemySpawnTime >= enemySpawnInterval) {
        let enemy;
        let spawnX, spawnY;
        let distance;

        do {
            // Randomly choose spawn location outside the canvas
            if (Math.random() < 0.5) {
                spawnX = Math.random() < 0.5 ? -50 : canvas.width + 50;
                spawnY = Math.random() * canvas.height;
            } else { // Spawn top/bottom
                spawnY = Math.random() < 0.5 ? -50 : canvas.height + 50;
                spawnX = Math.random() * canvas.width;
            }

            // Create enemy instance
            enemy = new Enemy();

            // Set enemy's initial position
            enemy.x = spawnX;
            enemy.y = spawnY;

            // Calculate distance from the player
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            distance = Math.sqrt(dx * dx + dy * dy);

            const missileDetected = new Audio('Assets/MissileDetected.mp3');
            missileDetected.play();

        } while (distance < 500); // Ensure enough distance from the player

        enemies.push(enemy);
        lastEnemySpawnTime = currentTime; // Update last spawn time
    }
}

// Spawn swarm enemies every 5 seconds
let lastSwarmSpawnTime = 0; // Track last swarm spawn time
const swarmSpawnInterval = 5000; // 5 seconds

function spawnSwarmEnemies() {
    const currentTime = Date.now();
    if (currentTime - lastSwarmSpawnTime >= swarmSpawnInterval) {
        for (let i = 0; i < 3; i++) {
            const swarmEnemy = new SwarmEnemy();
            swarmEnemy.x += Math.random() * 200 - 100;
            swarmEnemy.y += Math.random() * 200 - 100;
            enemies.push(swarmEnemy);
        }
        lastSwarmSpawnTime = currentTime; // Update last swarm spawn time
    }
}


// Chunks
class SwarmEnemy {
    constructor() {
        this.x = Math.random() < 0.5 ? -50 : canvas.width + 50;
        this.y = Math.random() < 0.5 ? -50 : canvas.height + 50;
        this.width = 50;
        this.height = 40;
        this.speed = 0.5;
        this.angle = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = 1;

        // Load a separate image for SwarmEnemy
        this.image = new Image();
        this.image.src = 'Assets/swarmEnemy.png';
    }

    update() {
        // Calculate brief angle
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angleToPlayer = Math.atan2(dy, dx);

        //bit randomness for les presision
        const offset = (Math.random() - 1) * 0.5; // Random offset between -0.25 and 0.25 radians
        this.angle = angleToPlayer + offset;

        // Move towards the player with limited guidance
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        
        if (this.y - this.height / 2 < 0) { // Top boundary
            this.y = this.height / 2;
        } else if (this.y + this.height / 2 > canvas.height) { // Bottom boundary
            this.y = canvas.height - this.height / 2;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;

        // Wrap around if out of canvas bounds
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
        if (this.y < -50) this.y = canvas.height + 50;
        if (this.y > canvas.height + 50) this.y = -50;
    }

    draw() {
        // Keep the image upright without rotating it
        ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}

function checkBulletEnemyCollisions() {
    for (let i = 0; i < enemies.length; i++) {
        for (let j = 0; j < bullets.length; j++) {
            const enemy = enemies[i];
            const bullet = bullets[j];

            // Check if bullet hits the enemy
            const dx = enemy.x - bullet.x;
            const dy = enemy.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < enemy.width / 2 + bullet.width / 2) {
                // Generate blue particles for explosion
                for (let k = 0; k < 20; k++) { // Adjust particle count as needed
                    particles.push(new Particle(enemy.x, enemy.y, 'blue'));
                }

                // Remove bullet and enemy on hit
                bullets.splice(j, 1);
                enemies.splice(i, 1);
                break;
            }
        }
    }
}

// if two missiles colide
function checkMissileCollisions() {
    for (let i = 0; i < enemies.length; i++) {
        for (let j = i + 1; j < enemies.length; j++) {
            if (enemies[i] instanceof Enemy && enemies[j] instanceof Enemy) {
                const dx = enemies[i].x - enemies[j].x;
                const dy = enemies[i].y - enemies[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < enemies[i].width / 2 + enemies[j].width / 2) {
                    // Calculate collision point
                    const collisionX = (enemies[i].x + enemies[j].x) / 2;
                    const collisionY = (enemies[i].y + enemies[j].y) / 2;

                    // Generate orange particles for explosion
                    for (let k = 0; k < 20; k++) { // Adjust particle count as needed
                        particles.push(new Particle(collisionX, collisionY, 'orange'));
                    }

                    score += 660;
                    const explosion = new Audio('Assets/explosion.mp3');
                    explosion.volume = 0.5;
                    explosion.play();

                    // Destroy both missiles
                    enemies.splice(j, 1);
                    enemies.splice(i, 1);
                    break;
                }
            }
        }
    }
}

// Handle swarm enemies bounce
function handleSwarmEnemyBounce() {
    enemies.forEach((swarmEnemy, index) => {
        if (swarmEnemy instanceof SwarmEnemy) {
            for (let j = 0; j < enemies.length; j++) {
                if (j !== index && enemies[j] instanceof SwarmEnemy) {
                    const dx = swarmEnemy.x - enemies[j].x;
                    const dy = swarmEnemy.y - enemies[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < swarmEnemy.width) {
                        // Calculate bounce effect by pushing them away
                        const angle = Math.atan2(dy, dx);
                        const bounceSpeed = 1;

                        swarmEnemy.velocityX += Math.cos(angle) * bounceSpeed;
                        swarmEnemy.velocityY += Math.sin(angle) * bounceSpeed;
                        enemies[j].velocityX -= Math.cos(angle) * bounceSpeed;
                        enemies[j].velocityY -= Math.sin(angle) * bounceSpeed;
                    }
                }
            }
        }
    });
}
// To takle shaking
function handleSwarmEnemyRepulsion() {
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i] instanceof SwarmEnemy) {
            for (let j = i + 1; j < enemies.length; j++) {
                if (enemies[j] instanceof SwarmEnemy) {
                    const dx = enemies[i].x - enemies[j].x;
                    const dy = enemies[i].y - enemies[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // if to close, repulse
                    const minDistance = enemies[i].width;
                    if (distance < minDistance) {
                        const angle = Math.atan2(dy, dx);
                        const repulsionForce = 0.5;

                        // Apply repulsive force to push them apart
                        enemies[i].x += Math.cos(angle) * repulsionForce;
                        enemies[i].y += Math.sin(angle) * repulsionForce;
                        enemies[j].x -= Math.cos(angle) * repulsionForce;
                        enemies[j].y -= Math.sin(angle) * repulsionForce;
                    }
                }
            }
        }
    }
}


class Particle {
    constructor(x, y, color = 'orange') {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1; // Random size
        this.speedX = (Math.random() - 0.5) * 2; // Random horizontal speed
        this.speedY = (Math.random() - 0.5) * 2; // Random vertical speed
        this.alpha = 1; // Full opacity initially
        this.color = color; // Color for the particle
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.02; // Fade out
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    isAlive() {
        return this.alpha > 0; // Particle is alive as long as it has opacity
    }
}

let particles = [];

function updateParticles() {
    particles = particles.filter(particle => particle.isAlive());
    particles.forEach(particle => particle.update());
}

function drawParticles(ctx) {
    particles.forEach(particle => particle.draw(ctx));
}
// Update score every second
let lastScoreUpdateTime = Date.now(); 
const scoreUpdateInterval = 1000; 

function updateScore() {
    score += 20; 
}


// Update enemies in the game loop
function updateEnemies() {
    if (isPaused) return;
    const enemiesToRemove = [];
    const bulletsToRemove = [];

    checkMissileCollisions();
    handleSwarmEnemyRepulsion();

    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();

        // Check for collision with bullets
        bullets.forEach((bullet, bulletIndex) => {
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < enemy.width / 2 + bullet.radius) {
                enemy.health -= 1;
                bulletsToRemove.push(bulletIndex); // Mark bullet for removal

                // Generate particles when enemy is hit
                for (let k = 0; k < 20; k++) { // Adjust particle count as needed
                    particles.push(new Particle(enemy.x, enemy.y, 'blue')); // Use color as needed
                }

                if (enemy.health <= 0) {
                    if (enemy instanceof SwarmEnemy) {
                        score += 100; // 100 points for killing a SwarmEnemy
                        const kill = new Audio('Assets/pop.mp3');
                        kill.volume =0.45;
                        kill.play();
                    } else if (enemy instanceof Enemy) {
                        score += 300; // 300 points for killing a regular enemy
                        const kill = new Audio('Assets/pop.mp3');
                        kill.volume =0.45;
                        kill.play();
                    }
                    enemiesToRemove.push(index);
                }
            }
        });

        // Check for collision with the player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.width / 2 + enemy.width / 2) {
            if (enemy instanceof SwarmEnemy || enemy instanceof Enemy) {
                player.lives -= 1; // Decrement player's life on collision with any enemy
                enemiesToRemove.push(index); 

                const attention = new Audio('Assets/Warning.mp3');
                attention.play();

                for (let k = 0; k < 20; k++) {
                    particles.push(new Particle(player.x, player.y + player.height / 2, 'red')); // Red particles slightly below player
                }

                if (player.lives <= 0) {
                    attention.pause();
                    player.alive = false;
                }
            }
        }
    });

    // Remove bullets that collided with enemies
    bulletsToRemove.forEach((bulletIndex, i) => {
        bullets.splice(bulletIndex - i, 1);
    });

    // Remove enemies that were marked for removal
    enemiesToRemove.forEach((enemyIndex, i) => {
        enemies.splice(enemyIndex - i, 1);
    });
}
// Pausing the game
let isPaused = false; // Variable to track the pause state
let pauseOverlay = null; // Variable to hold the pause overlay

// Function to show the pause menu
function showPauseMenu() {
    if (pauseOverlay) return; // Prevent multiple overlays

    pauseOverlay = document.createElement('div');
    pauseOverlay.id = 'pauseOverlay';
    pauseOverlay.innerText = 'Game Over';
    

    // Add the overlay to the body
    document.body.appendChild(pauseOverlay);

    // Create continue button
    const continueButton = document.createElement('button');
    continueButton.innerText = 'Continue';
    continueButton.id = 'continue';

    continueButton.onclick = () => {
        isPaused = false; // Resume the game
        document.body.removeChild(pauseOverlay); // Remove overlay
        pauseOverlay = null; // Reset overlay variable
    };
    pauseOverlay.appendChild(continueButton);

    // Create restart button
    const restartButton = document.createElement('button');
    restartButton.innerText = 'Restart';
    restartButton.id = 'restart';
    restartButton.onclick = () => {
        location.reload(); // Restart the game
    };
    pauseOverlay.appendChild(restartButton);
}

// Listen for the pause key (e.g., 'p')
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        isPaused = !isPaused; // Toggle paused state
        if (isPaused) {
            showPauseMenu(); // Show the pause menu
            backgroundMusic.pause();
        } else {
            if (pauseOverlay) {
                document.body.removeChild(pauseOverlay); // Remove overlay
                pauseOverlay = null; // Reset overlay variable
                backgroundMusic.play();
            }
        }
    }
    
});


function restartGame() {
    // Reset player, score, and any other game variables
    player = new Player(canvas.width / 2, canvas.height / 2);
    bullets = [];
    enemies = [];
    score = 0;
    player.lives = 3; // Reset lives
    player.alive = true; // Reset player state
}

function displayLives() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    // Draw hearts for lives
    for (let i = 0; i < player.lives; i++) {
        ctx.drawImage(player.fullHeartImage, 10 + i * 30, 10, 25, 25); // Adjust positions as needed
    }
    for (let i = player.lives; i < 3; i++) {
        ctx.drawImage(player.emptyHeartImage, 10 + i * 30, 10, 25, 25); // Adjust positions as needed
    }
}


let gameStartTime = Date.now(); 
const spawnDelay = 3000;
let isGameStarted = false; 

function spawnEnemies() {
    // Start spawning enemies only after the delay
    if (Date.now() - gameStartTime >= spawnDelay) {
        spawnRegularEnemies();
        spawnSwarmEnemies();
    }
}

function handleGameOver() {
    backgroundMusic.pause();
    ggs.play();
    alert("Game over! Your score: " + score);
    let playAgain = confirm("Would you like to play again?");
    if (playAgain) {
        location.reload(); 
    }
}
// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // First, handle particles
    updateParticles();
    drawParticles(ctx);

    // Only update and draw game objects if not paused
    if (!isPaused) {
        updateEnemies();
        // Update player and enemies
        if (player.alive) {
            player.update();
            player.draw();
            spawnEnemies();
            displayLives()

            // Update bullets and enemies
            updateBullets();
            updateEnemies();

            const currentTime = Date.now();
            if (currentTime - lastScoreUpdateTime >= scoreUpdateInterval) {
                updateScore(); // Update score
                lastScoreUpdateTime = currentTime; // Reset the timer
            } 
        }
        else{
            handleGameOver();
            return;
        }

        displayScore(); // Display the score
    }

    requestAnimationFrame(gameLoop);
}


gameLoop();