window.addEventListener("hashchange", checkHash);
checkHash();

function checkHash() {
    let hash = window.location.hash.substring(1);
    let heading = document.getElementById(hash);

    if(heading) {
        heading.classList.add("highlighted");
        setTimeout(function() {
            heading.classList.remove("highlighted");
        },5000);
    }
}