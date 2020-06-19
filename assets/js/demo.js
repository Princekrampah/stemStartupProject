/**
 * This file contains the logic of the game for the startup challenge.
 * 
 * @author    [Your full name] <jsksprince@gmail.com>
 * @author    STEM Loyola <stemloyola@gmail.com>
 * @version   1.0
 * 
 * @copyright STEM Loyola 2020.
 */

'use strict';

// Canvas position in the browser window. 
// You may need to adjust these if not displayed well in your computer
const WIDTH = window.innerWidth * 0.8;  // Canvas width will be 80% of the browser's width
const HEIGHT = window.innerHeight - 100;  // Canvas height will be 100 pixels less than the browser's height
const OFFSET = 130;  // Distance between the fighter's feet and the bottom of browser's window

// Control fighter's movements
const GRAVITY = 0.92;  // How quickly the fighter returns to the ground
const FIGHTER_DY = -20;  // How high the fighter will jump
const FIGHTER_DX = 3;  // How fast the fighter will walk
const coinPositions = []; // to store coin positions, so multiple coins do not appear in same location

// Track game data
let fighter;  // A sprite storing the fighter details (e.g. position, speed, animations)
let coin;  // A sprite storing coin details
let monster;  // A sprite storing the monster's details

let animFighter;  // An array storing fighter's images used for animations
let animCoin;  // Coin animation images
let animMonster;  // Monster's animation images
let imgGround;  // A list of image used to build the ground
let imgBack;  // A list of images for the background background and its objects
let monsters;  // A group to add in the monsters
let coins;   // A group to add in the coins
let currentCoin; // to identify the current coin in the iteration
let jumpingCoins; // To count the number of jumping coins, which must not be more than 5.
let coinXPosition;
let x_position;
let monsterInView;


let timer = new Date()
/**
 * Executed once and loads resources into RAM before setup() is executed
 * Useful for loading images, sounds, etc. that usually are not loaded fast
 * enough for the performance needed in gaming and simulations.
 */
function preload() {

    // Load images for the background and its objects
    imgBack = {};
    imgBack['background'] = loadImage('assets/images/background.png');
    imgBack['bush'] = loadImage('assets/images/bush.png');
    imgBack['cactus'] = loadImage('assets/images/cactus.png');
    imgBack['skeleton'] = loadImage('assets/images/skeleton.png');
    imgBack['mushroom'] = loadImage('assets/images/mushroom.png');
    imgBack['crate'] = loadImage('assets/images/crate.png');
    imgBack['coin'] = loadImage('assets/images/coin/coin-1.png');



    // Load the ground images
    imgGround = {};
    imgGround['left'] = loadImage('assets/images/ground-left.png');
    imgGround['middle'] = loadImage('assets/images/ground-middle.png');

    // Load fighter animation images. Notice in loading an animation, 
    // only the first and last images need to be specified
    animFighter = {};
    animFighter['idle'] = loadAnimation('assets/images/fighter/Idle-1.png', 'assets/images/fighter/Idle-10.png');
    animFighter['walk'] = loadAnimation('assets/images/fighter/Walk-1.png', 'assets/images/fighter/Walk-10.png');
    animFighter["jump"] = loadAnimation('assets/images/fighter/Jump-1.png', 'assets/images/fighter/Jump-10.png');

    // Load coin animations
    animCoin = loadAnimation('assets/images/coin/coin-1.png', 'assets/images/coin/coin-16.png');

    // Load monster's animations
    animMonster = loadAnimation('assets/images/monster/monster-1.png', 'assets/images/monster/monster-19.png');

}

/**
 * Executed once and initializes the canvas and other data. 
 * Everything that should be done once and at the beginning of the app
 * (e.g. loading images, sounds) should be done in this function.
 */
function setup() {

    /*
     * Setup the canvas
     */

    // Append a canvas into the website page (inside 'demo-container')
    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('demo-container');


    /*
     * Build the fighter character
     */

    fighter = createSprite(80, HEIGHT - OFFSET);

    // Add all animations the fighter uses
    fighter.addAnimation('idling', animFighter['idle']);
    fighter.addAnimation('walking', animFighter['walk']);
    fighter.addAnimation('jumping', animFighter['jump']);

    // Reduce the size of the fighter to appear nicer on the screen
    fighter.scale = 0.25;

    // Set the fighter's collision boundary
    fighter.setCollider('circle', 0, 0, fighter.width / 2);

    // Define our own variable to track the state of the fighter
    fighter.isJumping = false;
    fighter.dy = FIGHTER_DY;
    fighter.score = 0;
    fighter.finalScore = 0;
    fighter.gameOver = false;
    fighter.won = false;



    /*
     * Build the coins group
     */

    coins = new Group()



    for (let i = 0; i < 20; i++) {

        x_position = random(20 + i, WIDTH * 1.3) * 1.5;
        coinPositions.push(x_position)
        coinXPosition = (coinPositions.pop() - x_position) < 100 ? x_position + 100 : x_position
        coin = createSprite(coinXPosition + 25, HEIGHT / 2.5);
        coin.addAnimation('spin', animCoin);
        coin.scale = 0.3;
        coin.dy = -2;
        coin.MAX_HEIGHT = (HEIGHT / 2)
        coins.add(coin);
        coin.canJump = false;
    }

    /*
     * Build the monsters group
     */

    monsters = new Group();
    jumpingCoins = 0;
    monsterInView = true;

}

/**
 * Runs continously after setup() and updates the state of the application.
 * Everything that should continously be checked, updated, and done should
 * be done from function
 */
