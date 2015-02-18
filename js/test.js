//----
//KEYS
//----
var keyState = {};

window.addEventListener('keydown',function(e){
	keyState[e.keyCode || e.which] = true;
},true);

window.addEventListener('keyup',function(e){
	keyState[e.keyCode || e.which] = false;
},true);

var keyLeft = false;
var keyUp = false;
var keyRight = false;
var keyDown = false;

//----
//TIME
//----
var tNow = 0;
var start;
var timer;

//-----
//SONGS
//-----
var errorMargin = 0.5; //maximum threshold in bpm by default/exceed to successfully play a step
var stepsArray; //basic step data: number of steps, whether it is playable or not, playability range
var stepsArrayKeys; //stores the measures on which every song step is triggered
var currentStep; //step number (not measure) to be played
load_songs();

//TODO: Change to load proper song
function startGame(){
	var song = JSON.parse(songs.memories);
	//setTimeout(function(){console.log(songs);},4000);
	start = new Date();

	//Initialize some song stuff: object of successful steps, step error margin, etc.
	//Format of stepsArray object: {step_number: [steps, is_playable, margin_by_default, margin_by_excess]}
	//	float	step_number: equals measure defined in song.js
	//	int		steps: number of steps needed to complete this step, equals length of second item in each song item
	//	bool	is_playable: defines if this note can still be played or otherwise was missed, defaults to true
	//	float	margin_by_default: the amount of measures a step can be played before the actual step happens
	//	float	margin_by_excess: the amount of measures a step can be played after the actual step happens
	stepsArray = {};
	stepsArrayKeys = [];
	for(var i=0; i<song.song.length; i++){
		if(i==0){
			var marginByDefault = song.song[i][0] - errorMargin;
		}else{
			var marginByDefault = song.song[i][0] - Math.min(errorMargin, (song.song[i][0]-song.song[i-1][0])/2);
		}
		if(i==song.song.length-1){
			var marginByExcess = song.song[i][0] + errorMargin;
		}else{
			var marginByExcess = song.song[i][0] + Math.min(errorMargin, (song.song[i+1][0]-song.song[i][0])/2);
		}
		stepsArray[song.song[i][0]] = {steps:song.song[i][1].length, is_playable:true, margin_by_default:marginByDefault, margin_by_excess:marginByExcess};
		stepsArrayKeys.push(song.song[i][0]);
	}

	currentStep = 0;

	timer = new Tock({
		interval: 10,
		callback: function(){gameLoop(song);}
	});
	
	console.log(stepsArray);
	//console.log(stepsArrayKeys);
	timer.start();
	//gameLoop(song);
}

function gameLoop(song) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	testKeys();

	// var tDelta = tNow;
	// var d = new Date();
	// var t = d.toLocaleTimeString();
	// tNow = d-start;
	// tDelta = tNow - tDelta;

	drawSong(song, timer.lap());

	// setTimeout(function(){
	// 	gameLoop(song);
	// }, 10);
}

function testKeys() {
	/* Keys down */
	if (keyState[37] || keyState[65]){ // left, 'a'
		console.log("left");
		keyLeft = true;
		context.drawImage(img[0],32,80,96,96);
	}
	if (keyState[38] || keyState[87]){ // up, 'w'
		console.log("up");
		keyUp = true;
		context.drawImage(img[1],192,80,96,96);
	}
	if (keyState[39] || keyState[68]){ // right, 'd'
		console.log("right");
		keyRight = true;
		context.drawImage(img[3],512,80,96,96);
	}
	if (keyState[40] || keyState[83]){ // down, 's'
		console.log("down");
		keyDown = true;
		context.drawImage(img[2],352,80,96,96);
	}

	/* Keys up */
	if (!keyState[37] && !keyState[65]){ // left, 'a'
		//console.log("no left");
		keyLeft = false;
		context.drawImage(img[0],16,64);
	}
	if (!keyState[38] && !keyState[87]){ // up, 'w'
		keyUp = false;
		context.drawImage(img[1],176,64);
	}
	if (!keyState[39] && !keyState[68]){ // right, 'd'
		keyRight = false;
		context.drawImage(img[3],496,64);
	}
	if (!keyState[40] && !keyState[83]){ // down, 's'
		keyDown = false;
		context.drawImage(img[2],336,64);
	} 
}

function drawSong(song, time) {
	var currentMeasure = Math.round((song.bpm/60)*(time/1000)*10000) / 10000;
	//console.log(currentStep);
	//if(stepsArrayKeys.hasOwnProperty(currentStep))
	//	console.log(stepsArray[stepsArrayKeys[currentStep]].margin_by_excess + " -- " + currentMeasure);

	for(var i=0; i<song.song.length; i++){
		for(var noteSteps=0; noteSteps<song.song[i][1].length; noteSteps++){
			//console.log(song.song[i][1][noteSteps]);
			var yPos = song.song[i][0]*(96+32*song.difficulty)-((96+32*song.difficulty)*currentMeasure)+64;
			if(yPos > -128 && yPos < 1088)
				context.drawImage(img[song.song[i][1][noteSteps]],16+song.song[i][1][noteSteps]*160,yPos);
		}
	}

	//console.log(Math.floor(currentMeasure));
	if(stepsArrayKeys.hasOwnProperty(currentStep)){
		if(currentMeasure > stepsArray[stepsArrayKeys[currentStep]].margin_by_excess)
			stepsArray[stepsArrayKeys[currentStep]].is_playable = false;

		if(currentMeasure > stepsArray[stepsArrayKeys[currentStep]].margin_by_excess && !stepsArray[stepsArrayKeys[currentStep]].is_playable)
			currentStep++;
	}
}