"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,//set to false for final product
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1440,
    height: 900,
    scene: [Load, Platformer, GameOverScene, WinningScene]
}

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}};

const game = new Phaser.Game(config);