class GalaxyGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.health = 3;
        this.maxHealth = 3;
        this.level = 1;
        this.enemiesKilled = 0;
        this.enemiesPerLevel = 5;
        this.isBossLevel = false;
        this.bossActive = false;
        this.levelTransition = false;
        this.transitionTimer = 0;
        this.upgradeMenuOpen = false;
        this.selectedUpgrade = 0;
        
        // Level restart system
        this.currentLevelStart = 1;
        this.levelStartScore = 0;
        this.levelStartUpgrades = {};
        this.hasStartedGame = false;
        
        // Player
        this.player = {
            x: this.width / 2,
            y: this.height - 100,
            width: 30,
            height: 30,
            speed: 5,
            color: '#00ff88'
        };
        
        // Game objects
        this.stars = [];
        this.asteroids = [];
        this.particles = [];
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.bosses = [];
        this.bossBullets = [];
        
        // Shooting
        this.lastShot = 0;
        this.shootCooldown = 150; // milliseconds
        
        // Upgrade system
        this.upgrades = {
            rapidFire: 0,        // Levels 0-3: Reduces shoot cooldown
            multiShot: 0,        // Levels 0-2: Adds extra bullets
            damage: 0,           // Levels 0-3: Increases bullet damage
            health: 0,           // Levels 0-2: Increases max health
            speed: 0,            // Levels 0-3: Increases movement speed
            shield: 0,           // Levels 0-1: Adds temporary invincibility
            autoHeal: 0,         // Levels 0-1: Slowly regenerates health
            scoreMultiplier: 0   // Levels 0-2: Increases score gained
        };
        
        this.availableUpgrades = [
            {
                name: 'Rapid Fire',
                key: 'rapidFire',
                maxLevel: 3,
                costs: [200, 500, 1000],
                descriptions: [
                    'Faster shooting (25% faster)',
                    'Much faster shooting (50% faster)', 
                    'Ultra rapid fire (75% faster)'
                ]
            },
            {
                name: 'Multi Shot',
                key: 'multiShot',
                maxLevel: 2,
                costs: [300, 800],
                descriptions: [
                    'Shoot 3 bullets at once',
                    'Shoot 5 bullets at once'
                ]
            },
            {
                name: 'Increased Damage',
                key: 'damage',
                maxLevel: 3,
                costs: [250, 600, 1200],
                descriptions: [
                    'Bullets do 2x damage',
                    'Bullets do 3x damage',
                    'Bullets do 4x damage'
                ]
            },
            {
                name: 'Extra Health',
                key: 'health',
                maxLevel: 2,
                costs: [400, 1000],
                descriptions: [
                    'Increase max health to 4',
                    'Increase max health to 5'
                ]
            },
            {
                name: 'Speed Boost',
                key: 'speed',
                maxLevel: 3,
                costs: [150, 400, 800],
                descriptions: [
                    'Move 25% faster',
                    'Move 50% faster',
                    'Move 75% faster'
                ]
            },
            {
                name: 'Shield Generator',
                key: 'shield',
                maxLevel: 1,
                costs: [800],
                descriptions: [
                    'Press S for 3-second invincibility (30s cooldown)'
                ]
            },
            {
                name: 'Auto Repair',
                key: 'autoHeal',
                maxLevel: 1,
                costs: [600],
                descriptions: [
                    'Slowly regenerate health over time'
                ]
            },
            {
                name: 'Score Multiplier',
                key: 'scoreMultiplier',
                maxLevel: 2,
                costs: [500, 1500],
                descriptions: [
                    'Earn 50% more points',
                    'Earn 100% more points'
                ]
            }
        ];
        
        // Shield system
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldCooldown = 0;
        
        // Auto heal system
        this.lastHeal = 0;
        
        // Input handling
        this.keys = {};
        
        // Audio system
        this.audioContext = null;
        this.soundEnabled = true;
        
        // Initialize
        this.initAudio();
        this.createStars();
        this.setupControls();
        this.gameLoop();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.soundEnabled = false;
        }
    }
    
    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        
        switch (type) {
            case 'shoot':
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
                
            case 'explosion':
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
                
            case 'damage':
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;
                
            case 'gameOver':
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.8);
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                oscillator.start(now);
                oscillator.stop(now + 0.8);
                break;
        }
    }
    
    playEnemyShootSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        
        // Different sound for enemy shooting (lower pitch)
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }
    
    playBossSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        
        // Deep, menacing boss arrival sound
        oscillator.frequency.setValueAtTime(100, now);
        oscillator.frequency.exponentialRampToValueAtTime(80, now + 1.0);
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
        oscillator.start(now);
        oscillator.stop(now + 1.0);
    }
    
    createStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 0.5
            });
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                // Resume audio context on first user interaction
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                if (!this.gameRunning) {
                    this.startGame();
                } else {
                    this.shoot();
                }
            }
            if (e.key.toLowerCase() === 'm') {
                this.toggleSound();
            }
            if (e.key.toLowerCase() === 'u') {
                this.toggleUpgradeMenu();
            }
            if (e.key.toLowerCase() === 's' && this.gameRunning && this.upgrades.shield > 0) {
                this.activateShield();
            }
            if (e.key.toLowerCase() === 'r' && !this.gameRunning) {
                this.resetGame();
            }
            // Upgrade menu navigation
            if (this.upgradeMenuOpen) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.selectedUpgrade = Math.max(0, this.selectedUpgrade - 1);
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.selectedUpgrade = Math.min(this.availableUpgrades.length - 1, this.selectedUpgrade + 1);
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.purchaseUpgrade(this.selectedUpgrade);
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.upgradeMenuOpen = false;
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    startGame() {
        this.gameRunning = true;
        
        if (!this.hasStartedGame) {
            // First time starting - reset everything
            this.score = 0;
            this.level = 1;
            this.currentLevelStart = 1;
            this.levelStartScore = 0;
            this.levelStartUpgrades = {};
            this.hasStartedGame = true;
            
            // Reset upgrades
            Object.keys(this.upgrades).forEach(key => {
                this.upgrades[key] = 0;
            });
            
            this.maxHealth = 3;
            this.player.speed = 5;
        } else {
            // Restarting after death - restore level start state
            this.score = this.levelStartScore;
            this.level = this.currentLevelStart;
            
            // Restore upgrades from level start
            Object.keys(this.levelStartUpgrades).forEach(key => {
                this.upgrades[key] = this.levelStartUpgrades[key];
            });
            
            // Reapply upgrade effects
            this.maxHealth = 3 + this.upgrades.health;
            this.player.speed = 5 + (this.upgrades.speed * 1.25);
        }
        
        this.health = this.maxHealth;
        this.enemiesKilled = 0;
        this.enemiesPerLevel = 5 + this.level;
        this.isBossLevel = (this.level % 3 === 0);
        this.bossActive = false;
        this.levelTransition = false;
        this.transitionTimer = 0;
        this.upgradeMenuOpen = false;
        
        // Reset player position
        this.player.x = this.width / 2;
        this.player.y = this.height - 100;
        
        // Clear game objects
        this.asteroids = [];
        this.particles = [];
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.bosses = [];
        this.bossBullets = [];
        this.lastShot = 0;
        
        // Reset shield system
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldCooldown = 0;
        this.lastHeal = 0;
        
        this.updateUI();
    }
    
    shoot() {
        const now = Date.now();
        const cooldown = this.shootCooldown * (1 - (this.upgrades.rapidFire * 0.25));
        
        if (now - this.lastShot > cooldown) {
            const bulletCount = this.upgrades.multiShot === 0 ? 1 : 
                               this.upgrades.multiShot === 1 ? 3 : 5;
            
            for (let i = 0; i < bulletCount; i++) {
                let offsetX = 0;
                if (bulletCount > 1) {
                    offsetX = (i - Math.floor(bulletCount / 2)) * 15;
                }
                
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 2 + offsetX,
                    y: this.player.y,
                    width: 4,
                    height: 10,
                    speed: 8,
                    color: '#ffff00',
                    damage: 1 + this.upgrades.damage
                });
            }
            
            this.lastShot = now;
            this.playSound('shoot');
        }
    }
    
    spawnAsteroid() {
        if (Math.random() < 0.02) { // 2% chance each frame
            this.asteroids.push({
                x: Math.random() * (this.width - 40),
                y: -40,
                width: 20 + Math.random() * 30,
                height: 20 + Math.random() * 30,
                speed: 2 + Math.random() * 3,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    spawnEnemy() {
        // Don't spawn regular enemies during boss levels or level transitions
        if (this.isBossLevel || this.levelTransition || this.bossActive) return;
        
        // Increase spawn rate based on level
        const spawnRate = 0.008 + (this.level * 0.002);
        
        if (Math.random() < spawnRate) {
            this.enemies.push({
                x: Math.random() * (this.width - 40),
                y: -40,
                width: 25,
                height: 25,
                speed: 1 + Math.random() * 2 + (this.level * 0.3),
                health: 2 + Math.floor(this.level / 3), // More health at higher levels
                lastShot: 0,
                shootCooldown: Math.max(500, 1500 - (this.level * 50)), // Faster shooting at higher levels
                color: '#ff4444',
                movePattern: Math.random() < 0.5 ? 'straight' : 'zigzag',
                zigzagOffset: 0
            });
        }
    }
    
    spawnBoss() {
        if (this.bossActive) return;
        
        this.bossActive = true;
        const bossType = (this.level <= 5) ? 'basic' : (this.level <= 10) ? 'advanced' : 'ultimate';
        
        const boss = {
            x: this.width / 2 - 50,
            y: -100,
            width: 100,
            height: 80,
            speed: 1,
            health: 15 + (this.level * 5),
            maxHealth: 15 + (this.level * 5),
            lastShot: 0,
            shootCooldown: 800,
            color: '#ff0088',
            type: bossType,
            phase: 1,
            movePattern: 'entrance',
            targetX: this.width / 2 - 50,
            targetY: 100,
            actionTimer: 0,
            isActive: false
        };
        
        this.bosses.push(boss);
        this.playBossSound();
        
        // Clear level transition so boss can function properly
        this.levelTransition = false;
        this.transitionTimer = 0;
    }
    
    checkLevelProgression() {
        // Every 3rd level is a boss level
        if (this.level % 3 === 0 && !this.isBossLevel && !this.bossActive) {
            this.isBossLevel = true;
            this.levelTransition = true;
            this.transitionTimer = 180; // 3 seconds at 60fps
            
            // Save state before boss level for restarts
            this.saveLevelStartState();
        } else if (!this.isBossLevel && this.enemiesKilled >= this.enemiesPerLevel) {
            this.levelTransition = true;
            this.transitionTimer = 120; // 2 seconds
        }
    }
    
    nextLevel() {
        this.level++;
        this.enemiesKilled = 0;
        this.enemiesPerLevel = 5 + this.level;
        this.isBossLevel = false;
        this.bossActive = false;
        this.levelTransition = false;
        this.transitionTimer = 0;
        
        // Save level start state for potential restart
        this.saveLevelStartState();
        
        // Clear remaining enemies and bullets
        this.enemies = [];
        this.enemyBullets = [];
        this.bosses = [];
        this.bossBullets = [];
        
        this.updateUI();
    }
    
    saveLevelStartState() {
        // Save current progress as new checkpoint
        this.currentLevelStart = this.level;
        this.levelStartScore = this.score;
        
        // Save current upgrades state
        this.levelStartUpgrades = {};
        Object.keys(this.upgrades).forEach(key => {
            this.levelStartUpgrades[key] = this.upgrades[key];
        });
    }
    
    updatePlayer() {
        if (!this.gameRunning) return;
        
        // Update shield timer
        if (this.shieldActive) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
            }
        }
        
        // Update shield cooldown
        if (this.shieldCooldown > 0) {
            this.shieldCooldown--;
        }
        
        // Auto heal system
        if (this.upgrades.autoHeal > 0) {
            const now = Date.now();
            if (now - this.lastHeal > 3000 && this.health < this.maxHealth) { // Heal every 3 seconds
                this.health++;
                this.lastHeal = now;
                this.updateUI();
            }
        }
        
        // Movement (affected by speed upgrade)
        const speed = this.player.speed;
        if ((this.keys['a'] || this.keys['arrowleft']) && this.player.x > 0) {
            this.player.x -= speed;
        }
        if ((this.keys['d'] || this.keys['arrowright']) && this.player.x < this.width - this.player.width) {
            this.player.x += speed;
        }
        if ((this.keys['w'] || this.keys['arrowup']) && this.player.y > 0) {
            this.player.y -= speed;
        }
        if ((this.keys['s'] || this.keys['arrowdown']) && this.player.y < this.height - this.player.height) {
            this.player.y += speed;
        }
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = -5;
                star.x = Math.random() * this.width;
            }
        });
    }
    
    updateBullets() {
        if (!this.gameRunning) return;
        
        this.bullets.forEach((bullet, bulletIndex) => {
            bullet.y -= bullet.speed;
            
            // Remove bullets that are off screen
            if (bullet.y < -10) {
                this.bullets.splice(bulletIndex, 1);
                return;
            }
            
            // Check collision with asteroids
            this.asteroids.forEach((asteroid, asteroidIndex) => {
                if (this.checkCollision(bullet, asteroid)) {
                    // Remove bullet and asteroid
                    this.bullets.splice(bulletIndex, 1);
                    this.asteroids.splice(asteroidIndex, 1);
                    
                    // Create explosion effect
                    this.createExplosion(asteroid.x + asteroid.width/2, asteroid.y + asteroid.height/2);
                    
                    // Play explosion sound
                    this.playSound('explosion');
                    
                    // Increase score for destroying asteroid
                    const baseScore = 50;
                    const multiplier = 1 + (this.upgrades.scoreMultiplier * 0.5);
                    this.score += Math.floor(baseScore * multiplier);
                    this.updateUI();
                }
            });
            
            // Check collision with enemies
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    // Remove bullet
                    this.bullets.splice(bulletIndex, 1);
                    
                    // Damage enemy
                    enemy.health -= bullet.damage || 1;
                    
                    if (enemy.health <= 0) {
                        // Remove enemy
                        this.enemies.splice(enemyIndex, 1);
                        
                        // Create explosion effect
                        this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        
                        // Play explosion sound
                        this.playSound('explosion');
                        
                        // Increase score and track kills
                        const baseScore = 100;
                        const multiplier = 1 + (this.upgrades.scoreMultiplier * 0.5);
                        this.score += Math.floor(baseScore * multiplier);
                        this.enemiesKilled++;
                        this.updateUI();
                    }
                }
            });
            
            // Check collision with bosses
            this.bosses.forEach((boss, bossIndex) => {
                if (this.checkCollision(bullet, boss)) {
                    // Remove bullet
                    this.bullets.splice(bulletIndex, 1);
                    
                    // Damage boss
                    boss.health -= bullet.damage || 1;
                    
                    // Create smaller explosion effect for hit
                    this.createExplosion(bullet.x, bullet.y, 5);
                    
                    if (boss.health <= 0) {
                        // Remove boss
                        this.bosses.splice(bossIndex, 1);
                        
                        // Create massive explosion effect
                        this.createExplosion(boss.x + boss.width/2, boss.y + boss.height/2, 20);
                        
                        // Play explosion sound
                        this.playSound('explosion');
                        
                        // Increase score for destroying boss
                        const baseScore = 500 + (this.level * 100);
                        const multiplier = 1 + (this.upgrades.scoreMultiplier * 0.5);
                        this.score += Math.floor(baseScore * multiplier);
                        this.bossActive = false;
                        this.updateUI();
                        
                        // Progress to next level after boss defeat
                        setTimeout(() => {
                            this.nextLevel();
                        }, 1000);
                    }
                }
            });
        });
    }
    
    updateEnemies() {
        if (!this.gameRunning) return;
        
        const now = Date.now();
        
        this.enemies.forEach((enemy, index) => {
            // Movement patterns
            if (enemy.movePattern === 'zigzag') {
                enemy.zigzagOffset += 0.1;
                enemy.x += Math.sin(enemy.zigzagOffset) * 2;
            }
            
            enemy.y += enemy.speed;
            
            // Keep enemies within screen bounds
            if (enemy.x < 0) enemy.x = 0;
            if (enemy.x > this.width - enemy.width) enemy.x = this.width - enemy.width;
            
            // Remove enemies that are off screen
            if (enemy.y > this.height + 50) {
                this.enemies.splice(index, 1);
                return;
            }
            
            // Enemy shooting logic
            if (now - enemy.lastShot > enemy.shootCooldown) {
                // Calculate angle to player
                const dx = (this.player.x + this.player.width/2) - (enemy.x + enemy.width/2);
                const dy = (this.player.y + this.player.height/2) - (enemy.y + enemy.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Only shoot if player is somewhat in front and within range
                if (dy > 0 && distance < 300) {
                    this.enemyBullets.push({
                        x: enemy.x + enemy.width/2 - 2,
                        y: enemy.y + enemy.height,
                        width: 4,
                        height: 8,
                        speedX: (dx / distance) * 3,
                        speedY: (dy / distance) * 3,
                        color: '#ff6666'
                    });
                    
                    enemy.lastShot = now;
                    // Vary the next shot timing
                    enemy.shootCooldown = 1000 + Math.random() * 2000;
                    
                    // Play enemy shoot sound (slightly different from player)
                    this.playEnemyShootSound();
                }
            }
            
            // Check collision with player
            if (this.checkCollision(this.player, enemy) && !this.shieldActive) {
                this.enemies.splice(index, 1);
                this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                this.playSound('damage');
                this.health -= 2; // Enemies do more damage than asteroids
                this.updateUI();
                
                if (this.health <= 0) {
                    this.gameOver();
                }
            }
        });
    }
    
    updateBosses() {
        if (!this.gameRunning) return;
        
        const now = Date.now();
        
        this.bosses.forEach((boss, index) => {
            boss.actionTimer++;
            
            // Boss entrance phase
            if (boss.movePattern === 'entrance') {
                if (boss.y < boss.targetY) {
                    boss.y += boss.speed;
                } else {
                    boss.movePattern = 'active';
                    boss.isActive = true;
                }
                return;
            }
            
            if (!boss.isActive) return;
            
            // Boss movement patterns based on type
            switch (boss.type) {
                case 'basic':
                    // Simple side-to-side movement
                    if (boss.actionTimer % 120 === 0) {
                        boss.targetX = Math.random() * (this.width - boss.width);
                    }
                    if (Math.abs(boss.x - boss.targetX) > 5) {
                        boss.x += (boss.targetX - boss.x) * 0.02;
                    }
                    break;
                    
                case 'advanced':
                    // Figure-8 pattern
                    boss.x = boss.targetX + Math.sin(boss.actionTimer * 0.03) * 100;
                    boss.y = boss.targetY + Math.sin(boss.actionTimer * 0.015) * 30;
                    break;
                    
                case 'ultimate':
                    // Aggressive tracking and charging
                    if (boss.actionTimer % 300 < 240) {
                        // Track player
                        const dx = (this.player.x + this.player.width/2) - (boss.x + boss.width/2);
                        boss.x += dx * 0.01;
                    } else {
                        // Charge downward
                        boss.y += 3;
                        if (boss.y > boss.targetY + 50) {
                            boss.y = boss.targetY;
                        }
                    }
                    break;
            }
            
            // Keep boss within screen bounds
            if (boss.x < 0) boss.x = 0;
            if (boss.x > this.width - boss.width) boss.x = this.width - boss.width;
            
            // Boss shooting patterns
            if (now - boss.lastShot > boss.shootCooldown) {
                this.bossShoot(boss);
                boss.lastShot = now;
            }
            
            // Boss collision with player
            if (this.checkCollision(this.player, boss) && !this.shieldActive) {
                this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                this.playSound('damage');
                this.health -= 3; // Bosses do massive damage
                this.updateUI();
                
                if (this.health <= 0) {
                    this.gameOver();
                }
            }
        });
    }
    
    bossShoot(boss) {
        const centerX = boss.x + boss.width/2;
        const centerY = boss.y + boss.height;
        
        switch (boss.type) {
            case 'basic':
                // Single shot toward player
                const dx = (this.player.x + this.player.width/2) - centerX;
                const dy = (this.player.y + this.player.height/2) - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                this.bossBullets.push({
                    x: centerX - 3,
                    y: centerY,
                    width: 6,
                    height: 12,
                    speedX: (dx / distance) * 4,
                    speedY: (dy / distance) * 4,
                    color: '#ff0088'
                });
                break;
                
            case 'advanced':
                // Triple shot spread
                for (let i = -1; i <= 1; i++) {
                    const angle = Math.atan2(this.player.y - centerY, this.player.x - centerX) + (i * 0.3);
                    this.bossBullets.push({
                        x: centerX - 3,
                        y: centerY,
                        width: 6,
                        height: 12,
                        speedX: Math.cos(angle) * 4,
                        speedY: Math.sin(angle) * 4,
                        color: '#ff0088'
                    });
                }
                break;
                
            case 'ultimate':
                // Circular spray
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    this.bossBullets.push({
                        x: centerX - 3,
                        y: centerY,
                        width: 6,
                        height: 12,
                        speedX: Math.cos(angle) * 3,
                        speedY: Math.sin(angle) * 3,
                        color: '#ff0088'
                    });
                }
                break;
        }
        
        this.playEnemyShootSound();
    }
    
    updateBossBullets() {
        if (!this.gameRunning) return;
        
        this.bossBullets.forEach((bullet, bulletIndex) => {
            bullet.x += bullet.speedX;
            bullet.y += bullet.speedY;
            
            // Remove bullets that are off screen
            if (bullet.y > this.height + 10 || bullet.y < -10 || 
                bullet.x < -10 || bullet.x > this.width + 10) {
                this.bossBullets.splice(bulletIndex, 1);
                return;
            }
            
            // Check collision with player
            if (this.checkCollision(bullet, this.player) && !this.shieldActive) {
                this.bossBullets.splice(bulletIndex, 1);
                this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                this.playSound('damage');
                this.health -= 2; // Boss bullets do more damage
                this.updateUI();
                
                if (this.health <= 0) {
                    this.gameOver();
                }
            }
        });
    }
    
    updateEnemyBullets() {
        if (!this.gameRunning) return;
        
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            bullet.x += bullet.speedX;
            bullet.y += bullet.speedY;
            
            // Remove bullets that are off screen
            if (bullet.y > this.height + 10 || bullet.y < -10 || 
                bullet.x < -10 || bullet.x > this.width + 10) {
                this.enemyBullets.splice(bulletIndex, 1);
                return;
            }
            
            // Check collision with player
            if (this.checkCollision(bullet, this.player) && !this.shieldActive) {
                this.enemyBullets.splice(bulletIndex, 1);
                this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                this.playSound('damage');
                this.health--;
                this.updateUI();
                
                if (this.health <= 0) {
                    this.gameOver();
                }
            }
        });
    }
    
    updateAsteroids() {
        if (!this.gameRunning) return;
        
        this.asteroids.forEach((asteroid, index) => {
            asteroid.y += asteroid.speed;
            asteroid.rotation += asteroid.rotationSpeed;
            
            // Remove asteroids that are off screen
            if (asteroid.y > this.height + 50) {
                this.asteroids.splice(index, 1);
                this.score += 10;
                this.updateUI();
            }
            
            // Check collision with player
            if (this.checkCollision(this.player, asteroid) && !this.shieldActive) {
                this.asteroids.splice(index, 1);
                this.createExplosion(asteroid.x, asteroid.y);
                this.playSound('damage');
                this.health--;
                this.updateUI();
                
                if (this.health <= 0) {
                    this.gameOver();
                }
            }
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createExplosion(x, y, particleCount = 10) {
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: `hsl(${Math.random() * 60}, 100%, 50%)`
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            this.ctx.globalAlpha = Math.random() * 0.8 + 0.2;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawPlayer() {
        this.ctx.save();
        this.ctx.translate(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
        
        // Draw shield effect if active
        if (this.shieldActive) {
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
        
        // Draw spaceship
        this.ctx.fillStyle = this.player.color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -15);
        this.ctx.lineTo(-10, 15);
        this.ctx.lineTo(0, 10);
        this.ctx.lineTo(10, 15);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw engine glow
        this.ctx.fillStyle = '#ff4444';
        this.ctx.beginPath();
        this.ctx.moveTo(-5, 15);
        this.ctx.lineTo(0, 25);
        this.ctx.lineTo(5, 15);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // Add a glow effect
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            this.ctx.save();
            this.ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            
            // Draw enemy ship (inverted triangle)
            this.ctx.fillStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 12);
            this.ctx.lineTo(-10, -12);
            this.ctx.lineTo(0, -8);
            this.ctx.lineTo(10, -12);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Draw enemy engine glow
            this.ctx.fillStyle = '#ff8888';
            this.ctx.beginPath();
            this.ctx.moveTo(-5, -12);
            this.ctx.lineTo(0, -20);
            this.ctx.lineTo(5, -12);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Health indicator (small bars above enemy)
            this.ctx.fillStyle = '#ffffff';
            for (let i = 0; i < enemy.health; i++) {
                this.ctx.fillRect(-8 + (i * 8), -18, 6, 2);
            }
            
            this.ctx.restore();
        });
    }
    
    drawEnemyBullets() {
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // Add a glow effect
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawBosses() {
        this.bosses.forEach(boss => {
            this.ctx.save();
            this.ctx.translate(boss.x + boss.width/2, boss.y + boss.height/2);
            
            // Boss body - larger, more imposing ship
            this.ctx.fillStyle = boss.color;
            this.ctx.beginPath();
            
            // Main body - diamond shape
            this.ctx.moveTo(0, -40);
            this.ctx.lineTo(-30, -10);
            this.ctx.lineTo(-50, 20);
            this.ctx.lineTo(-25, 40);
            this.ctx.lineTo(0, 35);
            this.ctx.lineTo(25, 40);
            this.ctx.lineTo(50, 20);
            this.ctx.lineTo(30, -10);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Boss details - wings
            this.ctx.fillStyle = '#ff4488';
            this.ctx.beginPath();
            this.ctx.moveTo(-50, 20);
            this.ctx.lineTo(-70, 25);
            this.ctx.lineTo(-65, 35);
            this.ctx.lineTo(-25, 40);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.moveTo(50, 20);
            this.ctx.lineTo(70, 25);
            this.ctx.lineTo(65, 35);
            this.ctx.lineTo(25, 40);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Boss engine effects
            this.ctx.fillStyle = '#ff8888';
            for (let i = 0; i < 4; i++) {
                const x = -30 + (i * 20);
                this.ctx.beginPath();
                this.ctx.moveTo(x - 3, 40);
                this.ctx.lineTo(x, 55);
                this.ctx.lineTo(x + 3, 40);
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            // Health bar
            const healthBarWidth = 80;
            const healthPercentage = boss.health / boss.maxHealth;
            
            // Background
            this.ctx.fillStyle = '#444444';
            this.ctx.fillRect(-healthBarWidth/2, -60, healthBarWidth, 8);
            
            // Health
            this.ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffff00' : '#ff0000';
            this.ctx.fillRect(-healthBarWidth/2, -60, healthBarWidth * healthPercentage, 8);
            
            // Health bar border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(-healthBarWidth/2, -60, healthBarWidth, 8);
            
            // Boss type indicator
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(boss.type.toUpperCase(), 0, -70);
            
            this.ctx.restore();
        });
    }
    
    drawBossBullets() {
        this.bossBullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // Add a stronger glow effect for boss bullets
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 12;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawAsteroids() {
        this.asteroids.forEach(asteroid => {
            this.ctx.save();
            this.ctx.translate(asteroid.x + asteroid.width/2, asteroid.y + asteroid.height/2);
            this.ctx.rotate(asteroid.rotation);
            
            this.ctx.fillStyle = '#888888';
            this.ctx.strokeStyle = '#aaaaaa';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, asteroid.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.restore();
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, 3, 3);
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawUI() {
        if (!this.gameRunning) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '36px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GALAXY GAME', this.width/2, this.height/2 - 120);
            
            this.ctx.font = '20px Courier New';
            
            if (!this.hasStartedGame) {
                // First time playing
                this.ctx.fillText('Press SPACE to start!', this.width/2, this.height/2 - 50);
            } else {
                // Died and can restart level
                this.ctx.fillStyle = '#ff4444';
                this.ctx.fillText('GAME OVER', this.width/2, this.height/2 - 80);
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText(`Final Score: ${this.score}`, this.width/2, this.height/2 - 50);
                this.ctx.fillText(`Died on Level: ${this.level}`, this.width/2, this.height/2 - 20);
                
                this.ctx.fillStyle = '#ffff00';
                this.ctx.fillText(`Press SPACE to restart Level ${this.currentLevelStart}`, this.width/2, this.height/2 + 20);
                
                this.ctx.fillStyle = '#888888';
                this.ctx.font = '16px Courier New';
                this.ctx.fillText('Press R for complete reset to Level 1', this.width/2, this.height/2 + 50);
            }
        }
        
        // Level transition overlay
        if (this.levelTransition) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '32px Courier New';
            this.ctx.textAlign = 'center';
            
            if (this.isBossLevel) {
                this.ctx.fillStyle = '#ff0088';
                this.ctx.fillText(`BOSS LEVEL ${this.level}`, this.width/2, this.height/2 - 50);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '20px Courier New';
                this.ctx.fillText('Prepare for battle!', this.width/2, this.height/2);
            } else {
                this.ctx.fillText(`LEVEL ${this.level}`, this.width/2, this.height/2 - 50);
                this.ctx.font = '20px Courier New';
                this.ctx.fillText(`Enemies: ${this.enemiesPerLevel}`, this.width/2, this.height/2);
            }
        }
        
        // Boss health bar (global)
        if (this.bossActive && this.bosses.length > 0) {
            const boss = this.bosses[0];
            const barWidth = 300;
            const barHeight = 20;
            const x = (this.width - barWidth) / 2;
            const y = 50;
            
            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(x - 10, y - 10, barWidth + 20, barHeight + 20);
            
            // Boss health bar
            this.ctx.fillStyle = '#444444';
            this.ctx.fillRect(x, y, barWidth, barHeight);
            
            const healthPercentage = boss.health / boss.maxHealth;
            this.ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffff00' : '#ff0000';
            this.ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);
            
            // Border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Boss label
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${boss.type.toUpperCase()} BOSS - ${boss.health}/${boss.maxHealth}`, this.width/2, y - 15);
        }
        
        // Upgrade menu
        if (this.upgradeMenuOpen) {
            this.drawUpgradeMenu();
        }
    }
    
    drawUpgradeMenu() {
        // Background overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Menu title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '28px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('UPGRADE SHOP', this.width/2, 60);
        
        this.ctx.font = '16px Courier New';
        this.ctx.fillText(`Score: ${this.score}`, this.width/2, 85);
        
        // Upgrade list
        const startY = 120;
        const itemHeight = 60;
        
        this.availableUpgrades.forEach((upgrade, index) => {
            const y = startY + (index * itemHeight);
            const currentLevel = this.upgrades[upgrade.key];
            const isMaxed = currentLevel >= upgrade.maxLevel;
            const isSelected = index === this.selectedUpgrade;
            const cost = isMaxed ? 0 : upgrade.costs[currentLevel];
            const canAfford = this.score >= cost;
            
            // Selection highlight
            if (isSelected) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.fillRect(50, y - 25, this.width - 100, 50);
            }
            
            // Upgrade name and level
            this.ctx.textAlign = 'left';
            this.ctx.fillStyle = isMaxed ? '#888888' : '#ffffff';
            this.ctx.font = '18px Courier New';
            this.ctx.fillText(`${upgrade.name} [${currentLevel}/${upgrade.maxLevel}]`, 70, y - 5);
            
            // Description
            this.ctx.font = '14px Courier New';
            this.ctx.fillStyle = '#cccccc';
            if (isMaxed) {
                this.ctx.fillText('MAX LEVEL', 70, y + 15);
            } else {
                this.ctx.fillText(upgrade.descriptions[currentLevel], 70, y + 15);
            }
            
            // Cost
            this.ctx.textAlign = 'right';
            if (isMaxed) {
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillText('MAXED', this.width - 70, y - 5);
            } else {
                this.ctx.fillStyle = canAfford ? '#ffff00' : '#ff4444';
                this.ctx.fillText(`${cost} pts`, this.width - 70, y - 5);
            }
        });
        
        // Instructions
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('↑↓ Navigate | ENTER Purchase | U/ESC Close', this.width/2, this.height - 30);
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('health').textContent = this.health;
        document.getElementById('level').textContent = this.level;
        document.getElementById('enemies').textContent = this.isBossLevel ? 'BOSS' : `${this.enemiesKilled}/${this.enemiesPerLevel}`;
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        console.log('Sound ' + (this.soundEnabled ? 'enabled' : 'disabled'));
    }
    
    toggleUpgradeMenu() {
        if (this.gameRunning && !this.levelTransition) {
            this.upgradeMenuOpen = !this.upgradeMenuOpen;
        }
    }
    
    purchaseUpgrade(index) {
        const upgrade = this.availableUpgrades[index];
        const currentLevel = this.upgrades[upgrade.key];
        
        if (currentLevel >= upgrade.maxLevel) return;
        
        const cost = upgrade.costs[currentLevel];
        if (this.score < cost) return;
        
        // Purchase the upgrade
        this.score -= cost;
        this.upgrades[upgrade.key]++;
        
        // Apply upgrade effects
        this.applyUpgradeEffects(upgrade.key);
        
        this.updateUI();
        this.playSound('shoot'); // Purchase sound
    }
    
    applyUpgradeEffects(upgradeKey) {
        switch (upgradeKey) {
            case 'health':
                this.maxHealth = 3 + this.upgrades.health;
                this.health = Math.min(this.health + 1, this.maxHealth); // Also heal when buying
                break;
                
            case 'speed':
                this.player.speed = 5 + (this.upgrades.speed * 1.25);
                break;
        }
    }
    
    activateShield() {
        if (this.shieldCooldown <= 0 && !this.shieldActive) {
            this.shieldActive = true;
            this.shieldTimer = 180; // 3 seconds at 60fps
            this.shieldCooldown = 1800; // 30 seconds cooldown
            this.playSound('shoot'); // Shield activation sound
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.playSound('gameOver');
        // Note: We don't reset hasStartedGame, so player will restart from current level
    }
    
    resetGame() {
        // Complete reset - back to level 1
        this.hasStartedGame = false;
        this.gameRunning = false;
        this.upgradeMenuOpen = false;
        this.currentLevelStart = 1;
        this.levelStartScore = 0;
        this.levelStartUpgrades = {};
    }
    
    gameLoop() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Update
        this.updateStars();
        this.updatePlayer();
        this.updateParticles();
        
        if (this.gameRunning) {
            // Handle level transitions
            if (this.levelTransition) {
                this.transitionTimer--;
                if (this.transitionTimer <= 0) {
                    if (this.isBossLevel) {
                        this.spawnBoss();
                    } else {
                        this.nextLevel();
                    }
                }
            } else {
                // Regular gameplay
                this.spawnAsteroid();
                this.spawnEnemy();
                this.updateAsteroids();
                this.updateEnemies();
                this.updateBosses();
                this.updateBullets();
                this.updateEnemyBullets();
                this.updateBossBullets();
                this.checkLevelProgression();
            }
        }
        
        // Draw
        this.drawStars();
        if (this.gameRunning) {
            this.drawPlayer();
            this.drawAsteroids();
            this.drawEnemies();
            this.drawBosses();
            this.drawBullets();
            this.drawEnemyBullets();
            this.drawBossBullets();
        }
        this.drawParticles();
        this.drawUI();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new GalaxyGame();
});