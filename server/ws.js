const wss = require('./server');
const INTERVAL = 25;
const PLAYER_SPEED = 4;
const BULLET_SPEED = 12;
const TURNING_SPEED = 1;
const MAX_BULLET_DISTANCE = 500;
const HIT_DISTANCE = 50;
const MAP_WIDTH = 3000;
const MAP_HAIGHT = 3000;
let roomIndex = 0;
let bulletIndex = 0;
const players = {};
const bullets = {};

const calculateDistance = (body1, body2) =>{
    return Math.sqrt(Math.abs((body1.x - body2.x) * (body1.x - body2.x)) + ((body1.y - body2.y) * (body1.y - body2.y)));
}

const calculateAngle = (angle, turn) =>{
    let result;
    if(turn === 'left'){
        result = parseInt(angle) - TURNING_SPEED;
        if(result < -180)
         result = 180;
    }else{
        result = parseInt(angle) + TURNING_SPEED;
        if(result > 180)
            result = -180;
    }
    return result; 
}

function findPlace(){
    if(roomIndex >= 500) roomIndex = 0;
    return roomIndex++;
}

const routes = {
    'wantPlay': (name, ws) =>{
        const id = findPlace();
        ws.id = id;
        players[id] = { x: 100, y: 100, angle: 0, socket: ws, name }
        ws.send(JSON.stringify({ route : 'onWantPlay', data: id }));
    },
    'turn': (data, ws) =>{
       if(!players[ws.id]) return;
       players[ws.id].angle = calculateAngle(players[ws.id].angle, data);
    },
    'shot': (data, ws) =>{
        if(!players[ws.id]) return;
        bullets[bulletIndex++] = {
            x: players[ws.id].x,
            y: players[ws.id].y,
            angle: players[ws.id].angle,
            shooterId: ws.id.toString(),
            startPosition: { x:  players[ws.id].x, y: players[ws.id].y }
        }
        if(bulletIndex > 10000) bulletIndex = 0;
    }
}

wss.on('connection', (ws) =>{
    ws.on('message', (data) =>{
        const inputData = JSON.parse(data);
        if(routes[inputData.route]) routes[inputData.route](inputData.data, ws);
    });
    ws.on('close', () =>{
        if(players[ws.id]) delete players[ws.id];
    });
});

const movePlayers = () =>{
    for(const id in players){
        players[id].x = players[id].x - Math.cos(3.14 + players[id].angle / 57) * PLAYER_SPEED;
        players[id].y = players[id].y - Math.sin(3.14 + players[id].angle / 57) * PLAYER_SPEED;
    }
}

const moveBullets = () =>{
    for(const id in bullets){
        const distance = calculateDistance(bullets[id], bullets[id].startPosition);
        if(distance > MAX_BULLET_DISTANCE){
            delete bullets[id];
        }else{
            bullets[id].x = bullets[id].x - Math.cos(3.14 + bullets[id].angle / 57) * BULLET_SPEED;
            bullets[id].y = bullets[id].y - Math.sin(3.14 + bullets[id].angle / 57) * BULLET_SPEED;
        }
    }
}

const outOfBoundsCheck = () =>{
    for(const id in players){
        if(players[id].x > MAP_WIDTH || players[id].x < 0 || players[id].y > MAP_HAIGHT || players[id].y  < 0){
            players[id].socket.send(JSON.stringify({ route: 'gameOver' }));
            delete players[id];
        }
    }
}

const checkHit = () =>{
    firstLoop:
    for(const pId in players){
        secondLoop:
        for(const bId in bullets){
            if(pId === bullets[bId].shooterId) continue;
            const distance = calculateDistance(bullets[bId], players[pId]);
            if(distance < HIT_DISTANCE){
                players[pId].socket.send(JSON.stringify({ route: 'gameOver' }));
                delete players[pId];
                delete bullets[bId];
                continue firstLoop;
            }
        }
    }
}

const prepareDataForSending = () =>{
    const newData = {};
    for(const id in players){
        newData[id] = {
            x: players[id].x,
            y: players[id].y,
            angle: players[id].angle,
            name: players[id].name,
        }
    }
    return newData;
}

const sendInformationToPlayers = () =>{
    const data = prepareDataForSending();
    for(const id in players){
        players[id].socket.send(JSON.stringify({ route: 'update', data: { players: data, bullets }}))
    }
}

setInterval(() =>{
    movePlayers();
    moveBullets();
    outOfBoundsCheck();
    checkHit();
    sendInformationToPlayers();
}, INTERVAL);