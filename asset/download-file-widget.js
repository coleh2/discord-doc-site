`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M15 2v5h5v15h-16v-20h11zm1-2h-14v24h20v-18l-6-6z"/></svg>`

window.addEventListener("load", function() {
    let downloaders = document.querySelectorAll("pre.download-file-instead-of-display");

    for(var i = 0; i < downloaders.length; i++) {
        let downloader = downloaders[i];
        console.log(downloader);
    }
});
