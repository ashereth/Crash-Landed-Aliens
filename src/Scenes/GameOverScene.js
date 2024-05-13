class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    create() {
        // Display "Game Over" text
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Game Over', {
            fontSize: '64px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);

        // Add a button or text to restart the game
        const restartButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Restart', {
            fontSize: '32px',
            fill: '#FF0000'
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.start('platformerScene');
        });
    }
}
