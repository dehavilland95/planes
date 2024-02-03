const config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 1200,
    heigth: 700,
    backgroundColor: '#2d2d2d',
    scene: [
        loadScene,
        menuScene,
        gameScene
    ]
};

const game = new Phaser.Game(config);