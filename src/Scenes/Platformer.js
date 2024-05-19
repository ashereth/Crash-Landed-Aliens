class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.gameOver = this.gameOver.bind(this);
        this.win = this.win.bind(this);

    }

    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    init() {
        // variables and settings
        this.ACCELERATION = 500;
        this.DRAG = 1500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -520;
        this.mapWidth =18*2*135;
        this.mapHeight = 18 *2 * 40;
        this.maxSpeed_X = 200;
        this.maxSpeed_Y = 1000;
        this.SCALE = 2;
        this.PARTICLE_VELOCITY = 50;

    }

    //send player to game over scene
    gameOver() {

        this.scene.start('GameOverScene');
    }

    //send player to winning scene
    win() {
        this.scene.start('WinningScene');
    }

    create() {
        //coin animation
        this.anims.create({
            key: 'coinAnim',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', {start: 151, end: 152}),
            repeat: -1,
            frameRate: 5
        });

        //create array for all the footstep sounds
        this.footsteps = [
            this.sound.add('footstep1'),
            this.sound.add('footstep2'),
            this.sound.add('footstep3'),
            this.sound.add('footstep4'),
            this.sound.add('footstep5')
        ];
        //create coin sounds
        this.coinSound = this.sound.add('coinSound');
        this.jumpSound = this.sound.add('jumpSound');

        //fly animation
        this.anims.create({
            key: 'flyAnim',
            frames: [
                { key: 'platformer_characters', frame: 'tile_0025.png' },
                { key: 'platformer_characters', frame: 'tile_0024.png' },
                { key: 'platformer_characters', frame: 'tile_0025.png' },
                { key: 'platformer_characters', frame: 'tile_0026.png' }
            ],
            frameRate: 7,
            repeat: -1
        });

        // Set world bounds to match the scaled tilemap size
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 135 tiles wide and 40 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 135, 40);
        this.animatedTiles.init(this.map)

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.backgroundTileset = this.map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles");

        // Create a layer
        this.backgroundLayer = this.map.createLayer("Background", this.backgroundTileset, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.extraLayer = this.map.createLayer("Extra", this.tileset, 0, 0);
        this.obstacleLayer = this.map.createLayer("Obstacles", this.tileset, 0, 0);
        this.winLayer = this.map.createLayer("Winning", this.tileset, 0, 0);
        this.winLayer.setScale(this.SCALE);
        this.obstacleLayer.setScale(this.SCALE);
        this.backgroundLayer.setScale(this.SCALE);
        this.extraLayer.setScale(this.SCALE);
        this.groundLayer.setScale(this.SCALE);

        //set collides for ground
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        //set collides for obstacles
        this.obstacleLayer.setCollisionByProperty({
            collides: true
        });
        //set collides for when player reaches end
        this.winLayer.setCollisionByProperty({
            collides: true
        });

        //make fly enemies
        this.flies = this.map.createFromObjects("Objects", {
            name: "fly",
            key: 'platformer_characters', 
            frame: 'tile_0025.png'
        });
        //scale flies
        for(let fly of this.flies){
            fly.setScale(this.SCALE);
            fly.x = fly.x * this.SCALE;
            fly.y = fly.y * this.SCALE;
        }
        //add physics for flies
        this.physics.world.enable(this.flies, Phaser.Physics.Arcade.STATIC_BODY);
        this.flies.map((fly) => {
            fly.body.setSize(35, 18);
        });
        //make a sprite group to hold flies
        this.flyGroup = this.add.group(this.flies);
        //play the animation for each fly
        this.flyGroup.children.iterate((fly)=>{
            fly.play('flyAnim');
        });
        //make all coins and make them look like coins
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        //scale the coins and place them correctly
        for(let coin of this.coins){
            coin.setScale(this.SCALE);
            coin.x = coin.x * this.SCALE;
            coin.y = coin.y * this.SCALE;
        }
        //create physics for coins
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        //add coins to a sprite group
        this.coinGroup = this.add.group(this.coins);
        //set hitbox for coin to be a small circle
        this.coins.map((coin) => {
            coin.body.setCircle(10).setOffset(6, 6);
        });

        //add animation to coins
        this.coinGroup.children.iterate((coin)=>{
            coin.play('coinAnim');
        })

        // set up player avatar
        const spawnPoint = this.map.findObject("Objects", obj => obj.name === "spawn");
        my.sprite.player = this.physics.add.sprite(spawnPoint.x*this.SCALE, spawnPoint.y*this.SCALE, "platformer_characters", "tile_0004.png").setScale(1.5);
        my.sprite.player.setCollideWorldBounds(true);
        //set a max speed for the player
        my.sprite.player.setMaxVelocity(this.maxSpeed_X, this.maxSpeed_Y);
        my.sprite.player.body.setSize(20, 20);


        // Get the current camera and configure it to follow the player
        this.cameras.main.startFollow(my.sprite.player, true, .1, .1);
        // Set the bounds of the camera
        this.cameras.main.setZoom(2);


        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.obstacleLayer, this.gameOver);
        this.physics.add.collider(my.sprite.player, this.winLayer, this.win);
        this.physics.add.overlap(my.sprite.player, this.flyGroup, this.gameOver);


        //display score
        this.coinsCollected = 0;
        my.text.coinsCollected = this.add.text(370, 250, `Coins collected: ${ this.coinsCollected }/5`, { 
            fontFamily: 'sans-serif',
            fontSize: '18px',
            color: '#000000'
        }).setScrollFactor(0);
        //coin pickup vfx
        my.vfx.coinPickup = this.add.particles(0, 0, "kenny-particles", {
            frame: ['magic_04.png', 'magic_05.png'],
            random: true,
            scale: .3,
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 500,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        //coins and player should overlap not collide
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {
            coin.destroy();
            this.coinsCollected += 1;
            my.vfx.coinPickup.emitParticleAt(coin.x, coin.y);
            my.vfx.coinPickup.start();
            this.coinSound.play();

            my.text.coinsCollected.setText(`Coins collected: ${ this.coinsCollected }/5`);
        });


        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();


        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', function() {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this)


        // Movement VFX
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_05.png', 'smoke_07.png'],
            // TODO: Try: add random: true
            scale: {start: 0.02, end: 0.08},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 250,
            gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        this.isRunning = false;

        // Jumping VFX
        my.vfx.jump = this.add.particles(0, 0, "kenny-particles", {
            frame: ['muzzle_01.png'],
            // TODO: Try: add random: true
            scale: .15,
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 250,
            alpha: {start: .8, end: 0.1}, 
        });

    }
    //method to play running sound
    playRunningAudio() {
        const randomIndex = Phaser.Math.Between(0, this.footsteps.length - 1);
        const footstepSound = this.footsteps[randomIndex];
        if (!footstepSound.isPlaying) {
            footstepSound.play();
        }
    }

    update() {
        //stop walking vfx if off ground
        if (!my.sprite.player.body.blocked.down) {
            my.vfx.walking.stop();
        }

        //for playing running noise
        if ((cursors.left.isDown || cursors.right.isDown) && my.sprite.player.body.blocked.down) {
            if (!this.isRunning) {
                this.isRunning = true;
                this.runEvent = this.time.addEvent({
                    delay: 150, // milliseconds between each footstep sound
                    callback: this.playRunningAudio,
                    callbackScope: this,
                    loop: true
                });
            }
        } else {
            if (this.isRunning) {
                this.isRunning = false;
                this.runEvent.remove(false);
            }
        }
        if(cursors.left.isDown) {
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            //walking vfx
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                //play walking vfx and sound
                my.vfx.walking.start();
            }

        } else if(cursors.right.isDown) {
            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            //walking vfx
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-30, my.sprite.player.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();//stop walking vfx
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.jumpSound.play();
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

            my.vfx.jump.emitParticleAt(my.sprite.player.x, my.sprite.player.y);
            my.vfx.jump.start();
        }
    }
}