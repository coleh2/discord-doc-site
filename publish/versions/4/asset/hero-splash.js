// window.addEventListener("load", function() {
// let splashPerspective = document.getElementById("hero-splash-perspective-move-container");

// function updateScroll() {
//     splashPerspective.style.transform = `translate3d(0, -${window.scrollY}px, 0);`;
//     if(window.scrollY < window.innerHeight) window.requestAnimationFrame(updateScroll);
// }

// window.requestAnimationFrame(updateScroll);
// });

const element = document.getElementById('hero-splash-perspective-move-container'); 

const msgs = document.getElementsByClassName("msg-wrapper");


function step() {

  // `Math.min()` is used here to make sure that the element stops at exactly 200px.
  element.style.transform = 'translate3d(0, ' + (0.2*window.scrollY) + 'px, ' +  (-0.0005*window.scrollY*window.scrollY) +'px) rotateX(20deg)';
 // Stop the animation after 2 seconds
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);