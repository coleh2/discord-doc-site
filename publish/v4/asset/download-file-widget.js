`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M15 2v5h5v15h-16v-20h11zm1-2h-14v24h20v-18l-6-6z"/></svg>`

window.addEventListener("load", function() {
    let downloaders = document.querySelectorAll("pre.download-file-instead-of-display");

    for(var i = 0; i < downloaders.length; i++) {
        let downloader = downloaders[i];
        
        let downloaderIcon = document.createElement("img");
        downloaderIcon.src = "data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' clip-rule='evenodd'%3E%3Cpath d='M22 24h-20v-24h14l6 6v18zm-7-23h-12v22h18v-16h-6v-6zm1 5h4.586l-4.586-4.586v4.586z'/%3E%3C/svg%3E";
        downloader.appendChild(downloaderIcon);

        let textToDownload = downloader.querySelector("code").innerText;
        let fileName = downloader.getAttribute("data-filename") || "download.txt";
        let fileType = downloader.getAttribute("data-mimetype");
        let fileBlob = new Blob([textToDownload], {"type": fileType});
        let fileSize = fileBlob.size;
	    let fileUrl = window.URL.createObjectURL(fileBlob);

        let downloadInfoContainer = document.createElement("div");

        let downloadFileName = document.createElement("h5");

        let downloadLink = document.createElement("a");
        downloadLink.setAttribute("download", fileName);
        downloadLink.href = fileUrl;
        downloadLink.innerText = fileName;
        downloadFileName.appendChild(downloadLink);

        downloadInfoContainer.appendChild(downloadFileName);

        let fileSizeDisplay = document.createElement("span");
        fileSizeDisplay.innerText = formatSize(fileSize);
        downloadInfoContainer.appendChild(fileSizeDisplay);

        downloader.appendChild(downloadInfoContainer);
    }
});

function formatSize(size) {
    if(size < 1000) return size + "B";
    else if(size < 1000000) return roundToPlace(size/1000,100)  + "KB";
    else return roundToPlace(size/1000000,100) + "MB";
}

function roundToPlace(num, place) {
    return Math.round(num*place)/place;
}
