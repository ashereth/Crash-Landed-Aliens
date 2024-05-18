class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        

        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.image("background_tiles", "tilemap-backgrounds_packed.png");
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON
        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        this.load.audio('footstep1', 'audio/footstep_concrete_000.ogg');
        this.load.audio('footstep2', 'audio/footstep_concrete_001.ogg');
        this.load.audio('footstep3', 'audio/footstep_concrete_002.ogg');
        this.load.audio('footstep4', 'audio/footstep_concrete_003.ogg');
        this.load.audio('footstep5', 'audio/footstep_concrete_004.ogg');
        this.load.audio('coinSound', 'audio/impactMining_003.ogg');
        this.load.audio('jumpSound', 'audio/impactPunch_medium_000.ogg');
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 4,
                end: 5,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0004.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0005.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}