function draw() {


    fighter.finalScore = fighter.score * 1000

    /*
     *  create the monsters basing on random values to increase unpredictability
     */



    if (monster != undefined && monster.position.x >= fighter.position.x - WIDTH * 0.0008) {
        monsterInView = false
    }
    if (monsterInView) {
        monster = createSprite(camera.position.x * 5.5, HEIGHT - OFFSET + 45);
        monster.addAnimation('walk', animMonster);
        monster.scale = 0.35;
        // setTimeout()
        monsters.add(monster);
    }
    if (monster != undefined) {

        let speed = random(-5, -(timer.getSeconds()));
        speed = constrain(speed, -7, -25);
        monster.setCollider('circle', 0, 0, monster.width / 7);
        monster.setVelocity(speed, 0);
        monsterInView = true

    }



    /*
     * Update the game elements that depend on user input
     */

    // Respond to pressed/released keys if the fighter is NOT currently jumping
    if (fighter.isJumping === false) {

        // Pressing the right arrow moves the fighter forwards
        if (keyWentDown(RIGHT_ARROW)) {
            fighter.changeAnimation('walking');
            fighter.setVelocity(FIGHTER_DX, 0);
        }

        // Releasing the right arrow stops the fighter
        if (keyWentUp(RIGHT_ARROW)) {
            fighter.changeAnimation('idling');
            fighter.setVelocity(0, 0);
        }

        // Pressing the up arrow starts the fighter's jump
        if (keyWentDown(UP_ARROW)) {
            fighter.isJumping = true;
            fighter.changeAnimation('jumping');
            fighter.setVelocity(0, 0);
        }
    } else { // Fighter is currently jumping

        // Calculate the new position. The new position is affected by 
        // fighter's current vertical speed. The current vertical speed
        // is affected by the vertical acceleration (a.k.a gravity)
        fighter.dy += GRAVITY;
        fighter.position.y += fighter.dy;
        fighter.position.y = constrain(fighter.position.y, 0, HEIGHT - OFFSET);

        // End the jump when the fighter returns to the ground
        if (fighter.position.y == HEIGHT - OFFSET) {
            fighter.isJumping = false;  // Mark the jump as finished
            fighter.dy = FIGHTER_DY;  // Reset initial vertical speed for the next jump

            // Fighter should now rest on the ground
            fighter.changeAnimation('idling');
        }
    }


    /*
     * Update the game elements that do not require user input
     */



    for (let i = 0; i < coins.length; i++) {
        currentCoin = coins[i]

        // Move the coin up and down
        if (jumpingCoins <= 5 && i % 3 == 0) {
            jumpingCoins++
            currentCoin.canJump = true;
        }

        if (currentCoin.canJump) {
            currentCoin.position.y += currentCoin.dy;
            currentCoin.position.y = constrain(currentCoin.position.y, 0, currentCoin.MAX_HEIGHT);

            if (currentCoin.position.y == 0 || currentCoin.position.y == currentCoin.MAX_HEIGHT) {
                currentCoin.dy = currentCoin.dy * -1;
            }
        }


        // Check if fighter has got a coin. If true, remove the coin from
        // the sketch and increase the score
        if (fighter.collide(currentCoin)) {
            fighter.score++
            currentCoin.remove();
        }
    }




    //  Setting the final score and score values


    // Check if the monster has bitten the fighter. If true, game is over
    // Instead of dealing with one monster we are dealing with the group of mosters
    if (fighter.collide(monsters)) {
        fighter.gameOver = true;
    }

    // Center the fighter on the screen for sometime
    if (fighter.position.x > WIDTH / 2 && fighter.position.x < WIDTH * 2) {
        camera.position.x = fighter.position.x;
    }

    if (fighter.position.x > WIDTH * 2.55) {
        fighter.gameOver = true;
    }

    if (coins.length == 0) {
        fighter.gameOver = true;
        fighter.won = true;
        fighter.position.y = HEIGHT - OFFSET
    }

    /*
     * Display the game elements based on the canvas
     */

    // Display the background and its objects
    background(imgBack['background']);

    image(imgBack['skeleton'], WIDTH * 0.4, HEIGHT - OFFSET + 45);
    image(imgBack['bush'], WIDTH * 0.8, HEIGHT - OFFSET);
    image(imgBack['cactus'], WIDTH * 1.6, HEIGHT - OFFSET - 35);
    image(imgBack['mushroom'], WIDTH * 1.55, HEIGHT - OFFSET + 40);
    image(imgBack['mushroom'], WIDTH * 1.75, HEIGHT - OFFSET + 40);
    image(imgBack['crate'], WIDTH * 0.5, HEIGHT - OFFSET - 27);
    image(imgBack['coin'], camera.position.x - (camera.position.y * 1.8), camera.position.y - 260, 35, 35);

    // Display the ground
    image(imgGround['left'], 10, HEIGHT - OFFSET + 75);


    for (let i = 1; i < 5 * WIDTH / imgGround['middle'].width; i++) {
        image(imgGround['middle'], imgGround['middle'].width * i + 10, HEIGHT - OFFSET + 75);
    }


    // Display the game over text and other text content
    if (fighter.gameOver) {

        textAlign(CENTER);
        textSize(40);
        text('GAME OVER', camera.position.x, camera.position.y);

        if (fighter.won) {
            textAlign(CENTER);
            textSize(40);
            text('YOU WON', camera.position.x, camera.position.y + 100);
        }

        textAlign(CENTER);
        textSize(30);
        text("Score: " + String(fighter.finalScore), camera.position.x, camera.position.y + 40);
        noLoop();
    }

    fill('tomato');
    textAlign(CENTER);
    textSize(20);
    text(String(fighter.finalScore), camera.position.x - (camera.position.y * 1.55), camera.position.y - 237);
    noFill();

    // Display all the sprites (e.g. fighter, monsters, coins)
    drawSprites();

}
