var airHockey1 = document.getElementById('airHockey1');
var airHockey2 = document.getElementById('airHockey2');

var scoreTicker1 = document.getElementById('scoreTicker1');
var scoreTicker2 = document.getElementById('scoreTicker2');

var score1 = 0;
var score2 = 0;

function init(world) {

	var viewWidth = window.innerWidth;
	var viewHeight = window.innerHeight;

	var renderer = Physics.renderer('canvas', {
		el: 'viewport',
		width: viewWidth,
		height: viewHeight,
		meta: false, // don't display meta data
	});

	// add the renderer
	world.add( renderer );
		
	// render on each step
	world.on('step', function() {
		world.render();
	});

	// bounds of the window
	var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

	// constrain objects to these bounds
	world.add(Physics.behavior('edge-collision-detection', {
		aabb: viewportBounds,
		restitution: 0.5,
		cof: 0.99
	}));

	world.add(Physics.behavior('interactive', { el: renderer.container }));

	Physics.body('puck', 'circle', function( parent ){
	    return {};
	});

	world.add( Physics.body('puck', {
	    x: window.innerWidth / 2,
	    y: window.innerHeight / 2,
	    radius: 30,
		styles: {
			strokeStyle: '#333333',
			lineWidth: 3,
			fillStyle: '#ffff00'
		}
	}) );

	// add player 1 paddle
	world.add(
		Physics.body('circle', {
			x: 100,
			y: window.innerHeight / 2,
			radius: 60,
			mass: 40,
			styles: {
				strokeStyle: '#333333',
				lineWidth: 5,
				fillStyle: '#eeeeee'
			}
		})
	);

	// add player 2 paddle
	world.add(
		Physics.body('circle', {
			x: window.innerWidth - 100,
			y: window.innerHeight / 2,
			radius: 60,
			mass: 40,
			styles: {
				strokeStyle: '#333333',
				lineWidth: 5,
				fillStyle: '#eeeeee'
			}
		})
	);

	// ensure on-screen objects can collide
	world.add([
		Physics.behavior('sweep-prune'),
		Physics.behavior('body-collision-detection')
	]);

	// ensure objects bounce when edge collision is detected
	world.add( Physics.behavior('body-impulse-response') );

	// subscribe to ticker to advance the simulation
	Physics.util.ticker.on(function( time, dt ) {
		world.step( time );
	});

	// start the ticker
	Physics.util.ticker.start();

	// If extending a body and you want to handle its collision
	world.on('collisions:detected', function( data ) {
		var c;

		for (var i = 0, l = data.collisions.length; i < l; i++) {
			c = data.collisions[ i ];

			if ( c.bodyA.collide ) {
				c.bodyA.collide( c.bodyB, c.bodyA );
			}

			if ( c.bodyB.collide ) {
				c.bodyB.collide( c.bodyA, c.bodyB );
			}
		}
	});

	// mixin to the base body class. Adds a method to all bodies.
	Physics.body.mixin('collide', function( projectile, target ) {
		if ( projectile && target ) {
			var hasWon = false;

			if (projectile.__proto__.name == 'puck' && target.__proto__.name == 'goal1') {
				world.pause();

				if (score(2)) {
					gameOver(2);
				}

				world.destroy();
				initialise(true);
			}

			if (projectile.__proto__.name == 'puck' && target.__proto__.name == 'goal2') {
				world.pause();

				if (score(1)) {
					gameOver(1);
				}

				world.destroy();
				initialise(true);
			}
		}

		return true;
	});

	Physics.body('goal1', 'rectangle', function( parent ) {
	    return {};
	});

	Physics.body('goal2', 'rectangle', function( parent ) {
	    return {};
	});

	// add player 1 goal
	world.add(
		Physics.body('goal1', {
			x: 1,
			y: window.innerHeight / 2,
			width: 10,
			height: window.innerHeight * 0.5,
			treatment: 'static'
		})
	);

	// add player 2 goal
	world.add(
		Physics.body('goal2', {
			x: window.innerWidth - 1,
			y: window.innerHeight / 2,
			width: 10,
			height: window.innerHeight * 0.5,
			treatment: 'static'
		})
	);

}

function score (player) {
	eval('score' + player + '++;');
	eval('var score = score' + player + ';');

	var el = 'scoreTicker' + player;
	var scoreTicker = document.getElementById(el);

	var scoreStr = '0' + score;
	scoreStr.slice(-2);

	showScore(player, 'Score!');

	if (score < 5) {
		setTimeout(
			function() {
				showScore(player, scoreStr);
			},
			1000
		);

		return false;
	}

	return true;
}

function showScore(player, str) {
	var el = 'scoreTicker' + player;
	var scoreTicker = document.getElementById(el);
	scoreTicker.innerHTML = str;
}

function gameOver(winner)
{
	showScore(winner, 'Winner!');

	setTimeout(
		function() {
			initialise();
		},
		3000
	);
}

function destroyContainer() {
	var el = document.getElementById('viewport');
	el.remove();
}

function createContainer() {
	var node = document.createElement('div');
	node.id = 'viewport';
	document.body.appendChild(node);
}

function initContainer()
{
	destroyContainer();
	createContainer();
}

function initialise(inGame) {
	initContainer();

	if ( ! inGame) {
		score1 = 0;
		score2 = 0;
		scoreTicker1.innerHTML = '00';
		scoreTicker2.innerHTML = '00';
	}

	scoreTicker1.style.top = (window.innerHeight / 2) - (scoreTicker1.offsetHeight / 2);
	//scoreTicker1.style.left = window.innerWidth / 2 - scoreTicker1.offsetWidth;
	scoreTicker1.style.left = window.innerWidth * 0.15;
	
	scoreTicker2.style.top = (window.innerHeight / 2) - (scoreTicker1.offsetHeight / 2);
	//scoreTicker2.style.left = window.innerWidth / 2;
	scoreTicker2.style.left = window.innerWidth * 0.85 - scoreTicker2.offsetWidth;

	airHockey1.style.left = window.innerWidth * 0.5 - airHockey1.offsetWidth / 2;
	airHockey2.style.left = window.innerWidth * 0.5 - airHockey2.offsetWidth / 2;

	Physics(init);
}

initialise();