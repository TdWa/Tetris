const gameState = {
  bestScore: 0,
  speed: 5
};
  
const config = {
  type: Phaser.AUTO,
  width: 601,
  height: 801,
  backgroundColor: "000000",
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      enableBody: true,
    }
  },
  scene: [Scene1]
};

const game = new Phaser.Game(config);




