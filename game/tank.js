var game;
var tank;
var turret;
var cursors;
var shadow;
var bullets;
var explosions;
var currentSpeed = 0;

var fireReloadDelay = 300;
var nextFire = 0;
//map
var blockedLayer;

function Tank(game) {
    this.game = game;

    this.currentSpeed = 0;
    this.fireReloadDelay = 300;
    this.nextFire = 0;
}

Tank.prototype.preload = function() {
    this.game.load.atlas('tank', 'assets/tank.png', 'assets/tank.json');
    // this.game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tank.json');
    this.game.load.image('bullet', 'assets/bullet.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
}

Tank.prototype.create = function(blockedLayer){
    this.blockedLayer = blockedLayer;
    this.setupTank();
    //  Our bullet group
    this.bullets = this.game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(30, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);

    //  Explosion pool
    this.explosions = this.game.add.group();

    for (var i = 0; i < 10; i++) {
        var explosionAnimation = this.explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    this.game.camera.follow(this.tank);
    this.game.camera.deadzone = new Phaser.Circle(this.game.width/2, this.game.height/2, 60, 60);

    this.cursors = this.game.input.keyboard.createCursorKeys();
}

Tank.prototype.setupTank = function() {
    this.tank = this.game.add.sprite(0, 0, 'tank', 'tank_base.png');
    this.tank.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.drag.set(0.2);
    this.tank.body.maxVelocity.setTo(400, 400);
    this.tank.body.collideWorldBounds = true;

    this.turret = this.game.add.sprite(0, 0, 'tank', 'tank_turret.png');
    this.turret.anchor.setTo(0.19, 0.5);

    this.shadow = this.game.add.sprite(0, 0, 'tank', 'tank_shadow.png');
    this.shadow.anchor.setTo(0.45, 0.45);

    this.tank.bringToTop();
    this.turret.bringToTop();


    //fix to tank start on center of view
    //should change game.camera view, but i've facing a issue that camera does not follow tank anymore
    this.tank.x = 600;
    this.tank.y = 300;

    this.game.camera.follow(this.tank);
    this.game.camera.focusOnXY(600,300);
}

Tank.prototype.update = function (crankAngle) {
    //collision
    this.game.physics.arcade.collide(this.tank, this.blockedLayer);

    if (this.cursors.left.isDown) {
        this.tank.angle -= 4;
    } else if (this.cursors.right.isDown) {
        this.tank.angle += 4;
    }

    if (this.cursors.up.isDown) {
        //  The speed we'll travel at
        currentSpeed = 200;
    } else {
        if (currentSpeed > 0) {
            currentSpeed -= 4;
        }
    }

    if (currentSpeed > 0) {
        this.game.physics.arcade.velocityFromRotation(this.tank.rotation, currentSpeed, this.tank.body.velocity);
    }

    //  Position all the parts and align rotations
    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
    
    if (crankAngle == undefined) {
        crankAngle = 0;
    }

    this.turret.rotation = this.tank.rotation + crankAngle;//this.game.physics.arcade.angleToPointer(this.turret);
    // this.turret.rotation = this.tank.rotation;
}

Tank.prototype.fire = function () {
    console.log(this.game.time.now);
    console.log(this.nextFire);
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
        this.nextFire = this.game.time.now + this.fireReloadDelay;
        var bullet = this.bullets.getFirstExists(false);
        bullet.reset(this.turret.x, this.turret.y);
        bullet.rotation = this.turret.rotation;
        bullet.body.velocity = this.game.physics.arcade.velocityFromAngle(bullet.angle, 300);
    }
}
