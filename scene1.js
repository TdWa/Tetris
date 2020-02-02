class Scene1 extends Phaser.Scene {
	constructor() {
		super({ key: 'Scene1' })
	}
	
	
	create() {
		//SOME INITIAL STATES 
		gameState.gameOver = false;
		gameState.isPaused = false;
		let stopOverlap = true;
		let score = 0;
		let rectangleState = 1;
		let triangleState = 1;
		let hammerState = 1;
		let zigzagState = 1;
		let currentShape = undefined;
		
		//ADDING BACKGROUND, FLOOR AND PLAYER SHAPES
		const background = this.add.grid(302, 402, config.width, config.height, 50, 50, 0xf0f8ff);
		const floor = this.add.rectangle(301, 776, 600, 50, 0x000000);
		this.physics.add.existing(floor);

		let clones = this.physics.add.group(); //this group is for interaction with player shapes, see overlap function below
		clones.addMultiple([floor]);

		const square = [this.add.grid(-1000, -1000, 100, 100, 50, 50, 0xff8c00), 0xff8c00, []]; //player shapes consisting of one or more grid rectangles
		this.physics.add.existing(square[0]);

		const rectangle1 = [this.add.grid(-1000, -1000, 200, 50, 50, 50, 0x00bfff), 0x00bfff, []];
		this.physics.add.existing(rectangle1[0]);	
		const rectangle2 = [this.add.grid(-1000, -1000, 50, 200, 50, 50, 0x00bfff), 0x00bfff, []];
		this.physics.add.existing(rectangle2[0]);

		const triangle1a = [this.add.grid(-1000, -1000, 50, 150, 50, 50, 0x9370db), 0x9370db, []];
		this.physics.add.existing(triangle1a[0]);
		const triangle2a = [this.add.grid(-1000, -1000, 150, 50, 50, 50, 0x9370db), 0x9370db, []];
		this.physics.add.existing(triangle2a[0]);
		const triangle12b = [this.add.grid(-1000, -1000, 50, 50, 50, 50, 0x9370db), 0x9370db, []];
		this.physics.add.existing(triangle12b[0]);

		const hammer1a = [this.add.grid(-1000, -1000, 50, 150, 50, 50, 0x8fbc8f), 0x8fbc8f, []];
		this.physics.add.existing(hammer1a[0]);
		const hammer2a = [this.add.grid(-1000, -1000, 150, 50, 50, 50, 0x8fbc8f), 0x8fbc8f, []];
		this.physics.add.existing(hammer2a[0]);
		const hammer12b = [this.add.grid(-1000, -1000, 50, 50, 50, 50, 0x8fbc8f), 0x8fbc8f, []];
		this.physics.add.existing(hammer12b[0]);

		const zigzag1a = [this.add.grid(-1000, -1000, 50, 100, 50, 50, 0xff6347), 0xff6347, []];
		this.physics.add.existing(zigzag1a[0]);
		const zigzag1b = [this.add.grid(-1000, -1000, 50, 100, 50, 50, 0xff6347), 0xff6347, []];
		this.physics.add.existing(zigzag1b[0]);
		const zigzag2a = [this.add.grid(-1000, -1000, 100, 50, 50, 50, 0xff6347), 0xff6347, []];
		this.physics.add.existing(zigzag2a[0]);
		const zigzag2b = [this.add.grid(-1000, -1000, 100, 50, 50, 50, 0xff6347), 0xff6347, []];
		this.physics.add.existing(zigzag2b[0]);

		//ADDING TEXTS
		this.add.text(20, 753, 'P = pause', {fill: '#ffffff', fontSize: '15px'});
		this.add.text(20, 768, 'R = restart', {fill: '#ffffff', fontSize: '15px'});
		this.add.text(20, 783, 'A/D = change speed', {fill: '#ffffff', fontSize: '15px'});
		this.add.text(230, 753, 'SHIFT = rotate', {fill: '#ffffff', fontSize: '15px'});
		this.add.text(230, 768, 'SPACE = shoot down', {fill: '#ffffff', fontSize: '15px'});
		const currentSpeedText = this.add.text(230, 783, `Speed: ${gameState.speed}`, {fill: '#ffffff', fontSize: '15px'});
		const scoreText = this.add.text(430, 757, `Score: ${score}`, {fill: '#ffffff', fontSize: '17px'});
		this.add.text(430, 777, `Best score: ${gameState.bestScore}`, {fill: '#ffffff', fontSize: '17px'});
		const pauseText = this.add.text(220, 155, '', { fontSize: '45px', fill: '#000000' });
		pauseText.depth = 5000;
		const messageText = this.add.text(42, 202, "", {fill: '#000000', fontSize: '55px'});
		messageText.depth = 5000;

		//SWAPPING BETWEEN SHAPES
		const shapes = [square[0], rectangle1[0], rectangle2[0], triangle1a[0],
		triangle2a[0], triangle12b[0], hammer1a[0], hammer2a[0], hammer12b[0], 
		zigzag1a[0], zigzag1b[0], zigzag2a[0], zigzag2b[0]];

		const swapToNewShape = (/*notThisShape*/) => { //picks a random shape to fall down from the top and keeps other shapes outside the grid 
			
			/*let options;		//when I don't want the same shape twice in a row for a test
			let i;
			let n;
			switch (notThisShape) { 
				case 'square':
				options = [2, 3, 4, 5];
				i = Math.floor(Math.random() * 4);
				n = options[i];
				break;
				case 'rectangle':
				options = [1, 3, 4, 5];
				i = Math.floor(Math.random() * 4);
				n = options[i];
				break;
				case 'triangle':
				options = [1, 2, 4, 5];
				i = Math.floor(Math.random() * 4);
				n = options[i];
				break;
				case 'hammer':
				options = [1, 2, 3, 5];
				i = Math.floor(Math.random() * 4);
				n = options[i];
				break;
				case 'zigzag':
				options = [1, 2, 3, 4];
				i = Math.floor(Math.random() * 4);
				n = options[i];
				break;
				case undefined:
				options = [1, 2, 3, 4, 5];
				i = Math.floor(Math.random() * 5);
				n = options[i];
				break;
			}*/
			
			function turnOthersOff(currentShape1, currentShape2) {
				shapes.forEach((shape) => {
					if (shape != currentShape1 && shape != currentShape2) {
						shape.body.velocity.y = 0;
						shape.x = -1000;
						shape.y = -1000;
					}
				});
			}
			
			const n = Math.random();
			if (n < 1/5 /*=== 1*/) {
				currentShape = 'square';
				square[0].body.velocity.y = gameState.speed*15;
				turnOthersOff(square[0], undefined);
				square[0].x = 301;
				square[0].y = 51;
			}
			else if (n >= 1/5 && n < 2/5 /*=== 2*/) {
				currentShape = 'rectangle';
				rectangleState = 1;
				rectangle1[0].body.velocity.y = gameState.speed*15;
				turnOthersOff(rectangle1[0], undefined);
				rectangle1[0].x = 301;
				rectangle1[0].y = 26;
			}
			else if (n >= 2/5 && n < 3/5 /*=== 3*/) {
				currentShape = 'triangle';
				triangleState = 1;
				triangle1a[0].body.velocity.y = gameState.speed*15;
				triangle12b[0].body.velocity.y = gameState.speed*15;
				turnOthersOff(triangle1a[0], triangle12b[0]);
				triangle1a[0].x = 276;
				triangle1a[0].y = 26;
				triangle12b[0].x = 326;
				triangle12b[0].y = 26;
			}
			else if (n >= 3/5 && n < 4/5 /*=== 4*/) {
				currentShape = 'hammer';
				hammerState = 1;
				hammer1a[0].body.velocity.y = gameState.speed*15;
				hammer12b[0].body.velocity.y = gameState.speed*15;
				turnOthersOff(hammer1a[0], hammer12b[0]);
				hammer1a[0].x = 276;
				hammer1a[0].y = 26;
				hammer12b[0].x = 326;
				hammer12b[0].y = -24;
			}
			else {
				currentShape = "zigzag";
				zigzagState = 1;
				zigzag1a[0].body.velocity.y = gameState.speed*15;
				zigzag1b[0].body.velocity.y = gameState.speed*15;
				turnOthersOff(zigzag1a[0], zigzag1b[0]);
				zigzag1a[0].x = 276;
				zigzag1a[0].y = 51;
				zigzag1b[0].x = 326;
				zigzag1b[0].y = 1;
			}
		}
		swapToNewShape(/*currentShape*/);		

		//PAUSE
		this.input.keyboard.on('keyup-' + 'P', () => {
			if (!gameState.isPaused) {
				this.physics.pause();
				gameState.isPaused = true;
				pauseText.setText("Paused");
			}
			else {
				this.physics.resume();
				gameState.isPaused = false;
				pauseText.setText("");
			}
		});

		//RESTART
		this.input.keyboard.on('keyup-' + 'R', () => {
			this.scene.restart();
		});

		//FOR BEING ABLE ALLIGN THE SHAPES WHEN AN OVERLAP HAPPENS
		let oddShapeY = -24;
		for (let i = 0;i<16;i++) {
			rectangle1[2].push(oddShapeY);
			triangle1a[2].push(oddShapeY);
			triangle2a[2].push(oddShapeY);
			triangle12b[2].push(oddShapeY);
			hammer1a[2].push(oddShapeY);
			hammer2a[2].push(oddShapeY);
			hammer12b[2].push(oddShapeY);
			zigzag2a[2].push(oddShapeY);
			zigzag2b[2].push(oddShapeY);
			oddShapeY += 50;
		}

		let evenShapeY = 1;
		for (let i = 0;i<15;i++) {
			square[2].push(evenShapeY);
			rectangle2[2].push(evenShapeY);
			zigzag1a[2].push(evenShapeY);
			zigzag1b[2].push(evenShapeY);
			evenShapeY += 50;
		}

		//FOR WHEN YOU LAND ON SOMETHING
		const addOverlap = (shape1, shape2) => {
			this.physics.add.overlap(shape1[0], clones, () => {
				if (!stopOverlap) { 
					stopOverlap = true;
					if (shape1 === triangle12b && triangleState % 2 != 0) {
						shape2 = triangle1a;
					}
					else if (shape1 === triangle12b && triangleState % 2 === 0) {
						shape2 = triangle2a;
					}
					else if (shape1 === hammer12b && hammerState % 2 != 0) {
						shape2 = hammer1a;
					}
					else if (shape1 === hammer12b && hammerState % 2 === 0) {
						shape2 = hammer2a;
					}
					if ((currentShape === 'square' && shape1[0].y < 52) || //gameover conditions
						(currentShape === 'rectangle' && rectangleState % 2 != 0 && shape1[0].y < 27) ||
						(currentShape === 'rectangle' && rectangleState % 2 === 0 && shape1[0].y < 52) ||
						(currentShape === 'triangle' && triangleState % 2 != 0 && shape1[0].y < 77) ||
						(currentShape === 'triangle' && triangleState % 2 === 0 && shape1[0].y < 27) ||
						(currentShape === 'hammer' && hammerState % 2 != 0 && hammer1a[0].y < 77) ||
						(currentShape === 'hammer' && hammerState === 2 && hammer2a[0].y < 27) ||
						(currentShape === 'hammer' && hammerState === 4 && hammer2a[0].y < 77) ||
						(currentShape === 'zigzag' && zigzagState % 2 != 0 && zigzag1a[0].y < 102) ||
						(currentShape === 'zigzag' && zigzagState % 2 === 0 && zigzag2a[0].y < 27)) {
						gameState.gameOver = true;
						if (score > gameState.bestScore) {
							gameState.bestScore = score;
							messageText.setText(`   /// ${gameState.bestScore} \\\\\\ \nNEW BEST SCORE!!`);
						}
						else {
							messageText.setText("Game Over");
						}
					}
					if (!gameState.gameOver) {
						function closeY(value) { //find the correct x and y for the shape that will be placed when you hit something
							return Math.abs(shape1[0].y - value) < 25;
						}
						const shapeX = shape1[0].x;	
						const shapeYArr = shape1[2].filter(closeY);
						const shapeY = shapeYArr[0];
						score += 1;
						scoreText.setText(`Score: ${score}`);
						shape1[0].x = -1000; //move the shape out of sight 
						shape1[0].y = -1000;
						if (shape2 != undefined) {
							shape2[0].x = -1000;
							shape2[0].y = -1000;
						}
						
						const addClone = (x1, y1, x2, y2, x3, y3, x4, y4, color) => { //will add 4 small blocks in the shape of the shape (given the right coordinates)
							let clone1X = shapeX + x1; let clone1Y = shapeY + y1; //I'm using small 1by1 blocks because I want to destroy rows when they are full 
							let clone2X = shapeX + x2; let clone2Y = shapeY + y2;
							let clone3X = shapeX + x3; let clone3Y = shapeY + y3;
							let clone4X = shapeX + x4; let clone4Y = shapeY + y4;
							const clone1 = this.add.grid(clone1X, clone1Y, 50, 50, 50, 50, color); 
							this.physics.add.existing(clone1);
							const clone2 = this.add.grid(clone2X, clone2Y, 50, 50, 50, 50, color);
							this.physics.add.existing(clone2);
							const clone3 = this.add.grid(clone3X, clone3Y, 50, 50, 50, 50, color);
							this.physics.add.existing(clone3);
							const clone4 = this.add.grid(clone4X, clone4Y, 50, 50, 50, 50, color);
							this.physics.add.existing(clone4);
							clones.addMultiple([clone1, clone2, clone3, clone4]);
						}

						if (shape1 === square) {
							addClone(-25, -25, -25, 25, 25, -25, 25, 25, shape1[1]);
						}
		
						else if (shape1 === rectangle1) {
							addClone(-25, 0, -75, 0, 25, 0, 75, 0, shape1[1]);
						}
						else if (shape1 === rectangle2) {
							addClone(0, -25, 0, -75, 0, 25, 0, 75, shape1[1]);
						}
		
						else if (shape1 === triangle1a) {
							if (triangleState === 1) {
								addClone(0, -50, 0, 0, 0, 50, 50, 0, shape1[1]);
							}
							else if (triangleState === 3) {
								addClone(0, -50, 0, 0, 0, 50, -50, 0, shape1[1]);
							}
						}
						else if (shape1 === triangle2a) {
							if (triangleState === 2) {
								addClone(-50, 0, 0, 0, 50, 0, 0, 50, shape1[1]);
							}
							else if (triangleState === 4) {
								addClone(-50, 0, 0, 0, 50, 0, 0, -50, shape1[1]);
							}
						}
						else if (shape1 === triangle12b) {
							if (triangleState === 1) {
								addClone(0, 0, -50, -50, -50, 0, -50, 50, shape1[1]);
							}
							else if (triangleState === 2) {
								addClone(0, 0, -50, -50, 0, -50, 50, -50, shape1[1]);
							}
							else if (triangleState === 3) {
								addClone(0, 0, 50, -50, 50, 0, 50, 50, shape1[1]);
							}
							else if (triangleState === 4) {
								addClone(0, 0, -50, 50, 0, 50, 50, 50, shape1[1]);
							}
						}
		
						else if (shape1 === hammer1a) {
							if (hammerState === 1) {
								addClone(0, -50, 0, 0, 0, 50, 50, -50, shape1[1]);
							}
							else if (hammerState === 3) {
								addClone(0, -50, 0, 0, 0, 50, -50, 50, shape1[1]);
							}
						}
						else if (shape1 === hammer2a) {
							if (hammerState === 2) {
								addClone(-50, 0, 0, 0, 50, 0, 50, 50, shape1[1]);
							}
							else if (hammerState === 4) {
								addClone(-50, 0, 0, 0, 50, 0, -50, -50, shape1[1]);
							}
						}
						else if (shape1 === hammer12b) {
							if (hammerState === 1) {
								addClone(0, 0, -50, 0, -50, 50, -50, 100, shape1[1]);
							}
							else if (hammerState === 2) {
								addClone(0, 0, 0, -50, -50, -50, -100, -50, shape1[1]);
							}
							else if (hammerState === 3) {
								addClone(0, 0, 50, 0, 50, -50, 50, -100, shape1[1]);
							}
							else if (hammerState === 4) {
								addClone(0, 0, 0, 50, 50, 50, 100, 50, shape1[1]);
							}
						}
		
						else if (shape1 === zigzag1a) {
							if (zigzagState === 1) {
								addClone(0, 25, 0, -25, 50, -25, 50, -75, shape1[1]);
							}
							else if (zigzagState === 3) {
								addClone(0, 25, 0, -25, -50, 25, -50, 75, shape1[1]);
							}
						}
						else if (shape1 === zigzag1b) {
							if (zigzagState === 1) {
								addClone(0, 25, 0, -25, -50, 25, -50, 75, shape1[1]);
							}
							else if (zigzagState === 3) {
								addClone(0, 25, 0, -25, 50, -25, 50, -75, shape1[1]);
							}
						}
						else if (shape1 === zigzag2a) {
							if (zigzagState === 2) {
								addClone(25, 0, -25, 0, 25, 50, 75, 50, shape1[1]);
							}
							else if (zigzagState === 4) {
								addClone(25, 0, -25, 0, -25, -50, -75, -50, shape1[1]);
							}
						}
						else if (shape1 === zigzag2b) {
							if (zigzagState === 2) {
								addClone(25, 0, -25, 0, -25, -50, -75, -50, shape1[1]);
							}
							else if (zigzagState === 4) {
								addClone(25, 0, -25, 0, 25, 50, 75, 50, shape1[1]);
							}
						}
						swapToNewShape(/*currentShape*/);
					}
				}
			});
		}
		addOverlap(square, undefined);
		addOverlap(rectangle1, undefined);
		addOverlap(rectangle2, undefined);
		addOverlap(triangle1a, triangle12b);
		addOverlap(triangle2a, triangle12b);
		addOverlap(triangle12b, undefined);
		addOverlap(hammer1a, hammer12b);
		addOverlap(hammer2a, hammer12b);
		addOverlap(hammer12b, undefined);
		addOverlap(zigzag1a, zigzag1b);
		addOverlap(zigzag1b, zigzag1a);
		addOverlap(zigzag2a, zigzag2b);
		addOverlap(zigzag2b, zigzag2a);

		//CAN REUSE THIS BELOW TO AVOID SOME DUPLICATION
		function shapeAssigner() {
			let shape1;
			let shape2;
			if (currentShape === 'square') {
				shape1 = square[0];
				shape2 = undefined;
			}
			else if (currentShape === 'rectangle') {
				shape2 = undefined;
				if (rectangleState % 2 != 0) {
					shape1 = rectangle1[0];
				}
				else {
					shape1 = rectangle2[0];
				}
			}
			else if (currentShape === 'triangle') {
				shape2 = triangle12b[0];
				if (triangleState % 2 != 0) {
					shape1 = triangle1a[0];
				}
				else {
					shape1 = triangle2a[0];
				}
			}
			else if (currentShape === 'hammer') {
				shape2 = hammer12b[0];
				if (hammerState % 2 != 0) {
					shape1 = hammer1a[0];
				}
				else {
					shape1 = hammer2a[0];
				}
			}
			else if (currentShape === 'zigzag') {
				if (zigzagState % 2 != 0) {
					shape1 = zigzag1a[0];
					shape2 = zigzag1b[0];
				}
				else {
					shape1 = zigzag2a[0];
					shape2 = zigzag2b[0];
				}
			}
			return [shape1, shape2];
		}

		//TURNING STOPOVERLAP OFF WHEN HITTING CLONE BELOW
		function overlappingBelow() {
			let shape1 = shapeAssigner()[0];
			let shape2 = shapeAssigner()[1];

			clones.getChildren().some((clone) => {
				if (clone.y > shape1.y && Math.abs(clone.x - shape1.x) < (clone.width + shape1.width)/2 - 2 &&
				Math.abs(clone.y - shape1.y) < (clone.height + shape1.height)/2) {
					stopOverlap = false;
				}
			});

			if (shape2 != undefined) {
				clones.getChildren().some((clone) => {
					if (clone.y > shape2.y && Math.abs(clone.x - shape2.x) < (clone.width + shape2.width)/2 - 2 &&
					Math.abs(clone.y - shape2.y) < (clone.height + shape2.height)/2) {
						stopOverlap = false;
					}
				});
			}
		}
		this.time.addEvent({
            delay: 10,
            callback: overlappingBelow,
            loop: true,
		});

		//SLOW DOWN
		this.input.keyboard.on('keyup-' + 'A', () => {
			if (gameState.speed > 0) {
				gameState.speed--;
				currentSpeedText.setText(`Speed: ${gameState.speed}`);
				if (currentShape === 'square' || currentShape === 'rectangle') {
					shapeAssigner()[0].body.velocity.y -= 15;
				}
				else {
					shapeAssigner()[0].body.velocity.y -= 15;
					shapeAssigner()[1].body.velocity.y -= 15;
				}
			}
		});

		//SPEED UP
		this.input.keyboard.on('keyup-' + 'D', () => {
			if (gameState.speed < 10) {
				gameState.speed++;
				currentSpeedText.setText(`Speed: ${gameState.speed}`);
				if (currentShape === 'square' || currentShape === 'rectangle') {
					shapeAssigner()[0].body.velocity.y += 15;
				}
				else {
					shapeAssigner()[0].body.velocity.y += 15;
					shapeAssigner()[1].body.velocity.y += 15;
				}
			}
		});
		
		//SHOOT DOWN
		this.input.keyboard.on('keyup-' + 'SPACE', () => {
			function shootDown() {
				let shape1 = shapeAssigner()[0];
				let shape2 = shapeAssigner()[1];
				let distance1;
				let distance2 = Infinity;
				const cloneDistances1 = [];
				const cloneDistances2 = [];
				const eligibleClones1 = [];
				const eligibleClones2 = [];
		
				clones.getChildren().forEach((clone) => {
					if (clone.y > shape1.y && Math.abs(clone.x - shape1.x) < (clone.width + shape1.width)/2) {
						cloneDistances1.push(clone.y);
						eligibleClones1.push(clone);
					}
				});
				const closestY = Math.min.apply(null, cloneDistances1);
				eligibleClones1.forEach((clone) => {
					if (clone.y === closestY) {
						distance1 = Math.abs(clone.y - shape1.y) - (clone.height + shape1.height)/2;
					}
				});
				
				if (shape2 != undefined) {   
					clones.getChildren().forEach((clone) => {
						if (clone.y > shape2.y && Math.abs(clone.x - shape2.x) < (clone.width + shape2.width)/2) {
							cloneDistances2.push(clone.y);
							eligibleClones2.push(clone);
						}
					});
					const closestY = Math.min.apply(null, cloneDistances2);
					eligibleClones2.forEach((clone) => {
						if (clone.y === closestY) {
							distance2 = Math.abs(clone.y - shape2.y) - (clone.height + shape2.height)/2;
						}
					});
				}
		
				let teleportDistance = Math.min(distance1, distance2);
				shape1.y += teleportDistance;
				if (shape2 != undefined) {shape2.y += teleportDistance;}  
			}
			shootDown();
		});

		//FOR CHECKING IF CLONE ITEMS IN ARRAY AREN'T TOO CLOSE TO BE ABLE TO MOVE CLOSER
		const tooCloseLeft = (clone) => {
			const shape1 = shapeAssigner()[0];
			const shape2 = shapeAssigner()[1];
			const distance1X = Math.abs(clone.x - shape1.x);
			const minDistance1X = (clone.width + shape1.width)/2 + 50;
			if (currentShape === 'square' || currentShape === 'rectangle') {
				if (shape1.x > clone.x && Math.abs(clone.y - shape1.y) < (clone.height + shape1.height)/2 - 7) {
					return distance1X < minDistance1X;
				}
				else {
					return false;
				}
			}
			else {
				const distance2X = Math.abs(clone.x - shape2.x);
				const minDistance2X = (clone.width + shape2.width)/2 + 50;
				let a, b;
				if (shape1.x > clone.x && Math.abs(clone.y - shape1.y) < (clone.height + shape1.height)/2 - 7) {
					a = distance1X < minDistance1X;
				}
				else {
					a = false;
				}
				if (shape2.x > clone.x && Math.abs(clone.y - shape2.y) < (clone.height + shape2.height)/2 - 7) {
					b = distance2X < minDistance2X;
				}
				else {
					b = false;
				}
				return a || b;
			}
		}
		const tooCloseRight = (clone) => {
			const shape1 = shapeAssigner()[0];
			const shape2 = shapeAssigner()[1];
			const distance1X = Math.abs(clone.x - shape1.x);
			const minDistance1X = (clone.width + shape1.width)/2 + 50;
			if (currentShape === 'square' || currentShape === 'rectangle') {
				if (shape1.x < clone.x && Math.abs(clone.y - shape1.y) < (clone.height + shape1.height)/2 - 7) {
					return distance1X < minDistance1X;
				}
				else {
					return false;
				}
			}
			else {
				const distance2X = Math.abs(clone.x - shape2.x);
				const minDistance2X = (clone.width + shape2.width)/2 + 50;
				let a, b;
				if (shape1.x < clone.x && Math.abs(clone.y - shape1.y) < (clone.height + shape1.height)/2 - 7) {
					a = distance1X < minDistance1X;
				}
				else {
					a = false;
				}
				if (shape2.x < clone.x && Math.abs(clone.y - shape2.y) < (clone.height + shape2.height)/2 - 7) {
					b = distance2X < minDistance2X;
				}
				else {
					b = false;
				}
				return a || b;
			}
		}

		const tooCloseDown = (clone) => {
			const shape1 = shapeAssigner()[0];
			const shape2 = shapeAssigner()[1];
			const distance1Y = Math.abs(clone.y - shape1.y);
			const minDistance1Y = (clone.height + shape1.height)/2 + 45;
			if (currentShape === 'square' || currentShape === 'rectangle') {
				if (shape1.y < clone.y && Math.abs(clone.x - shape1.x) < (clone.width + shape1.width)/2) {
					return distance1Y < minDistance1Y;
				}
				else {
					return false;
				}
			}
			else {
				const distance2Y = Math.abs(clone.y - shape2.y);
				const minDistance2Y = (clone.height + shape2.height)/2 + 45;
				let a, b;
				if (shape1.y < clone.y && Math.abs(clone.x - shape1.x) < (clone.width + shape1.width)/2) {
					a = distance1Y < minDistance1Y;
				}
				else {
					a = false;
				}
				if (shape2.y < clone.y && Math.abs(clone.x - shape2.x) < (clone.width + shape2.width)/2) {
					b = distance2Y < minDistance2Y;
				}
				else {
					b = false;
				}
				return a || b;
			}
		}

		//MOVING
		this.input.keyboard.on('keyup-' + 'RIGHT', () => {
			if (gameState.isPaused === false && !clones.getChildren().some(tooCloseRight)) {
				if (currentShape === 'square' && square[0].x < 551) {
					square[0].x += 50;
				}
				else if (currentShape === 'rectangle') {
					if (rectangleState % 2 != 0 && rectangle1[0].x < 501) {
						rectangle1[0].x += 50;
					}
					else if (rectangleState % 2 === 0 && rectangle2[0].x < 551) {
						rectangle2[0].x += 50;
					}
				}
				else if (currentShape === 'triangle') {
					if (triangleState === 1 && triangle1a[0].x < 526) {
						triangle1a[0].x += 50;
						triangle12b[0].x += 50;
					}
					else if (triangleState === 3 && triangle1a[0].x < 576) {
						triangle1a[0].x += 50;
						triangle12b[0].x += 50;
					}
					else if (triangleState % 2 === 0 && triangle2a[0].x < 526) {
						triangle2a[0].x += 50;
						triangle12b[0].x += 50;
					}
				}
				else if (currentShape === 'hammer') {
					if (hammerState === 1 && hammer1a[0].x < 526) {
						hammer1a[0].x += 50;
						hammer12b[0].x += 50;
					}
					else if (hammerState === 3 && hammer1a[0].x < 576) {
						hammer1a[0].x += 50;
						hammer12b[0].x += 50;
					}
					else if (hammerState % 2 === 0 && hammer2a[0].x < 526) {
						hammer2a[0].x += 50;
						hammer12b[0].x += 50;
					}
				}
				else if (currentShape === 'zigzag') {
					if (zigzagState === 1 && zigzag1a[0].x < 526) {
						zigzag1a[0].x += 50;
						zigzag1b[0].x += 50;
					}
					else if (zigzagState === 2 && zigzag2a[0].x < 501) {
						zigzag2a[0].x += 50;
						zigzag2b[0].x += 50;
					}
					else if (zigzagState === 3 && zigzag1a[0].x < 576) {
						zigzag1a[0].x += 50;
						zigzag1b[0].x += 50;
					}
					else if (zigzagState === 4 && zigzag2a[0].x < 526) {
						zigzag2a[0].x += 50;
						zigzag2b[0].x += 50;
					}
				}
			}
		});
		
		this.input.keyboard.on('keyup-' + 'LEFT', () => {
			if (gameState.isPaused === false && !clones.getChildren().some(tooCloseLeft)) {
				if (currentShape === 'square' && square[0].x > 51) {
					square[0].x -= 50;
				}
				else if (currentShape === 'rectangle') {
					if (rectangleState % 2 != 0 && rectangle1[0].x > 101) {
						rectangle1[0].x -= 50;
					}
					else if (rectangleState % 2 === 0 && rectangle2[0].x > 51) {
						rectangle2[0].x -= 50;
					}
				}
				else if (currentShape === 'triangle') {
					if (triangleState === 1 && triangle1a[0].x > 26) {
						triangle1a[0].x -= 50;
						triangle12b[0].x -= 50;
					}
					else if (triangleState === 3 && triangle1a[0].x > 76) {
						triangle1a[0].x -= 50;
						triangle12b[0].x -= 50;
					}
					else if (triangleState % 2 === 0 && triangle2a[0].x > 76) {
						triangle2a[0].x -= 50;
						triangle12b[0].x -= 50;
					}
				}
				else if (currentShape === 'hammer') {
					if (hammerState === 1 && hammer1a[0].x > 26) {
						hammer1a[0].x -= 50;
						hammer12b[0].x -= 50;
					}
					else if (hammerState === 3 && hammer1a[0].x > 76) {
						hammer1a[0].x -= 50;
						hammer12b[0].x -= 50;
					}
					else if (hammerState % 2 === 0 && hammer2a[0].x > 76) {
						hammer2a[0].x -= 50;
						hammer12b[0].x -= 50;
					}
				}
				else if (currentShape === 'zigzag') {
					if (zigzagState === 1 && zigzag1a[0].x > 26) {
						zigzag1a[0].x -= 50;
						zigzag1b[0].x -= 50;
					}
					else if (zigzagState === 2 && zigzag2a[0].x > 51) {
						zigzag2a[0].x -= 50;
						zigzag2b[0].x -= 50;
					}
					else if (zigzagState === 3 && zigzag1a[0].x > 76) {
						zigzag1a[0].x -= 50;
						zigzag1b[0].x -= 50;
					}
					else if (zigzagState === 4 && zigzag2a[0].x > 101) {
						zigzag2a[0].x -= 50;
						zigzag2b[0].x -= 50;
					}
				}
			}
		});

		this.input.keyboard.on('keyup-' + 'DOWN', () => {
			if (gameState.isPaused === false && !clones.getChildren().some(tooCloseDown)) {
				if (currentShape === 'square') {
					square[0].y += 50;
				}
				else if (currentShape === 'rectangle') {
					if (rectangleState % 2 != 0) {
						rectangle1[0].y += 50;
					}
					else {
						rectangle2[0].y += 50;
					}
				}
				else if (currentShape === 'triangle') {
					if (triangleState % 2 != 0) {
						triangle1a[0].y += 50;
						triangle12b[0].y += 50;
					}
					else {
						triangle2a[0].y += 50;
						triangle12b[0].y += 50;
					}
				}
				else if (currentShape === 'hammer') {
					if (hammerState % 2 != 0) {
						hammer1a[0].y += 50;
						hammer12b[0].y += 50;
					}
					else {
						hammer2a[0].y += 50;
						hammer12b[0].y += 50;
					}
				}
				else if (currentShape === 'zigzag') {
					if (zigzagState % 2 != 0) {
						zigzag1a[0].y += 50;
						zigzag1b[0].y += 50;
					}
					else if (zigzagState % 2 === 0) {
						zigzag2a[0].y += 50;
						zigzag2b[0].y += 50;
					}
				}
			}
		});

		//FOR CHECKING IF CLONE ITEMS IN ARRAY AREN'T TOO CLOSE TO BE ABLE TO ROTATE
		const tooCloseToCloneToRotate = (clone) => {
			let shape;
			let a, b;
			if (currentShape === 'rectangle') {
				if (rectangleState % 2 != 0) {
					shape = rectangle1[0];
				}
				else {
					shape = rectangle2[0];
				}
				const distanceX = Math.abs(clone.x - shape.x);
				const minDistanceX1 = (clone.width + shape.width)/2 + 50;
				const minDistanceX2 = (clone.width + shape.width)/2 + 100;
				const distanceY = Math.abs(clone.y - shape.y);
				const minDistanceY1 = (clone.height + shape.height)/2 + 50;
				const minDistanceY2 = (clone.height + shape.height)/2 + 100;
				if (rectangleState === 1)	{
					if (shape.y > clone.y && distanceX < (clone.width + shape.width)/2 && clone.x - clone.width/2 < shape.x) {
						a = distanceY < minDistanceY1;
					}
					else {a = false;}
					if (shape.y < clone.y && distanceX < (clone.width + shape.width)/2 && clone.x + clone.width/2 > shape.x - 50) {
						b = distanceY < minDistanceY2;
					}
					else {b = false;}
					return a || b;	
				}
				else if (rectangleState === 2) { 
					if (shape.x > clone.x && distanceY < (clone.height + shape.height)/2 && clone.y + clone.height/2 > shape.y - 50) {
						a = distanceX < minDistanceX2;
					}
					else {a = false;}
					if (shape.x < clone.x && distanceY < (clone.height + shape.height)/2 && clone.y - clone.height/2 < shape.y) {
						b = distanceX < minDistanceX1;
					}
					else {b = false;}
					return a || b;	
				}
				else if (rectangleState === 3) {
					if (shape.y > clone.y && distanceX < (clone.width + shape.width)/2 && clone.x - clone.width/2 < shape.x + 50) {
						a = distanceY < minDistanceY2;
					}
					else {a = false;}
					if (shape.y < clone.y && distanceX < (clone.width + shape.width)/2 && clone.x + clone.width/2 > shape.x) {
						b = distanceY < minDistanceY1;
					}
					else {b = false;}
					return a || b;
				}
				else if (rectangleState === 4) {
					if (shape.x > clone.x && distanceY < (clone.height + shape.height)/2 && clone.y + clone.height/2 > shape.y) {
						a = distanceX < minDistanceX1;
					}
					else {a = false;}
					if (shape.x < clone.x && distanceY < (clone.height + shape.height)/2 && clone.y - clone.height/2 < shape.y + 50) {
						b = distanceX < minDistanceX2;
					}
					else {b = false;}
					return a || b;
				}
			}

			else if (currentShape === 'triangle') {  
				if (triangleState % 2 != 0) {
					shape = triangle1a[0];
				}
				else {
					shape = triangle2a[0];
				}
				const distanceX = Math.abs(clone.x - shape.x);
				const minDistanceX1 = (clone.width + shape.width)/2 + 50;
				const distanceY = Math.abs(clone.y - shape.y);
				const minDistanceY1 = (clone.height + shape.height)/2 + 50;
				if (triangleState === 1)	{
					if (shape.x > clone.x && distanceY < (clone.height + shape.height)/2 && clone.y + clone.height/2 > shape.y - 25) {
						a = distanceX < minDistanceX1;
					}
					else {a = false;}
					if (shape.x < clone.x && distanceY < (clone.height + shape.height)/2) {
						b = distanceX < minDistanceX1;
					}
					else {b = false;}
					return a || b;
				}
				else if (triangleState === 2)	{
					if (shape.y > clone.y && distanceX < (clone.width + shape.width)/2 && clone.x - clone.width/2 < shape.x + 25) {
						a = distanceY < minDistanceY1;
					}
					else {a = false;}
					if (shape.y < clone.y && distanceX < (clone.width + shape.width)/2) {
						b = distanceY < minDistanceY1;
					}
					else {b = false;}
					return a || b;
				}
				else if (triangleState === 3)	{
					if (shape.x < clone.x && distanceY < (clone.height + shape.height)/2 && clone.y - clone.height/2 < shape.y + 25) {
						a = distanceX < minDistanceX1;
					}
					else {a = false;}
					if (shape.x > clone.x && distanceY < (clone.height + shape.height)/2) {
						b = distanceX < minDistanceX1;
					}
					else {b = false;}
					return a || b;
				}
				else if (triangleState === 4)	{
					if (shape.y < clone.y && distanceX < (clone.width + shape.width)/2 && clone.x + clone.width/2 > shape.x - 25) {
						a = distanceY < minDistanceY1;
					}
					else {a = false;}
					if (shape.y > clone.y && distanceX < (clone.width + shape.width)/2) {
						b = distanceY < minDistanceY1;
					}
					else {b = false;}
					return a || b;
				}
			}
			else if (currentShape === 'hammer') {
				if (hammerState % 2 != 0) {
					shape = hammer1a[0];
				}
				else {
					shape = hammer2a[0];
				}
				const distanceX = Math.abs(clone.x - shape.x);
				const minDistanceX1 = (clone.width + shape.width)/2 + 50;
				const distanceY = Math.abs(clone.y - shape.y);
				const minDistanceY1 = (clone.height + shape.height)/2 + 50;
				if (hammerState === 1)	{
					if (shape.x > clone.x && distanceY < (clone.height + shape.height)/2 && clone.y + clone.height/2 > shape.y - 25) {
						a = distanceX < minDistanceX1;
					}
					else {a = false;}
					if (shape.x < clone.x && distanceY < (clone.height + shape.height)/2) {
						b = distanceX < minDistanceX1;
					}
					else {b = false;}
					return a || b;
				}
				else if (hammerState === 2)	{
					if (shape.y > clone.y && distanceX < (clone.width + shape.width)/2 && clone.x - clone.width/2 < shape.x + 25) {
						a = distanceY < minDistanceY1;
					}
					else {a = false;}
					if (shape.y < clone.y && distanceX < (clone.width + shape.width)/2) {
						b = distanceY < minDistanceY1;
					}
					else {b = false;}
					return a || b;
				}
				else if (hammerState === 3)	{
					if (shape.x < clone.x && distanceY < (clone.height + shape.height)/2 && clone.y - clone.height/2 < shape.y + 25) {
						a = distanceX < minDistanceX1;
					}
					else {a = false;}
					if (shape.x > clone.x && distanceY < (clone.height + shape.height)/2) {
						b = distanceX < minDistanceX1;
					}
					else {b = false;}
					return a || b;
				}
				else if (hammerState === 4)	{
					if (shape.y < clone.y && distanceX < (clone.width + shape.width)/2 && clone.x + clone.width/2 > shape.x - 25) {
						a = distanceY < minDistanceY1;
					}
					else {a = false;}
					if (shape.y > clone.y && distanceX < (clone.width + shape.width)/2) {
						b = distanceY < minDistanceY1;
					}
					else {b = false;}
					return a || b;
				}
			}
			else if (currentShape === 'zigzag') {
				if (zigzagState % 2 != 0) {
					shape = zigzag1a[0];
				}
				else {
					shape = zigzag2a[0];
				}
				const distanceX = Math.abs(clone.x - shape.x);
				const minDistanceX1 = (clone.width + shape.width)/2 + 50;
				const minDistanceX2 = (clone.width + shape.width)/2 + 100;
				const distanceY = Math.abs(clone.y - shape.y);
				const minDistanceY1 = (clone.height + shape.height)/2 + 50;
				const minDistanceY2 = (clone.height + shape.height)/2 + 100;
				if (zigzagState === 1) {
					if (shape.x > clone.x) {
						a = false;
					}
					else if (shape.x < clone.x && distanceY < minDistanceY1 && clone.y - clone.height/2 < shape.y) {
						a = distanceX < minDistanceX2;
					}
					if (shape.y > clone.y && distanceX < minDistanceX2 && clone.x + clone.width/2 > shape.x - 25) {
						b = distanceY < minDistanceY1;
					}
					else if (shape.y < clone.y) {
						b = false;
					}
					return a || b; 
				}
				else if (zigzagState === 2) {
					if (shape.x > clone.x) {
						a = false;
					}
					else if (shape.x < clone.x && distanceY < minDistanceY2 && clone.y + clone.height/2 > shape.y - 25) {
						a = distanceX < minDistanceX1;
					}
					if (shape.y > clone.y) {
						b = false;
					}
					else if (shape.y < clone.y && distanceX < minDistanceX1 && clone.x + clone.width/2 > shape.x) {
						b = distanceY < minDistanceY2;
					}
					return a || b; 
				}
				else if (zigzagState === 3) {
					if (shape.x > clone.x && distanceY < minDistanceY1 && clone.y + clone.height/2 > shape.y) {
						a = distanceX < minDistanceX2;
					}
					else if (shape.x < clone.x) {
						a = false;
					}
					if (shape.y > clone.y) {
						b = false;
					}
					else if (shape.y < clone.y && distanceX < minDistanceX2 && clone.x - clone.width/2 < shape.x + 25) {
						b = distanceY < minDistanceY1;
					}
					return a || b; 
				}
				else if (zigzagState === 4) {
					if (shape.x > clone.x && distanceY < minDistanceY2 && clone.y - clone.height/2 < shape.y + 25) {
						a = distanceX < minDistanceX1;
					}
					else if (shape.x < clone.x) {
						a = false;
					}
					if (shape.y > clone.y && distanceX < minDistanceX1 && clone.x - clone.width/2 < shape.x) {
						b = distanceY < minDistanceY2;
					}
					else if (shape.y < clone.y) {
						b = false;
					}
					return a || b; 
				}
			}
		}
	
		//ROTATING
		this.input.keyboard.on('keyup-' + 'SHIFT', () => {
			if (!gameState.isPaused && !clones.getChildren().some(tooCloseToCloneToRotate)) {
				if (currentShape === 'rectangle') {
					if (rectangleState === 1) {
						rectangle2[0].x = rectangle1[0].x - 25;
						rectangle2[0].y = rectangle1[0].y + 25;
						rectangle1[0].x -= 1000;
						rectangle1[0].y -= 1000;
						rectangle1[0].body.velocity.y = 0;
						rectangle2[0].body.velocity.y = gameState.speed*15;
						rectangleState = 2;
					}
					else if (rectangleState === 2 && rectangle2[0].x > 76 && rectangle2[0].x < 576) {
						rectangle1[0].x = rectangle2[0].x - 25;
						rectangle1[0].y = rectangle2[0].y - 25;
						rectangle2[0].x -= 1000;
						rectangle2[0].y -= 1000;
						rectangle2[0].body.velocity.y = 0;
						rectangle1[0].body.velocity.y = gameState.speed*15;
						rectangleState = 3;
					}
					else if (rectangleState === 3) {
						rectangle2[0].x = rectangle1[0].x + 25;
						rectangle2[0].y = rectangle1[0].y - 25;
						rectangle1[0].x -= 1000;
						rectangle1[0].y -= 1000;
						rectangle1[0].body.velocity.y = 0;
						rectangle2[0].body.velocity.y = gameState.speed*15;
						rectangleState = 4;
					}
					else if (rectangleState === 4 && rectangle2[0].x > 26 && rectangle2[0].x < 526) {
						rectangle1[0].x = rectangle2[0].x + 25;
						rectangle1[0].y = rectangle2[0].y + 25;
						rectangle2[0].x -= 1000;
						rectangle2[0].y -= 1000;
						rectangle2[0].body.velocity.y = 0;
						rectangle1[0].body.velocity.y = gameState.speed*15;
						rectangleState = 1;
					}
				}
				else if (currentShape === 'triangle') {
					if (triangleState === 1 && triangle1a[0].x > 26) {
						triangle2a[0].x = triangle1a[0].x;
						triangle2a[0].y = triangle1a[0].y;
						triangle12b[0].x -= 50;
						triangle12b[0].y += 50;
						triangle1a[0].x -= 1000;
						triangle1a[0].y -= 1000;
						triangle1a[0].body.velocity.y = 0;
						triangle2a[0].body.velocity.y = gameState.speed*15;
						triangleState = 2;
					}
					else if (triangleState === 2) {
						triangle1a[0].x = triangle2a[0].x;
						triangle1a[0].y = triangle2a[0].y;
						triangle12b[0].x -= 50;
						triangle12b[0].y -= 50;
						triangle2a[0].x -= 1000;
						triangle2a[0].y -= 1000;
						triangle2a[0].body.velocity.y = 0;
						triangle1a[0].body.velocity.y = gameState.speed*15;
						triangleState = 3;
					}
					else if (triangleState === 3 && triangle1a[0].x < 576) {
						triangle2a[0].x = triangle1a[0].x;
						triangle2a[0].y = triangle1a[0].y;
						triangle12b[0].x += 50;
						triangle12b[0].y -= 50;
						triangle1a[0].x -= 1000;
						triangle1a[0].y -= 1000;
						triangle1a[0].body.velocity.y = 0;
						triangle2a[0].body.velocity.y = gameState.speed*15;
						triangleState = 4;
					}
					else if (triangleState === 4) {
						triangle1a[0].x = triangle2a[0].x;
						triangle1a[0].y = triangle2a[0].y;
						triangle12b[0].x += 50;
						triangle12b[0].y += 50;
						triangle2a[0].x -= 1000;
						triangle2a[0].y -= 1000;
						triangle2a[0].body.velocity.y = 0;
						triangle1a[0].body.velocity.y = gameState.speed*15;
						triangleState = 1;
					}
				}
				else if (currentShape === 'hammer') {
					if (hammerState === 1 && hammer1a[0].x > 26) {
						hammer2a[0].x = hammer1a[0].x;
						hammer2a[0].y = hammer1a[0].y;
						hammer12b[0].y += 100;
						hammer1a[0].x -= 1000;
						hammer1a[0].y -= 1000;
						hammer1a[0].body.velocity.y = 0;
						hammer2a[0].body.velocity.y = gameState.speed*15;
						hammerState = 2;
					}
					else if (hammerState === 2) {
						hammer1a[0].x = hammer2a[0].x;
						hammer1a[0].y = hammer2a[0].y;
						hammer12b[0].x -= 100;
						hammer2a[0].x -= 1000;
						hammer2a[0].y -= 1000;
						hammer2a[0].body.velocity.y = 0;
						hammer1a[0].body.velocity.y = gameState.speed*15;
						hammerState = 3;
					}
					else if (hammerState === 3 && hammer1a[0].x < 576) {
						hammer2a[0].x = hammer1a[0].x;
						hammer2a[0].y = hammer1a[0].y;
						hammer12b[0].y -= 100;
						hammer1a[0].x -= 1000;
						hammer1a[0].y -= 1000;
						hammer1a[0].body.velocity.y = 0;
						hammer2a[0].body.velocity.y = gameState.speed*15;
						hammerState = 4;
					}
					else if (hammerState === 4) {
						hammer1a[0].x = hammer2a[0].x;
						hammer1a[0].y = hammer2a[0].y;
						hammer12b[0].x += 100;
						hammer2a[0].x -= 1000;
						hammer2a[0].y -= 1000;
						hammer2a[0].body.velocity.y = 0;
						hammer1a[0].body.velocity.y = gameState.speed*15;
						hammerState = 1;
					}
				}
				else if (currentShape === 'zigzag') {
					if (zigzagState === 1 && zigzag1a[0].x < 526) {
						zigzag2a[0].x = zigzag1a[0].x + 25;
						zigzag2a[0].y = zigzag1a[0].y - 75;
						zigzag2b[0].x = zigzag1b[0].x + 25;
						zigzag2b[0].y = zigzag1b[0].y + 25;
						zigzag1a[0].x -= 1000;
						zigzag1a[0].y -= 1000;
						zigzag1b[0].x -= 1000;
						zigzag1b[0].y -= 1000;
						zigzag1a[0].body.velocity.y = 0;
						zigzag1b[0].body.velocity.y = 0;
						zigzag2a[0].body.velocity.y = gameState.speed*15;
						zigzag2b[0].body.velocity.y = gameState.speed*15;
						zigzagState = 2;
					}
					else if (zigzagState === 2) {
						zigzag1a[0].x = zigzag2a[0].x + 75;
						zigzag1a[0].y = zigzag2a[0].y + 25;
						zigzag1b[0].x = zigzag2b[0].x - 25;
						zigzag1b[0].y = zigzag2b[0].y + 25;
						zigzag2a[0].x -= 1000;
						zigzag2a[0].y -= 1000;
						zigzag2b[0].x -= 1000;
						zigzag2b[0].y -= 1000;
						zigzag2a[0].body.velocity.y = 0;
						zigzag2b[0].body.velocity.y = 0;
						zigzag1a[0].body.velocity.y = gameState.speed*15;
						zigzag1b[0].body.velocity.y = gameState.speed*15;
						zigzagState = 3;
					}
					else if (zigzagState === 3 && zigzag1a[0].x > 76) {
						zigzag2a[0].x = zigzag1a[0].x - 25;
						zigzag2a[0].y = zigzag1a[0].y + 75;
						zigzag2b[0].x = zigzag1b[0].x - 25;
						zigzag2b[0].y = zigzag1b[0].y - 25;
						zigzag1a[0].x -= 1000;
						zigzag1a[0].y -= 1000;
						zigzag1b[0].x -= 1000;
						zigzag1b[0].y -= 1000;
						zigzag1a[0].body.velocity.y = 0;
						zigzag1b[0].body.velocity.y = 0;
						zigzag2a[0].body.velocity.y = gameState.speed*15;
						zigzag2b[0].body.velocity.y = gameState.speed*15;
						zigzagState = 4;
					}
					else if (zigzagState === 4) {
						zigzag1a[0].x = zigzag2a[0].x - 75;
						zigzag1a[0].y = zigzag2a[0].y - 25;
						zigzag1b[0].x = zigzag2b[0].x + 25;
						zigzag1b[0].y = zigzag2b[0].y - 25;
						zigzag2a[0].x -= 1000;
						zigzag2a[0].y -= 1000;
						zigzag2b[0].x -= 1000;
						zigzag2b[0].y -= 1000;
						zigzag2a[0].body.velocity.y = 0;
						zigzag2b[0].body.velocity.y = 0;
						zigzag1a[0].body.velocity.y = gameState.speed*15;
						zigzag1b[0].body.velocity.y = gameState.speed*15;
						zigzagState = 1;
					}
				}
			}
		});
		
		//REMOVING FULL LINES
		const yArrays = []; 
		let arrayY = 726;
		for (let i=0;i<14;i++) {
			yArrays.push([arrayY]);
			arrayY -= 50;
		}
		
		function fillArrays() {
			function clonePusher(clone) {
				function notAlreadyIt(cloneInArray, i) {
					if (i === 0) {
						return true;
					}
					else if (i > 0) {
						return cloneInArray.x != clone.x;
					}
				}
				
				yArrays.forEach((array) => {
					if (clone.y === array[0] && array.every(notAlreadyIt)) {
						array.push(clone);
					} 
				});
				
			}
			clones.getChildren().forEach(clonePusher);
		}
		this.time.addEvent({
            delay: 100,
            callback: fillArrays,
            loop: true,
		});

		function lineRemover() {
			yArrays.forEach((array) => {
				if (array.length === 13) {
					array.forEach((clone) => {
						if (clone != array[0]) {
							clone.destroy();
						}	
					});

					clones.getChildren().forEach((clone) => {
						if (clone.y < array[0]) {
							clone.y += 50;
							
							yArrays.forEach((array) => {
								const index = array.indexOf(clone);
								if (index != -1) {
									array.splice(index, 1);
								}
							});
						}
					});
					array.splice(1, 12);
				}
			});		
		}
		this.time.addEvent({
            delay: 100,
            callback: lineRemover,
            loop: true,
		});
	}

	update() {
		//PAUSE ON GAMEOVER
		if (gameState.gameOver)	{
			this.physics.pause();
			gameState.isPaused = true;
		}
	}
}