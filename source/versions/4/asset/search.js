(function() {
    if(!window.pageIndex) return;

    var params = new URLSearchParams(window.location.search);

    if(!params.has("q")) return;

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

    var results = searchIndex.search(params.get("q"));

    console.log(results);

    let serpList = document.getElementById("serp-list");
    let serpQuery = document.getElementById("serp-query");

    serpQuery.textContent = `${results.length} results for "${params.get("q")}"`

    for(var i = 0; i < results.length; i++) {
        serpList.appendChild(buildResult(pageIndex[results[i].ref],results[i].matchData));
    }


    function buildResult(resultDocObject,matchData) {
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

        let matchIndex = text.indexOf(matchTerm);
        let snippetText = text.substring(matchIndex-100,matchIndex+100);

        snippet.innerHTML = `&hellip;${boldifySubstring(snippetText, matchTerm)}&hellip;`;

        return snippet;
    }

    function boldifySubstring(text, substr) {
        let subIndex = text.indexOf(substr);

        let before = text.substring(0,subIndex);
        let after = text.substring(subIndex + substr.length);

        return `${before}<strong>${substr}</strong>${after}`
    }
})();