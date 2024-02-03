let menuSceneContext;
const menuScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function menuScene(){
        Phaser.Scene.call(this, { key: 'menuScene' });
    },
    create: function(){
        menuSceneContext = this;
        console.log('menu scene');
        const nameField = document.getElementById('nameField');
        nameField.style.display = 'block';
        const playButton = this.add.text(550, 400, 'Играть', { font: '24px Arial', fill: '#ffffff' }).setInteractive();
        playButton.on('pointerdown', () =>{
            const nameField = document.getElementById('nameField');
            const name = nameField.value;
            SendToServer('wantPlay', name);
            menuSceneContext.scene.start('gameScene');
            nameField.style.display = 'none';
        })

    },
    update: function(){

    }
});