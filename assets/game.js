let player;
let broccoli;
let burger;
let hotdog;
let platforms;
let cursors;
let score = 0;
let gameOver = false;
let scoreText;
let gameStarted;
let gameOverText;
let gameFinished;
let music;

// window.PhaserGlobal = { disableWebAudio: false };

function preload () {

    this.load.image('field', 'assets/field.png');
    this.load.image('ground', 'assets/platforms.png');
    this.load.image('burger', 'assets/burger.png');
    this.load.image('hotdog', 'assets/hotdog.png');
    this.load.image('broccoli', 'assets/broccoli.png');
    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );    
    this.load.audio('calahorra', 'assets/audio/LaCalahorra.mp3');
}

// Sets up the scene
function create () {
    
    // Creates background first
    this.add.image(400, 300, 'field');      
    this.add.image(400, 600, 'burger');

    platforms = this.physics.add.staticGroup();

    // Made the bottom platform fit the width
    platforms.create(400, 600, 'ground').setScale(3).refreshBody();

    //  Creates the different level platforms
    platforms.create(600, 400, 'ground');
    platforms.create(10, 100, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
   
    
    // Creates the players settings
    player = this.physics.add.sprite(100, 450, 'dude');
    

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // Player collides with edges of the screen
    player.setCollideWorldBounds(true);
    player.body.setBounce(0.6);
    player.body.setGravityY(900);

    // Creates input cursor keys
    cursors = this.input.keyboard.createCursorKeys();


    burgers = this.physics.add.group({
        key: 'burger',
        repeat: 10, 
        setXY: { x: 11, y: 0, stepX: 76 }
    });
    
    burgers.children.iterate(child => {

        child.setBounce(Phaser.Math.FloatBetween(0.3, 0.7));

    });

    hotdog = this.physics.add.group();

    
    broccoli = this.physics.add.group();
    


    scoreText = this.add.text(32, 24, 'score: 0', { fontSize: '32px', fill: '#228B22' });
    scoreText.visible = false;
    gameOverText = this.add.text(200, 250, 'Game Over!', { fontSize: '64px', fill: '#000' });
    gameOverText.visible = false;

    //  This will allow collision between objects in the game
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(burgers, platforms);
    this.physics.add.collider(hotdog, platforms);
    this.physics.add.collider(broccoli, platforms);


    // Moved fucntions out of update
    let collectBurger = (player, burger) => {
        burger.disableBody(true, true);
    
        //  Add and update the score
        score += 5;
        scoreText.setText('Score: ' + score);
    
        if (burgers.countActive(true) === 0) {
            //  Adds more burgers
            burgers.children.iterate(child => {
    
                child.enableBody(true, child.x, 0, true, true);
    
            });
        
    
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
            var veggie = broccoli.create(x, 26, 'broccoli');
            veggie.setBounce(1);
            veggie.setCollideWorldBounds(true);
            veggie.setVelocity(Phaser.Math.Between(-200, 200), 20);
            veggie.allowGravity = false;
            var hotdogs = hotdog.create(x, 20, 'hotdog');
            hotdogs.setBounce(1);
            hotdogs.setCollideWorldBounds(true);
            hotdogs.setVelocity(Phaser.Math.Between(-200, 200), 20);
            hotdogs.allowGravity = false;
    
        }
    }

    let collectHotDog = (player, hotdog) => {
        hotdog.disableBody(true, true);

        score += 20;
        scoreText.setText('Score: ' + score);
        
    };

    let collideWithBroccoli = (player, veggie) => {
    
        gameOver = true;

        if (gameOver) {

            player.setVelocity(0,0);
            this.physics.pause();
            player.setTint(0xff0000);
            player.anims.play('turn');
            scoreText.visible = false;
            gameOverText.visible = true;
            gameOverText.setText('Game Over!');
            music.stop();


            // When clicked, the page will refresh and start a new game
            this.input.on("pointerdown", () => {
        
                    window.location.reload();
            
            });
        };
    };

    let startGame = () => {
        scoreText.visible = true;
        gameOverText.visible = false;
        gameStarted = true;
        gameFinished = false;
    };


    // let restartGame = () => {
    //     gameOver = false;
        
    //     score = 0
    //     scoreText.setText('Score: ' + score)
    //     startGame();
        
    // };



    //  Checks to see if the player overlaps with any items, if so call their respective functions
    this.physics.add.overlap(player, burgers, collectBurger, null, this);

    this.physics.add.collider(player, broccoli, collideWithBroccoli, null, this);

    this.physics.add.collider(player, hotdog, collectHotDog, null, this);

    this.input.on("pointerdown", () => {
       if(!gameStarted) {
           startGame();
           music.play();

       } 
       else if (gameStarted && music.isPlaying){
           music.pause();

       } else {
           music.resume();
       }
   });
   
   // Add pause & resume options, (pointer down), have sound stop once game over
   let music = this.sound.add('calahorra');


};

function update () {

    if (gameOver) {
        return;
    }
    // Player will not move unless cursors are pressed
    player.setVelocity(0,0);

    // Right, left, down and up(fly) keys
    if(gameStarted && !gameFinished) {
        if (cursors.left.isDown) { 

        player.setVelocityX(-220);
        player.anims.play('left');
    } else if (cursors.right.isDown) {

        player.setVelocityX(220);
        player.anims.play('right');
    } else {

        player.setVelocityX(0);
        player.anims.play('turn');
    }
    if (cursors.up.isDown) {
        
        player.setVelocityY(-330);
        player.anims.play('up');
    } else if (cursors.down.isDown) {
        player.setVelocityY(330);
        player.anims.play('down');
    }
  }

};