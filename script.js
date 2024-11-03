// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
        this.jetImage.src = 'jet.png'; 
        
        // Load heart images
        this.fullHeartImage = new Image();
        this.fullHeartImage.src = 'heart.png'; 
        this.emptyHeartImage = new Image();
        this.emptyHeartImage.src = 'emptyHeart.png';
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
        this.speed = 1.7; 
        this.health = 1;
        this.angle = 0; 
        this.velocityX = 0; 
        this.velocityY = 0; 
        this.thrustPower = 0.1; 
        this.gravity = 0.05; 
        this.maxSpeed = 2.5; 

        // Load missile image
        this.missileImage = new Image();
        this.missileImage.src = 'missile.png'; 
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



// Spawning enemies every few seconds
setInterval(() => {
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
        distance = Math.sqrt(dx * dx + dy * dy); // Calculate distance here
        
    } while (distance < 500); 

    enemies.push(enemy);
}, 10000);

// Chunks
class SwarmEnemy {
    constructor() {
        this.x = Math.random() < 0.5 ? -50 : canvas.width + 50;
        this.y = Math.random() < 0.5 ? -50 : canvas.height + 50;
        this.width = 40;
        this.height = 40;
        this.speed = 1;
        this.angle = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = 1; 

        // Load a separate image for SwarmEnemy
        this.image = new Image();
        this.image.src = 'swarmEnemy.png';
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


// Spawn SwarmEnemies
setInterval(() => {
    for (let i = 0; i < 3; i++) {
        const swarmEnemy = new SwarmEnemy();
        swarmEnemy.x += Math.random() * 200 - 100; 
        swarmEnemy.y += Math.random() * 200 - 100;
        enemies.push(swarmEnemy);
    }
}, 5000);

// if two missiles colide
function handleMissileCollisions() {
    for (let i = 0; i < enemies.length; i++) {
        for (let j = i + 1; j < enemies.length; j++) {
            if (enemies[i] instanceof Enemy && enemies[j] instanceof Enemy) {
                const dx = enemies[i].x - enemies[j].x;
                const dy = enemies[i].y - enemies[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < enemies[i].width / 2 + enemies[j].width / 2) {
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


// Update enemies in the game loop
function updateEnemies() {
    const enemiesToRemove = [];
    const bulletsToRemove = [];

    handleMissileCollisions(); // Call missile collision 
    handleSwarmEnemyRepulsion(); // Call swarm enemy repulsion 

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
                if (enemy.health <= 0) {
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
                player.lives -= 1; 
                enemiesToRemove.push(index); 

                if (player.lives <= 0) {
                    player.alive = false;
                    alert('Game Over');
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

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (player.alive) {
        player.update();
        player.draw();

        // Draw hearts to represent player lives
        for (let i = 0; i < 3; i++) {
            const heartImage = (i < player.lives) ? player.fullHeartImage : player.emptyHeartImage;
            ctx.drawImage(heartImage, 10 + (i * 40), 10, 30, 30); 
        }
    }

    updateBullets();
    updateEnemies();

    requestAnimationFrame(gameLoop);
}


gameLoop();