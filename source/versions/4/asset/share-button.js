window.addEventListener("load", function() {
    const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22 6v16h-16v-16h16zm2-2h-20v20h20v-20zm-24 17v-21h21v2h-19v19h-2z"/></svg>`,
        COPY_DONE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22 2v22h-20v-22h3c1.23 0 2.181-1.084 3-2h8c.82.916 1.771 2 3 2h3zm-11 1c0 .552.448 1 1 1 .553 0 1-.448 1-1s-.447-1-1-1c-.552 0-1 .448-1 1zm9 1h-4l-2 2h-3.897l-2.103-2h-4v18h16v-18zm-13 9.729l.855-.791c1 .484 1.635.852 2.76 1.654 2.113-2.399 3.511-3.616 6.106-5.231l.279.64c-2.141 1.869-3.709 3.949-5.967 7.999-1.393-1.64-2.322-2.686-4.033-4.271z"/></svg>`;

    let shareButton = document.getElementById("share-button"),
        shareUrlPath = shareButton.getAttribute("data-shorten-address"),
        shortShareUrl = (location.origin.match(/https:\/\/d(ocs?)?.nhs.gg/) ? "https://nm.je/g" : location.origin + "/") + shareUrlPath; //go to shortener domain if applicable
    let sharePop;

    if(shareButton) {
        shareButton.addEventListener("click", function(event) {
            event.stopPropagation();
            if(!document.getElementById("share-popup")) {

                let shareBox = shareButton.getBoundingClientRect();

                sharePop = document.createElement("div");
                sharePop.id = "share-popup";
                sharePop.tabIndex = 0;
                sharePop.style.right = (window.innerWidth - shareBox.x - shareBox.width/2) + "px";
                sharePop.style.top = (shareBox.y + shareBox.height/2) + "px";

                let urlCopy = document.createElement("div");
                urlCopy.classList.add("url-copy-parent");
                
                let urlCopyUrl = document.createElement("input");
                urlCopyUrl.readOnly = true;
                urlCopyUrl.value = shortShareUrl;

                let urlCopyButton = document.createElement("button");
                urlCopyButton.innerHTML = COPY_ICON;
                urlCopyButton.tabIndex = 0;
                urlCopyButton.addEventListener("click", function() {
                    urlCopyUrl.focus();
                    urlCopyUrl.select();
                    urlCopyUrl.setSelectionRange(0, window.location.toString().length);

                    document.execCommand("copy");
                    urlCopyButton.innerHTML = COPY_DONE_ICON;

                    urlCopy.classList.add("copied");
                    setTimeout(function() {
                        urlCopy.classList.remove("copied");
                        urlCopyButton.innerHTML = COPY_ICON;
                    }, 1500);
                });

                urlCopy.appendChild(urlCopyUrl);
                urlCopy.appendChild(urlCopyButton);

                let urlCopyControls = document.createElement("label");
                let shortenUrlCheck = document.createElement("input");
                shortenUrlCheck.type = "checkbox";
                shortenUrlCheck.checked = true;
                urlCopyControls.append(shortenUrlCheck, "Shorten URL");

                shortenUrlCheck.addEventListener("change", function() {
                    urlCopyUrl.value = shortenUrlCheck.checked ? shortShareUrl : window.location;
                });

                sharePop.appendChild(urlCopy);
                sharePop.appendChild(urlCopyControls);
                shareButton.parentElement.insertBefore(sharePop, shareButton);

                sharePop.focus();

                sharePop.addEventListener("click", function(e) {
                    e.stopPropagation();
                });

                document.body.addEventListener("click", function() {
                    if(document.activeElement === sharePop) shareButton.focus();
                    document.body.removeEventListener("click",this);
                    sharePop&&sharePop.remove();
                });

                shareButton.addEventListener("focus", function() {
                    shareButton.removeEventListener("focus",this);
                    sharePop&&sharePop.remove();
                });
            }
        });
    }
});
