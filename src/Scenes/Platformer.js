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

    create() {


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
        this.coinLayer = this.map.createLayer("Coins", this.tileset, 0, 0);
        this.obstacleLayer = this.map.createLayer("Obstacles", this.tileset, 0, 0);
        this.winLayer = this.map.createLayer("Winning", this.tileset, 0, 0);
        this.winLayer.setScale(2.0);
        this.obstacleLayer.setScale(2.0);
        this.groundLayer.setScale(2.0);
        this.backgroundLayer.setScale(2.0);
        this.coinLayer.setScale(2.0);

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
        //player can collide with coins
        this.coinLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(10, game.config.height/2+550, "platformer_characters", "tile_0004.png").setScale(1.5)
        my.sprite.player.setCollideWorldBounds(true);
        //set a max speed for the player
        my.sprite.player.setMaxVelocity(this.maxSpeed_X, this.maxSpeed_Y);
        // Get the current camera and configure it to follow the player
        this.cameras.main.startFollow(my.sprite.player, true, .1, .1);

        // Set the bounds of the camera
        this.cameras.main.setZoom(2);
        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.obstacleLayer, this.gameOver);
        this.physics.add.collider(my.sprite.player, this.winLayer, this.win);
        this.physics.add.collider(my.sprite.player, this.coinLayer, console.log('coin'));

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        
        

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