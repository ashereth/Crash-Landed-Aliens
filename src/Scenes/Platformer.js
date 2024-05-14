class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.gameOver = this.gameOver.bind(this);
        this.win = this.win.bind(this);

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
    }
    //send player to game over scene
    gameOver() {

        this.scene.start('GameOverScene');
    }

    //send player to winning scene
    win() {
        this.scene.start('WinningScene');
    }
    preload(){
        //Doing this solely for the coin sprite. Can't find a better way to do this lol
        this.load.path = "./assets/"
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        })
        this.load.spritesheet("character_sheet", "tilemap-characters-packed.png", {
            frameWidth: 18,
            frameHeight: 18
        })
    }
    create() {

        //coin animation
        this.anims.create({
            key: 'coinAnim',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', {start: 151, end: 152}),
            repeat: -1,
            frameRate: 5
        });
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

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.backgroundTileset = this.map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles");

        // Create a layer
        this.backgroundLayer = this.map.createLayer("Background", this.backgroundTileset, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.obstacleLayer = this.map.createLayer("Obstacles", this.tileset, 0, 0);
        this.winLayer = this.map.createLayer("Winning", this.tileset, 0, 0);
        this.winLayer.setScale(2.0);
        this.obstacleLayer.setScale(2.0);
        this.groundLayer.setScale(2.0);
        this.backgroundLayer.setScale(2.0);

        // Make it collidable
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
        this.flies = this.map.createFromObjects("FlyEnemies");
        //make a sprite group to hold flies
        this.flyGroup = this.add.group();
        //make all the fly sprites and add them to the fly group
        this.flies.forEach(fly => {
            const sprite = this.add.sprite(fly.x*2, fly.y*2, 'platformer_characters', "tile_0025.png");
            this.physics.world.enable(sprite);
            sprite.body.setAllowGravity(false);
            sprite.body.setSize(20, 15);
            sprite
            this.flyGroup.add(sprite);
        });
        //play the animation for each fly
        this.flyGroup.children.iterate((fly)=>{
            fly.play('flyAnim');
        });
    
        //make all coins and make them look like coins
        this.coins = this.map.createFromObjects("Coins", {
            key: "tilemap_sheet",
            frame: 151
        });
        //scale the coins
        for(let coin of this.coins){
            coin.setScale(2.0);
            coin.x = coin.x * 2;
            coin.y = coin.y * 2;
        }
        //add coins to a sprite group
        this.coinGroup = this.add.group(this.coins);
        //create physics for coins
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coins.map((coin) => {
            coin.body.setCircle(12).setOffset(6, 6);
        });
        //add animation to coins
        this.coinGroup.children.iterate((coin)=>{
            coin.play('coinAnim');
        })
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(10, game.config.height/2+550, "platformer_characters", "tile_0004.png").setScale(1.5);
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
        this.physics.add.collider(this.flyGroup, this.groundLayer);
        this.physics.add.collider(this.flyGroup, my.sprite.player, this.gameOver);
        //display score
        this.score = 0;
        my.text.score = this.add.text(370, 250, `Coins collected: ${ this.score }/5`, { 
            fontFamily: 'sans-serif',
            fontSize: '18px',
            color: '#000000'
        }).setScrollFactor(0);
        //coins and player should overlap not collide
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            this.score += 1;
            my.text.score.setText(`Coins collected: ${ this.score }/5`);
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', function() {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this)

    }

    update() {
        if(cursors.left.isDown) {
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

        } else if(cursors.right.isDown) {
            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }
    }
}