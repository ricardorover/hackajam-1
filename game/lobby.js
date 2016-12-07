function Lobby() {
}

Lobby.prototype.init = function(players) {
    this.lobby_players = players;
}

Lobby.prototype.preload = function() {
    game.load.bitmapFont('roboto', 'game/assets/carrier_command.png', 'game/assets/carrier_command.xml');

    game.load.image('menu', 'game/assets/lobby_background.png');
    game.load.image('back_button', 'game/assets/button_back.png');
    game.load.image('ready_button', 'game/assets/button_ready.png');
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
}

Lobby.prototype.create = function () {
    game.add.sprite(0, 0, 'menu');

    $.each(this.lobby_players, function(player_id, player) {
        if (player.number === 1) {
            showPlayer1(player.name);
        } else {
            showPlayer2(player.name);
        }
    });

    if (network_player.number == 1) {
        showPlayer1(network_player.name);
    } else {
        showPlayer2(network_player.name);
    }
    this.add.button(22, game.height - 92, 'back_button', this.back, this);
    this.add.button(game.width - 480, game.height - 92, 'ready_button', this.gameStart, this);
}

var player1Text;
function showPlayer1 (name) {
    game.world.remove(player1Text);
    player1Text = game.add.bitmapText(0, 200, 'roboto', name, 20);
    player1Text.x = 234 - (player1Text.width/2);
}

var player2Text;
function showPlayer2 (name) {
    game.world.remove(player2Text);
    player2Text = game.add.bitmapText(0, 200, 'roboto', name, 20);
    player2Text.x = 654 - (player2Text.width/2);
}

Lobby.prototype.gameStart = function () {
    game.sound.stopAll();
    this.state.start('Game', game);
}

Lobby.prototype.back = function () {
    this.state.start('Nickname');
}

network_callbacks.game_room_update_join = function(player_id, player_name) {
    var otherPlayerNumber = network_player.number === 1 ? 2 : 1;
    if (otherPlayerNumber === 1) {
        showPlayer1(player_name);
    } else {
        showPlayer2(player_name);
    }
    if (player_id != network_player.id) {
        setupPlayer1(network_player.id, player_id);
    }
};
network_callbacks.game_room_update_leave = function(player_id) {
    if (player_id === 1) {
        showPlayer1("");
    } else {
        showPlayer2("");
    }
};

function setupPlayer1(myID, otherPlayerID) {
    if (myID.localeCompare(otherPlayerID)) {
        network_player.number = 1;
    } else {
        network_player.number = 2;
    }
}
