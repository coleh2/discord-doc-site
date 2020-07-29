// window.addEventListener("load", function() {
// let splashPerspective = document.getElementById("hero-splash-perspective-move-container");

// function updateScroll() {
//     splashPerspective.style.transform = `translate3d(0, -${window.scrollY}px, 0);`;
//     if(window.scrollY < window.innerHeight) window.requestAnimationFrame(updateScroll);
// }

// window.requestAnimationFrame(updateScroll);
// });

const perspectiveElem = document.getElementById('hero-splash-perspective-move-container'); 

const msgs = document.getElementsByClassName("msg-wrapper");

let msgOriginalPositions = [];
let msgPositions = [];

//fill position arrays-- one for original positions, and one for modification in the falling animation
for(var i = 0; i < msgs.length; i++) {
    msgOriginalPositions.push({
        pos: new (window.DOMMatrix || window.WebKitCSSMatrix)(getComputedStyle(msgs[i]).transform),
        rot: new (window.DOMMatrix || window.WebKitCSSMatrix)(getComputedStyle(msgs[i].firstElementChild).transform),
    });
    msgPositions.push({
        pos: new (window.DOMMatrix || window.WebKitCSSMatrix)(getComputedStyle(msgs[i]).transform),
        rot: new (window.DOMMatrix || window.WebKitCSSMatrix)(getComputedStyle(msgs[i].firstElementChild).transform),
    });
}
function step() {

  // change the perspective's position
    perspectiveElem.style.transform = 'translate3d(0, ' + (0.9*window.scrollY) + 'px, ' +  (-0.000*window.scrollY*window.scrollY) +'px) rotateX(20deg)';
    window.requestAnimationFrame(step);

    //set per-message falling anim
    for(var i = 0; i < msgs.length; i++) {
        msgPositions[i].pos.m43 = msgOriginalPositions[i].pos.m43 + -0.005*window.scrollY*window.scrollY / ((i ^ 9) || 0.1);
        msgPositions[i].m11;
        
        msgs[i].style.transform = msgPositions[i].pos.toString();
        msgs[i].firstElementChild.style.transform = msgPositions[i].rot.toString();
    }
}

window.requestAnimationFrame(step);