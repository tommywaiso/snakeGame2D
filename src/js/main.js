const canvas = document.querySelector('#game');

const mappingFoot = document.querySelector('.header__foot');
const mappingRecord = document.querySelector('.header__record');
const mappingAttemps = document.querySelector('.header__attemps');

if (canvas.getContext) {
    const ctx   = canvas.getContext('2d');

    let mapWidth        = canvas.width;
    let mapHeight       = canvas.height;
    let defaultSpeed    = 5;                 // кол-во кадров (default)
    let speed           = 5;                 // кол-во кадров (скорость)
    let interval        = 1000 / speed;      // время между кадрами
    let then            = performance.now(); // время последнего кадра

    function speedSnake(speed) {
        interval = 1000 / speed;        // итервал между кадрами
    }
    
    let snake = {
        x:          mapWidth / 2,
        y:          mapHeight / 2,
        w:          32,
        h:          32,
        step:       32,
        moveX:      0,
        moveY:      0,
        fill:       '#56cefa',
        secFill:    '#2092bb',
        foot:       0,
        recordFoot: 0,
        body:       [],
        size:       3,
        defaultSize:3,
        attemps:    0,
        win:        300,
        activeKey:  true,
    }
    

    let foot = {
        x :         0,
        y :         0,
        fill:       '#fa5656',
    }

    localStor();
    function localStor() {
        if (localStorage.getItem('record')) {
            snake.recordFoot = localStorage.getItem('record');
            mappingRecord.innerHTML = snake.recordFoot;
            console.log(snake.recordFoot);
        } else {
            localStorage.setItem('record', snake.recordFoot)
        }
    }
    

    function animate(now) {
        requestAnimationFrame(animate);

        let delta = now - then; // время между кадрами
        if (delta > interval) {
            then = now - (delta % interval);
            ctx.clearRect(0, 0, mapWidth, mapHeight);

            drawSnake();
            drawFoot();
        }
    }

    document.addEventListener('keydown', control);
    function control(event) {
        animate(performance.now());
        e = event.keyCode;

        if (e === 37 && snake.moveX !== +snake.step && snake.activeKey === true) { snake.moveX = -snake.step;  snake.moveY = 0; snake.activeKey = false }
        if (e === 39 && snake.moveX !== -snake.step && snake.activeKey === true) { snake.moveX = +snake.step;  snake.moveY = 0; snake.activeKey = false }
        if (e === 38 && snake.moveY !== +snake.step && snake.activeKey === true) { snake.moveY = -snake.step;  snake.moveX = 0; snake.activeKey = false }
        if (e === 40 && snake.moveY !== -snake.step && snake.activeKey === true) { snake.moveY = +snake.step;  snake.moveX = 0; snake.activeKey = false }

        if (e === 32) restartGame();
    }
    
    drawSnake();
    function drawSnake() {
        ambit(); // не выйти за рамки поля
        
        ctx.fillStyle = snake.fill;
        ctx.fillRect(snake.x += snake.moveX, snake.y += snake.moveY, snake.w, snake.h);
        
        snake.body.unshift( { x: snake.x, y: snake.y } );
        if (snake.body.length > snake.size) { snake.body.splice( -(snake.body.length - snake.size)) } // убераем ненужный хвост

        if (snake.body[0].x === foot.x && snake.body[0].y === foot.y) {
            snake.size++;
            snake.foot++;

            upComplexitySnake();    // ускорение змеи
            refreshMeppingFoot();   // перереспить еду
            refreshRecordFoot();    // рекод
            positionFoot();         // куда именно поставить еду
        }

        snake.activeKey = true;     // разрешаем изменить путь змейки

        snake.body.forEach( function(el, index) {
            crachedIntoTheTail(el, index);

            if (index === snake.win) youWin();

            if (index === 0) {
                ctx.fillStyle = snake.fill
            } else {
                ctx.fillStyle = snake.secFill
            }
            ctx.fillRect(el.x, el.y, snake.step, snake.step)
        })
    }

    function crachedIntoTheTail(el, index) {  // проверка на "врезался ли я в хвост"
        if (snake.body.length > snake.defaultSize && snake.body[0].x === el.x && snake.body[0].y === el.y && index !== 0) restartGame();
    }

    function youWin() {
        alert(`Ты выйграл. Длина змеи ${snake.win}см.`)
        restartGame();
    }

    function ambit() {
        if (snake.x + snake.moveX >= mapWidth) snake.x = -snake.step
        if (snake.x + snake.moveX < 0) snake.x = mapWidth
        if (snake.y + snake.moveY >= mapHeight) snake.y = -snake.step
        if (snake.y + snake.moveY < 0) snake.y = mapHeight
    }

    // ===== foot ===== //
    function drawFoot() {
        ctx.fillStyle = foot.fill;
        ctx.fillRect(foot.x, foot.y, snake.w, snake.h);
    }

    function positionFoot() {
        let x = randomX();
        let y = randomY();
        let overlapping = false;
    
        // Проверяем, не перекрывается ли новое положение еды с какой-либо частью тела змеи
        snake.body.forEach(function(el) {
            if (el.x === x && el.y === y) {
                overlapping = true;
            }
        });
    
        if (overlapping) {
            positionFoot(); // Если есть перекрытие, генерируем новые координаты
        } else {
            foot.x = x;
            foot.y = y;
        }
    }    

    function randomX() { // рандомная позиция на карте кратная 32 (шагу) X
        return Math.floor(Math.random() * (mapWidth / snake.step)) * snake.step;
    }

    function randomY() { // рандомная позиция на карте кратная 32 (шагу) Y
        return Math.floor(Math.random() * (mapHeight / snake.step)) * snake.step;
    }

    function upComplexitySnake() {
        speedSnake(defaultSpeed + (snake.foot / 20))
    }

    // HEADER
    function refreshMeppingFoot() {
        mappingFoot.innerHTML = snake.foot;
    }

    function refreshRecordFoot() {
        if (snake.recordFoot < snake.foot) {
            snake.recordFoot = snake.foot;
            mappingRecord.innerHTML = snake.recordFoot;
            localStorage.setItem('record', snake.recordFoot);
        }
        mappingFoot.innerHTML = snake.foot;
    }

    function refreshAttempsFoot() {
        if (snake.attemps < 100) snake.attemps++;
        else snake.attemps = 0;
        mappingAttemps.innerHTML = snake.attemps;
    }

    function restartGame() {
        snake.size = snake.defaultSize;
        snake.foot = 0;
        refreshMeppingFoot();
        speedSnake(defaultSpeed);
        refreshAttempsFoot();
    }
}