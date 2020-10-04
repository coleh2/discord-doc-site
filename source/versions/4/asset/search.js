(function() {

    var params = new URLSearchParams(window.location.search);

    let serpInput = document.getElementById("main-search-input");
    let serpList = document.getElementById("serp-list");
    let serpQuery = document.getElementById("serp-query");
    let serpLoading = document.getElementById("serp-loading");


    if(!params.has("q") || params.get("q") == "") {
        serpQuery.textContent = "Enter a query and hit the button to search!";
        serpLoading.hidden = true;
        return;
    } else {
        serpInput.value = params.get("q");

        var searchXhr = new XMLHttpRequest();
        searchXhr.open("GET", "/.netlify/functions/search?q=" + encodeURIComponent(params.get("q")));

        searchXhr.onload = function() {
            var response;
            
            //parse the JSON reply
            try { 
                response = JSON.parse(searchXhr.responseText);
            } catch(e) {
                response = {};
            }
            
            //if no results, tell the user. if yes results, create the result list
            if(!response.results || response.results.length == 0) {
                return serpQuery.textContent = `No results found for "${params.get("q")}"`;
            } else {
                serpQuery.textContent = `${response.results.length} results for "${params.get("q")}"`
                serpLoading.hidden = true;
                for(var i = 0; i < response.results.length; i++) {
                    serpList.appendChild(buildResult(response.results[i]));
                }
            }
        };

        searchXhr.send();
        serpLoading.hidden = false;
    }

    


    function buildResult(result) {
        let li = document.createElement("li");
        let resultId = result.ref;
        let resultDocObject = result.doc;

        let resultHeading = document.createElement("h3");

        let resultLink = document.createElement("a");
        resultLink.href = resultId;
        resultLink.textContent = resultDocObject.title;

        resultHeading.appendChild(resultLink);

        let resultSubheading = document.createElement("div");
        resultSubheading.textContent = resultDocObject.id;

        let resultSnippet = buildSnippet(resultDocObject.text);

        li.appendChild(resultHeading);
        li.appendChild(resultSubheading);
        li.appendChild(resultSnippet);

        return li;
    }

    function buildSnippet(text) {
        let snippet = document.createElement("p");
        
        snippet.innerText = text;

        return snippet;
    }

    function boldifySubstring(text, substr, indexOverride) {
        let subIndex = indexOverride || caseInsensitiveIndexOf(text, matchTerm);

        let before = text.substring(0,subIndex);
        let instance = text.substring(subIndex, subIndex + substr.length);
        let after = text.substring(subIndex + substr.length);

        let paragraph = document.createElement("p");

        paragraph.appendChild(document.createTextNode(before));

        let strong = document.createElement("strong");
        strong.innerText = instance;
        paragraph.appendChild(strong);

        paragraph.appendChild(document.createTextNode(after));

        return paragraph;
    }

    function caseInsensitiveIndexOf(text, substr) {
        return text.toLowerCase().indexOf(substr.toLowerCase());
    }
})();