let loadSceneContext;
const loadScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function loadScene(){
        Phaser.Scene.call(this, { key: 'loadScene' });
    },
    create: function(){
        loadSceneContext = this;
        this.load.image('bullet', './assets/bullet.png');
        this.load.image('player', './assets/player.png');
        this.load.image('enemy', './assets/enemy.png');
        this.load.image('water', './assets/water.png');
        this.load.spritesheet('explosion', './assets/explosion.png', { frameWidth: 116, frameHeight: 109 });

        this.load.on('progress', function(value){
        });

        this.load.on('complete', function(){
            loadSceneContext.scene.start('menuScene');
        });
        
        this.load.start();
    }
});