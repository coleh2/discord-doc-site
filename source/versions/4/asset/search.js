(function() {
    if(!window.pageIndex) return;

    var params = new URLSearchParams(window.location.search);

    let serpList = document.getElementById("serp-list");
    let serpQuery = document.getElementById("serp-query");
    let serpLoading = document.getElementById("serp-loading");


    if(!params.has("q") || params.get("q") == "") {
        serpQuery.textContent = "Enter a query and hit the button to search!";
        serpLoading.hidden = true;
        return;
    };

    serpLoading.hidden = false;

    var searchIndex = lunr(function() {
        let index = this;

        index.ref("id");
        index.field("title", { boost: 10 });
        index.field("text");

        let keys = Object.keys(pageIndex);
        for (var i = 0; i < keys.length; i++) {
            let indexItem = pageIndex[keys[i]];
            index.add({
                "id": indexItem.id,
                "title": indexItem.title,
                "text": indexItem.text
            });
        }
    });

    window.results = searchIndex.search(params.get("q"));

    serpQuery.textContent = `${results.length} results for "${params.get("q")}"`

    for(var i = 0; i < results.length; i++) {
        serpList.appendChild(buildResult(pageIndex[results[i].ref],results[i].matchData));
    }

    serpLoading.hidden = true;


    function buildResult(resultDocObject, matchData) {
        let li = document.createElement("li");
        let resultId = results[i].ref;

        let resultObject = pageIndex[resultId];

        let resultHeading = document.createElement("h3");

        let resultLink = document.createElement("a");
        resultLink.href = resultDocObject.id;
        resultLink.textContent = resultDocObject.title;

        resultHeading.appendChild(resultLink);

        let resultSubheading = document.createElement("div");
        resultSubheading.textContent = resultDocObject.id;

        let resultSnippet = buildSnippet(resultDocObject.text, matchData);

        li.appendChild(resultHeading);
        li.appendChild(resultSubheading);
        li.appendChild(resultSnippet);

        return li;
    }

    function buildSnippet(text, matchData) {
        let snippet = document.createElement("p");
        let matchTerm = Object.keys(matchData.metadata)[0];

        let matchIndex = caseInsensitiveIndexOf(text, matchTerm);
        let snippetText = text.substring(matchIndex-100,matchIndex+100);

        snippet.appendChild(boldifySubstring(snippetText, matchTerm, matchIndex));

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