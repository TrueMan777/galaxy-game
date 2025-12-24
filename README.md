# Galaxy Game

A very basic galaxy-themed survival game built with vanilla JavaScript and HTML5 Canvas.

## How to Play

1. Open `index.html` in your web browser
2. Press **SPACE** to start the game
3. Use **WASD** or **Arrow Keys** to move your spaceship
4. Press **SPACE** to shoot bullets at asteroids and enemy ships
5. Press **U** to open the upgrade shop and spend points on improvements
6. Press **S** to activate shield (if purchased) for temporary invincibility
7. Defeat enemies to progress through levels (every 3rd level is a BOSS!)
8. Destroy asteroids (50 pts), enemy ships (100 pts), and bosses (500+ pts) for points
9. Avoid asteroids, enemy ships, enemy bullets, and boss attacks
10. Each level increases enemy speed, health, and spawn rates
11. **If you die, you restart from the current level (not from level 1)!**
12. You have 3 health points - losing all health ends the game

## Game Features

- **Player Ship**: Green triangular spaceship with engine effects
- **Shooting System**: Yellow bullet projectiles with glow effects
- **Upgrade System**: Comprehensive shop with 8 different upgrade categories
- **Score-Based Progression**: Spend earned points to enhance your ship's capabilities
- **Level System**: Progressive difficulty with structured level advancement
- **Level Restart System**: Die and restart from current level instead of losing all progress
- **Boss Battles**: Epic boss fights every 3rd level with unique mechanics
- **Enemy Ships**: Red triangular enemy ships with AI that shoot back
- **Enemy AI**: Smart enemies with zigzag movement patterns and targeted shooting
- **Enemy Bullets**: Red projectiles that track toward the player
- **Boss Types**: Three distinct boss types with different attack patterns
- **Boss Health**: Large health bars with visual damage feedback
- **Shield System**: Temporary invincibility with cooldown mechanics
- **Auto-Heal**: Passive health regeneration upgrade
- **Asteroids**: Randomly spawning gray circular asteroids with rotation
- **Star Field**: Animated background stars for galaxy atmosphere
- **Particle Effects**: Explosion effects when objects are destroyed or collide
- **Score System**: Enhanced with multiplier upgrades - 500+ points for bosses, 100 points for enemies, 50 points for asteroids
- **Health System**: Expandable health with upgrade shop (base 3 lives, expandable to 5)
- **Sound Effects**: Synthetic audio including boss arrival, shooting, explosions, damage, and game over
- **Smooth Controls**: Responsive WASD/Arrow key movement and shooting with speed upgrades
- **Level Transitions**: Visual level announcements with progress tracking

## Game Mechanics

### Level System
- **Level Progression**: Complete each level by defeating a set number of enemies
- **Boss Levels**: Every 3rd level (3, 6, 9, etc.) features a boss battle
- **Difficulty Scaling**: Each level increases enemy speed, health, and spawn rates
- **Level Transitions**: Visual announcements between levels with progress display

### Level Restart System
- **Checkpoint System**: Progress is automatically saved at the start of each level
- **Death Recovery**: When you die, restart from the current level instead of level 1
- **Progress Preservation**: Your score and upgrades from the beginning of the level are restored
- **Boss Restart**: Failing a boss battle restarts you at the beginning of that boss level
- **Complete Reset**: Press R during game over to start fresh from level 1
- **Upgrade Retention**: All upgrades purchased before the level are kept on restart

### Boss System
- **Boss Types**: 
  - **Basic** (Levels 1-5): Single targeted shots, simple side-to-side movement
  - **Advanced** (Levels 6-10): Triple-shot spread, figure-8 movement pattern
  - **Ultimate** (Levels 11+): 360° bullet spray, aggressive player tracking
- **Boss Health**: Massive health pools that scale with level (15 + level × 5)
- **Boss Entrance**: Dramatic entrance sequence with warning sound
- **Global Health Bar**: Large boss health display at top of screen

### Combat System
- **Asteroids**: Spawn randomly with varying sizes and speeds
- **Enemy Ships**: Level-scaled health, speed, and shooting frequency
- **Enemy AI**: Two movement patterns - straight and zigzag
- **Enemy Shooting**: Aim at player within 300-pixel range with variable timing
- **Player Shooting**: Bullet cooldown system prevents spam
- **Targeted Bullets**: All enemy projectiles calculate trajectory toward player
- **Collision System**: Comprehensive detection between all objects
- **Health Indicators**: Visual health bars for enemies and bosses

### Upgrade System
- **8 Upgrade Categories**: Comprehensive enhancement options for all aspects of gameplay
- **Progressive Costs**: Each upgrade level costs more than the previous
- **Score-Based Currency**: Spend earned points to purchase improvements
- **Upgrade Categories**:
  - **Rapid Fire** (3 levels): 25%-75% faster shooting (200/500/1000 pts)
  - **Multi Shot** (2 levels): Shoot 3-5 bullets at once (300/800 pts)
  - **Increased Damage** (3 levels): 2x-4x bullet damage (250/600/1200 pts)
  - **Extra Health** (2 levels): Increase max health to 4-5 (400/1000 pts)
  - **Speed Boost** (3 levels): 25%-75% faster movement (150/400/800 pts)
  - **Shield Generator** (1 level): 3-second invincibility with 30s cooldown (800 pts)
  - **Auto Repair** (1 level): Passive health regeneration every 3 seconds (600 pts)
  - **Score Multiplier** (2 levels): 50%-100% bonus points (500/1500 pts)

### Progression
- **Enemy Requirements**: 5 + level number enemies per level
- **Score Scaling**: Boss rewards increase with level (500 + level × 100)
- **Multiplier Effects**: Score multiplier upgrades affect all point gains
- **Visual Feedback**: Explosion particles scaled by object importance

## Technical Details

- Built with vanilla JavaScript (no external dependencies)
- Uses HTML5 Canvas for rendering
- Web Audio API for procedural sound generation
- Object-oriented game structure
- 60 FPS game loop using `requestAnimationFrame`
- Responsive controls with continuous key detection

## Controls

- **WASD** or **Arrow Keys**: Move spaceship
- **SPACE**: Shoot bullets (during game) / Start game / Restart current level after death
- **U**: Open/close upgrade shop
- **S**: Activate shield (if purchased)
- **R**: Complete reset to level 1 (only when game over)
- **M**: Toggle sound effects on/off

### Upgrade Shop Controls
- **↑↓ Arrow Keys**: Navigate upgrade list
- **ENTER**: Purchase selected upgrade
- **U** or **ESC**: Close upgrade shop

## Future Enhancements

This game now includes shooting mechanics, sound effects, enemy AI, level progression, boss battles, and a comprehensive upgrade system. Potential improvements could include:
- **Pickup Power-ups**: Temporary boosts that drop from enemies
- **Multiple Enemy Types**: Different ships with unique weapons and behaviors
- **Advanced Boss Mechanics**: Multi-phase bosses with changing attack patterns
- **Background Music**: Ambient space music and dynamic combat themes
- **Enhanced Graphics**: Sprite-based graphics and particle effects
- **Mobile Support**: Touch controls for mobile devices
- **Weapon Varieties**: Different bullet types and special weapons
- **Settings Menu**: Volume controls, difficulty selection, key binding
- **Leaderboard System**: Local and online high score tracking
- **Achievements**: Unlock system for special accomplishments
- **Campaign Mode**: Story-driven progression with cutscenes

---

*Created as a very basic galaxy game scenario using JavaScript framework for games.*