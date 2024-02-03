const ws = new WebSocket('ws://localhost:83');
let myId;
const localPlayes = {};
const localBullets = {};

ws.onopen = function(){
    console.log('connected');
}

const addPlayer = (data, id) =>{
    if(id === myId){
        localPlayes[id] = {
            image: gameSceneContext.add.sprite(data.x, data.y, 'player').setScale(0.15)
        }
        gameSceneContext.cameras.main.startFollow(localPlayes[id].image);
        localPlayes[id].image.setDepth(6);
    }else{
        localPlayes[id] = {
            image: gameSceneContext.add.sprite(data.x, data.y, 'enemy').setScale(0.15)
        }
        localPlayes[id].image.setDepth(5);
    }
    localPlayes[id].angle = data.angle;
    localPlayes[id].name = gameSceneContext.add.text(data.x, data.y + 60, data.name, 
        { font: '15px Arial', fill: '#ffffff' })
}

const addBullet = (data, id) =>{
    localBullets[id] = {
        image: gameSceneContext.add.sprite(data.x, data.y, 'bullet')
    }
}

const routes = {
    'onWantPlay': (id) =>{
        console.log('My id is: ', id);
        myId = id.toString();
    },
    'gameOver': () =>{
        for(const id in localPlayes){ delete localPlayes[id] };
        for(const id in localBullets){ delete localBullets[id] };
        gameSceneContext.scene.start('menuScene');
    },
    'update': (data) =>{
        for(const id in data.players){
            if(!localPlayes[id]){
                addPlayer(data.players[id], id);
            }else{
                localPlayes[id].image.x = data.players[id].x;
                localPlayes[id].image.y = data.players[id].y;
                localPlayes[id].image.angle = data.players[id].angle;
                localPlayes[id].name.x = data.players[id].x;
                localPlayes[id].name.y = data.players[id].y + 60;
            }
        }
        for(const id in data.bullets){
            if(!localBullets[id]){
                addBullet(data.bullets[id], id);
            }else{
                localBullets[id].image.x = data.bullets[id].x;
                localBullets[id].image.y = data.bullets[id].y;
                localBullets[id].image.angle = data.bullets[id].angle;
            }

        }
        for(const id in localPlayes){
            if(!data.players[id]){
                const explosion = gameSceneContext.add.sprite(localPlayes[id].image.x, localPlayes[id].image.y, 'explosion');
                explosion.anims.play('explosion', true);
                explosion.on('animationcomplete', () =>{
                    explosion.destroy();
                }, gameSceneContext)
                localPlayes[id].image.destroy();
                localPlayes[id].name.destroy();
                delete localPlayes[id];
            }
        }
        for(const id in localBullets){
            if(!data.bullets[id]){
                localBullets[id].image.destroy();
                delete localBullets[id];
            }
        }
    }
}

ws.onmessage = function(e){
    const data = JSON.parse(e.data);
    //console.log(data)
    if(routes[data.route]) routes[data.route](data.data)
}

ws.onclose = function(){
    console.log('socket closed');
}

ws.onerror = function(e){
    console.log('error: ', e);
}

const SendToServer = (route, data = null) =>{
    ws.send(JSON.stringify({ route, data }))
}