window.addEventListener("load", function() {
    let footer = document.getElementsByTagName("footer")[0];

    if(footer) {
        document.body.style.paddingBottom = footer.offsetHeight + "px";
    }
});