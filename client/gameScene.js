let gameSceneContext;
let A, D;
const gameScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function gameScene(){
        Phaser.Scene.call(this, { key: 'gameScene' });
    },
    create: function(){
        gameSceneContext = this;
        this.cameras.main.setBounds(0, 0, 3000, 3000);
        this.add.tileSprite(0, 0, 3000, 3000, 'water').setOrigin(0);
        A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', () =>{
            SendToServer('shot');
        });
        this.anims.create({
            key: 'explosion',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 8 } ),
            frameRate: 10,
            repeate: 0
        });
    },
    update: function(){
        if(A.isDown){
            SendToServer('turn', 'left')
        }else if(D.isDown){
            SendToServer('turn', 'right')
        }
    }
});