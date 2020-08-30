var NOISE_FACTOR = 2;

var RAND_SEED_POS = 4;
var RAND_SEED_ROT = 9;

var ROT_OPPOSITE_AMOUNT = 0.3;
var GRAVITY = 2;

var FALL_INIT_MAX = 4;

var SIM_MSG_THICKNESS = 0.1;
var SIM_MSG_DENSITY = 0.1520;
var SIM_AIR_CONSTANT = 0.05;
var FALL_TIME_SIM = 6;
var FALL_ROT_COEF = 0.2;

var MOUSE_MOVE_SIM_REFRESH_DISTANCE = 10;

window.scrollTo(0, 0);

const perspectiveElem = document.getElementById('hero-splash-perspective-move-container'); 

const msgs = document.getElementsByClassName("msg-wrapper");

let msgOriginalPositions = [];
let msgVelocities = [];
let msgFalls = [];

let mousePosCache = [0,0];

function updateScroll() {
    var scrollPx = window.scrollY;
    var scrollPercent = Math.min(scrollPx, window.innerHeight/2) / window.innerHeight/2;

    for(var i = 0; i < msgs.length; i++) {
        var rotator = msgs[i].firstElementChild;
        var originalPos = msgOriginalPositions[i];
        var time = scrollPercent*FALL_TIME_SIM;
        
        var rotOrig = [originalPos.rx, originalPos.ry, originalPos.rz];
        var rotations = [0,0,0];

        for(var j = 0; j < 3; j++) {
            var isNegative = rotOrig[j] < 0;
            var rotCoef = isNegative ? -1*FALL_ROT_COEF : FALL_ROT_COEF;
            rotations[j] = rotOrig[j] + (rotCoef*(90-Math.abs(rotOrig[j]))*time/FALL_TIME_SIM);
        }

        var initialPos = Math.abs(pythagorean(pythagorean(originalPos.y, originalPos.x), originalPos.z));
        var finalVelo = (initialPos * time) + GRAVITY * time;

        var pos = initialPos * time + 0.5 * GRAVITY * time * time;

        rotator.style.transform = `translateZ(${round(pos*-1,2)}em) rotateX(${round(rotations[0], 2)}deg)` +
                                  `rotateY(${round(rotations[1], 2)}deg) rotateZ(${0}deg)`;
    }
    
    window.requestAnimationFrame(updateScroll);
}

window.requestAnimationFrame(updateScroll);

function updateOriginRotation(event) {
    let simCenterX = event.pageX;
    let simCenterY = event.pageY;

    //check if the mouse has moved enough to justify a refresh
    let mouseMovedX = simCenterX - mousePosCache[0];
    let mouseMovedY = simCenterY - mousePosCache[1];

    if(pythagorean(mouseMovedX, mouseMovedY) < MOUSE_MOVE_SIM_REFRESH_DISTANCE) return;

    mousePosCache = [simCenterX, simCenterY];

    let pushBackRng = seed(RAND_SEED_POS);
    let turningRng = seed(RAND_SEED_ROT);

    //fill position arrays-- one for original positions, and one for modification in the falling animation
    for(var i = 0; i < msgs.length; i++) {
        let clientBox = msgs[i].getBoundingClientRect();

        //get center position, normalized to -1 to 1
        let normMsgCenterX = ((clientBox.x + clientBox.width/2) - simCenterX) / window.innerWidth/2;
        let normMsgCenterY = ((clientBox.y + clientBox.height/2) - simCenterY) / window.innerHeight/2;

        let pushBackDistance = Math.sqrt((normMsgCenterX * normMsgCenterX) + (normMsgCenterY * normMsgCenterY));

        pushBackDistance += (pushBackRng() - 0.5) * NOISE_FACTOR;

        let rotX = round(normMsgCenterY*50*(turningRng()-ROT_OPPOSITE_AMOUNT),2);
        let rotY = round(normMsgCenterX*-45,2);
        let rotZ = round(normMsgCenterX*50*(turningRng()-ROT_OPPOSITE_AMOUNT),2);

        let msgMass = clientBox.width * clientBox.height * SIM_MSG_THICKNESS * SIM_MSG_DENSITY;

        msgs[i].style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) ` +
        
        `translateZ(${round(pushBackDistance*-1*FALL_INIT_MAX, 2)}em)`;

        msgOriginalPositions.push({x: normMsgCenterX, y: normMsgCenterY, z: pushBackDistance*-4, rx: rotX, ry: rotY, rz: rotZ, width: clientBox.width, height: clientBox.height, mass: msgMass});
    }
}

var noAnimationMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
if(!noAnimationMediaQuery.matches) window.addEventListener("mousemove", updateOriginRotation);

//initial rotation is to the center
updateOriginRotation({
    pageX: window.innerWidth/2,
    pageY: window.innerHeight/2
})

function seed(s) {
    return function() {
        s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
};

function round(n, pl) {
    let p = Math.pow(10, pl);
    return Math.round(n*p)/p;
}

function pythagorean(a,b) {
    return Math.sqrt(a*a+b*b);
}