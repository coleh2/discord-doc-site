let markedIt = require("marked-it-core");

var fs = require("fs");
var cp = require("child_process");
var path = require("path");
var sha1 = require("sha1");
var elasticlunr = require("elasticlunr");

let parseRailroad = require(path.resolve(__dirname, "parse-railroad-diagram.js"));
let parseExpression = require(path.resolve(__dirname, "parse-js-expression.js"));
let Highcharts = require(path.resolve(__dirname, "highcharts-server-version.js"))();
let buildDiscord = require(path.resolve(__dirname, "build-discord-messages.js"));
//initialize additional charts
let additionalChartDir = path.resolve(__dirname, "highcharts-more-chart-types");
let additionalCharts = fs.readdirSync(additionalChartDir);

const PROJECT_FOLDER = process.env.NHS_RULES_DIR || path.resolve(__dirname,"..");

const SEARCH_INDEX_FILE = "../functions/search.js"
const REDIRECT_FILE = "_redirects";

const SHORTENER_MIN_CHARS = 7;

const RAILROAD_STYLE = `<style>
svg.railroad-diagram {background-color: white;}
svg.railroad-diagram path {stroke-width: 3;stroke: #444444;fill: rgba(0,0,0,0);}
svg.railroad-diagram text {font: normal 14px 'Fira Code';text-anchor: middle;white-space: pre;}
svg.railroad-diagram text.diagram-text {font-size: 12px;}
svg.railroad-diagram text.diagram-arrow {font-size: 16px;}
svg.railroad-diagram text.label {text-anchor: start;}
svg.railroad-diagram text.comment {font-style: italic;}
svg.railroad-diagram text.non-terminal {font-style: bold;}
svg.railroad-diagram rect {stroke-width: 3;stroke: #444444;fill: white;}
svg.railroad-diagram rect.group-box {stroke: gray;stroke-dasharray: 10 5;fill: none;}
svg.railroad-diagram path.diagram-text {stroke-width: 3;stroke: #444444;fill: white;cursor: help;}
svg.railroad-diagram g.diagram-text:hover path.diagram-text {fill: #eee;}
</style>`;

const DEVENV_ANALYTICS = `<!-- Matomo -->
<script type="text/javascript">var sitecode = 2;</script>
<script async src="https://counter.clh.sh/counter.js"></script>
<!-- End Matomo Code -->`;

const PRODUCTION_ANALYTICS = `<!-- Matomo -->
<script type="text/javascript">var sitecode = 1;</script>
<script async src="https://counter.clh.sh/counter.js"></script>
<!-- End Matomo Code -->`;

const EDIT_BUTTON_HTML = `
<a id="edit-link" rel="noopener" aria-label="Edit in Github" class="tooltip-right tooltip-newtab" href="https://github.com/coleh2/discord-doc-site/edit/develop/{{address}}" target="_blank" data-tooltip="Edit in Github">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"/></svg>
</a>
`;

const SHARE_BUTTON_HTML = `
<button id="share-button" tabindex="0" aria-label="share" data-tooltip="Share" class="tooltip-right" data-shorten-address="{{shortened}}">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 7c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm11.122 12.065c-.073.301-.122.611-.122.935 0 2.209 1.791 4 4 4s4-1.791 4-4-1.791-4-4-4c-1.165 0-2.204.506-2.935 1.301l-5.488-2.927c-.23.636-.549 1.229-.943 1.764l5.488 2.927zm7.878-15.065c0-2.209-1.791-4-4-4s-4 1.791-4 4c0 .324.049.634.122.935l-5.488 2.927c.395.535.713 1.127.943 1.764l5.488-2.927c.731.795 1.77 1.301 2.935 1.301 2.209 0 4-1.791 4-4z"/></svg>
</button>`;

//load font style and minify it
const FONTS_STYLE = "<style>" +
    fs.readFileSync(path.resolve(PROJECT_FOLDER, "source", "versions", "4", "asset", "fonts.css")).toString().replace(/\n\s*/g, "").replace(/;}/g, "}") +
    "</style>";

const DOCUMENT_AUTHOR_ALIASES = {
    "coleh2": "coleh"
};

const debugLevel = 3;

let erbParser = require("./templater.js");

let mdSourceFolder = path.resolve(PROJECT_FOLDER, "source");
let mdBuildFolder = path.resolve(PROJECT_FOLDER, "build");

//init extra chart types
for(let i = 0; i < additionalCharts.length; i++) {
    let chartModule = require(path.resolve(additionalChartDir, additionalCharts[i]));

    chartModule(Highcharts);
}

//replace analytics scripts
let htmlFiles = loadHtmlFilesFromFolder(mdBuildFolder);
for(var i = 0; i < htmlFiles.length; i++) {
    let source = fs.readFileSync(htmlFiles[i], {encoding: "utf-8"});
    fs.writeFileSync(htmlFiles[i], source.replace("<analyticsScript/>", (process.env.CI=="true")?PRODUCTION_ANALYTICS:DEVENV_ANALYTICS));
}

let mdFiles = loadMarkdownFilesFromFolder(mdSourceFolder);

//short link redirects
var redirects = {};
console.log("Writing redirects to ", (path.join(mdBuildFolder, REDIRECT_FILE)));

for(var i = 0; i < mdFiles.length; i++) {
    let filePath = mdFiles[i].replace(mdSourceFolder,"") //make relative
        .replace(RegExp("\\" + path.sep,"g"), "/") //normalize to posix seperators
        .replace(/(\/index)?.(md|html)$/,""); //remove file ending, index name

    redirects[filePath] = sha1(filePath);
}
//shorten urls as much as possible while keeping the same addresses over time; minimum of 5 for now
let shortenKeys = Object.keys(redirects);
let shortenHashes = Object.values(redirects);
let shortenerLength;

//ensure that they're unique
for(var i = SHORTENER_MIN_CHARS; i < shortenHashes.length; i++) {
    if((new Set(shortenHashes.map(hash => hash.substring(0,i)))).size == shortenHashes.length) {
        shortenerLength = i;
        break;
    }
}
console.log("Shortener Hash length: " + shortenerLength);

let redirectFileCode = "# Start autogenerated shortening redirects"
for(var i = 0; i < shortenKeys.length; i++) {
    redirectFileCode += `\n/${shortenHashes[i].substring(0,shortenerLength)} ${shortenKeys[i]}?utm_source=shortlink`;
}

fs.appendFileSync(path.join(mdBuildFolder, REDIRECT_FILE), redirectFileCode);

//set up search index
var searchIndex = elasticlunr(function() {
    let index = this;

    index.setRef("id");
    index.addField("title", { boost: 10 });
    index.addField("description", { boost: 4 });
    index.addField("author", { boost: 4 });
    index.addField("keywords", { boost: 6 });
    index.addField("text");
});

for(var i = 0; i < mdFiles.length; i++) {
    if(debugLevel >=2) console.log(`Parsing ${mdFiles[i]}`);

    let source = fs.readFileSync(mdFiles[i], {encoding: "utf-8"});

    let filePath = mdFiles[i].replace(mdSourceFolder,"") //make relative
        .replace(RegExp("\\" + path.sep,"g"), "/") //normalize to posix seperators
        .replace(/(\/index)?.(md|html)$/,""); //remove file ending, index name

    let fileTitle = kebabToCapital(path.basename(mdFiles[i], ".md"));

    let iSave = i;
    
    compileMarkdown(source, mdFiles[i], redirects[filePath].substring(0,shortenerLength), function(html,builtFileName, metadata) {
        //only write if a custom-made version doesn't exist
        if(!fs.existsSync(builtFileName)) fs.writeFileSync(builtFileName,html);

        //only add to search if meta robots allows it
        var metaRobots = (metadata.robots || "") //get tag, default to empty
            .toLowerCase() //normalize case
            .replace("none", "nofollow, noindex") //expand none to its simpler equivelant
            .split("\W+"); //split into words
        
        if(!metaRobots.includes("noindex")) {
            searchIndex.addDoc({
                id: filePath,
                title: fileTitle,
                text: source,
                description: metaRobots.includes("nosnippet") ? (metadata.description || "") : "",
                author: metadata.author || "",
                keywords: metadata.keywords || ""
            });
        }

        //write to search index if it's the last file
        if(iSave+1 == mdFiles.length) {
            console.log("writing search index");

            let indexFile = path.join(mdBuildFolder, SEARCH_INDEX_FILE);

            let existingIndexSource = fs.readFileSync(indexFile, {encoding: "utf-8"});

            fs.writeFileSync(indexFile, existingIndexSource.replace(
                "{{SEARCH_INDEX}}", 
                `//begin autogenerated index\nvar pageIndex = ${JSON.stringify(searchIndex)};\n//end autogenerated index`
            ));
        }
    });
    
}

//remove all markdown files from build, where they may've been copied by the build process
cleanMarkdownFilesFromFolder(mdBuildFolder);

function compileMarkdown(mdSource, sourceFileName, shortened, cb) {
    let fileDiagramContext = {}; 
    let existingIdCache = {};

    let compiledHtml = markedIt.generate(mdSource, {
        extensions: {
            html: {
                onCode: function(html, data) {
                    let diagram = parseDiagrams(html, data, fileDiagramContext);
                    if(!diagram) return undefined;

                    if(!fileDiagramContext[diagram.type]) fileDiagramContext[diagram.type] = 0;
                    fileDiagramContext[diagram.type]++;

                    return diagram.html;
                },
                onList: function(html, data) {
                    if(html.startsWith("<ul toc>")) return "<ul toc></ul>";
                    else if(html.startsWith("<ul index>")) return "<ul index></ul>";
                },
                onHeading: function(html, data) {
                    var idRegex = (/id="([\w-]+)"/).exec(html),
                        id = idRegex[1];
                    if(!existingIdCache[id]) {
                        existingIdCache[id]=1;
                    } else {
                        existingIdCache[id]++;
                        return html.replace(`id="${id}"`, `id="${id}-${existingIdCache[id]}"`);
                    }

                    if(html.startsWith("<h1")) return html.replace("</h1>", `<span class="actions">` + EDIT_BUTTON_HTML.replace("{{address}}", sourceFileName.replace(mdSourceFolder, "source")) + SHARE_BUTTON_HTML.replace("{{shortened}}", shortened) + "</span></h1>");
                }
            }
        }
    });

    compiledHtml.html.text = replaceToc(compiledHtml);

    var metaParsed = parseAndRemoveMetadata(compiledHtml.html.text);
    compiledHtml.html.text = metaParsed.html;

    let builtFileName = sourceFileName.replace(mdSourceFolder,mdBuildFolder).replace(/\.md$/,".html");

    //don't override the file if it's already custom-made from the source directory
    if(fs.existsSync(builtFileName)) return cb(compiledHtml.html.text,builtFileName);

    let sourceFileFolder = sourceFileName.replace(path.basename(sourceFileName),"");

    //add index list
    compiledHtml.html.text = replaceIndex(compiledHtml, sourceFileFolder, sourceFileName);

    //make folder to place built file in
    let builtFileFolder = builtFileName.replace(path.basename(builtFileName),"");
    fs.mkdirSync(builtFileFolder, { recursive: true });

    let templateFileName = path.resolve(mdSourceFolder,"docpage.html.erb");

    //if there's a template in the folder, load and apply it
    if(fs.existsSync(templateFileName)) {
        if(debugLevel >=2) console.log(`Template file ${templateFileName} found; applying template`);

        let erbTemplate = fs.readFileSync(templateFileName, {encoding: "utf-8"});

        resolveDocpageTemplate(compiledHtml, builtFileName, erbTemplate, fileDiagramContext, metaParsed, function(erbHtml) {
            cb(erbHtml,builtFileName, metaParsed.metaData);
        });
    } else {
        if(debugLevel >=2) console.log(`No template file ${templateFileName} found; falling back to bare markdown output`);
        cb(compiledHtml.html.text,builtFileName, metaParsed.metaData);
    }
}

function replaceIndex(compiledHtml, folder, indexFilename) {
    let folderContents = fs.readdirSync(folder, {
        withFileTypes: true
    });

    if(compiledHtml.html.text.indexOf("<ul index></ul>") == -1) return compiledHtml.html.text;

    let listElements = [];

    for(var i = 0; i < folderContents.length; i++) {
        if((folderContents[i].name.endsWith(".md") && !indexFilename.endsWith(folderContents[i].name)) || 
           (folderContents[i].isDirectory() && folderContents[i].name != "asset")) {
            let filename = path.basename(folderContents[i].name, ".md")
            listElements.push(`<li><a href="${filename}">${kebabToCapital(filename)}</a></li>`)
        }
    }

    if(listElements.length > 0) return compiledHtml.html.text.replace("<ul index></ul>",`<ul index>${listElements.join("\n")}</ul>`);
    else return compiledHtml.html.text;
}

function replaceToc(compiledHtml) {
    if(compiledHtml.jsonToc.text.length > "{\"toc\":{}}".length) {
        let toc = JSON.parse(compiledHtml.jsonToc.text);
        return compiledHtml.html.text.replace("<ul toc></ul>",`<ul toc>${generateTocList(toc.toc, 3)}`);
    }
}

function parseAndRemoveMetadata(html) {
    let metaRegex = /<meta [^>]+>\n?/;

    let metaStart = html.indexOf("<meta ");
    
    let metaTags = [];
    let metaData = {};

    while(metaStart != -1) {
        let metaResult = metaRegex.exec(html);
        if(!metaResult) {
            //if it's not correct, ruin the match, then continue
            html = html.replace("<meta", "&lt;meta");
            metaStart = html.indexOf("<meta ");
            continue;
        }

        metaTags.push(metaResult[0]);

        let metaName = (/name="([^"]+)"/).exec(metaResult[0])[1];
        let metaValue = (/content="([^"]+)"/).exec(metaResult[0])[1];

        metaData[metaName] = metaValue;

        html = html.replace(metaRegex, "");

        metaStart = html.indexOf("<meta ");
    }

    return {
        html: html,
        meta: metaTags.join("\n"),
        metaData: metaData
    }
} 

function generateTocList(toc,maxLevel,parserProblemState,currentLevel,existingTopics) {
    if(!toc.topics) return "";
    if(!parserProblemState) parserProblemState = 0;
    if(!currentLevel) currentLevel = 0;
    if(!existingTopics) existingTopics = {};

    if(!toc.label) parserProblemState = 2;

    if(currentLevel >= maxLevel) return "";

    //The parser treats divs as headings, but without labels; to fix this,  this skips them (not making another ul)
    let html = "<ul>"
    if(parserProblemState == 2 || parserProblemState == 3) html = "";

    for(var i = 0; i < toc.topics.length; i++) {
        //communicate current parser-weirdness to the children so they can adapt to it
        let childParserProblem = 0;
        if(toc.topics[i+1] && !toc.topics[i+1].label) childParserProblem = 1;

        if(!existingTopics[toc.topics[i].label]) {
            existingTopics[toc.topics[i].label]=1;
        } else {
            existingTopics[toc.topics[i].label]++;
            toc.topics[i].id = `${toc.topics[i].id}-${existingTopics[toc.topics[i].label]}`;
        }
        
        if(!toc.topics[i].label) html += generateTocList(toc.topics[i], maxLevel, 3,currentLevel+1,existingTopics);
        else html += `<li><a href="#${toc.topics[i].id}">${toc.topics[i].label}</a>${generateTocList(toc.topics[i], maxLevel, childParserProblem,currentLevel+1,existingTopics)}</li>`
    }

    if(parserProblemState != 1 && parserProblemState != 3) html += "</ul>";

    return html;
}

function resolveDocpageTemplate(compiledHtml, fileName, erbTemplate, fileDiagramContext, metaData, cb) {
        let title;

        if(compiledHtml.jsonToc.text.length > "{\"toc\":{}}".length) {
            let toc = JSON.parse(compiledHtml.jsonToc.text);
            title = toc.toc.topics[0].label;
        } else {
            title = kebabToCapital(path.basename(fileName,".html"));
        }

        var breadcrumbRelativeAddress = fileName.replace(mdBuildFolder, "");
        var breadcrumbListElems = [];

        //construct breadcrumbs
        for(; breadcrumbRelativeAddress != "" ;) {
            let currentName = path.basename(breadcrumbRelativeAddress);
            let relativeAddressNoEnd = breadcrumbRelativeAddress.replace(/\.html$/,"");

            //don't make entries for indexes
            if(currentName == "index.html") {
                breadcrumbRelativeAddress = breadcrumbRelativeAddress.replace(path.sep + currentName,"");
                continue;
            }

            breadcrumbListElems.push(`<li><a href="${relativeAddressNoEnd.replace(RegExp("\\" + path.sep, "g"), "/")}">
                ${kebabToCapital(currentName.replace(/\.html$/,""))}</a>
            </li>`);

            breadcrumbRelativeAddress = breadcrumbRelativeAddress.replace(path.sep + currentName,"");
        }

        var breadcrumbHtml = "";

        if(breadcrumbListElems.length > 0) {
            breadcrumbHtml = `<ul class="breadcrumb">
            <li><a href="/">Home</a></li>${breadcrumbListElems.reverse().join("")}
            </ul>`
        }

        var sourceFile = fileName.replace(mdBuildFolder, mdSourceFolder).replace(/\.html$/, ".md");
        var unixEscapedSourceFile = sourceFile.replace(/\"/, "\\\"");

        //on windows, backslashes are used for path spearators, so don't escape them
        if(process.platform !== "win32") unixEscapedSourceFile = unixEscapedSourceFile.replace(/\\/g, "\\\\");
        var gitAuthors = cp
            .execSync(`git log --pretty=format:'%an' -- "${unixEscapedSourceFile}" | cat | sort | uniq`)
            .toString()
            .split("\n")
            .filter(x=>x)
            .map(x=> x.match(/\w+/)[0]);

        var documentDefinedAuthors = [];
        if(metaData.metaData.author != undefined) {
            documentDefinedAuthors = metaData.metaData.author.split(/, +/);
        }
        var allAuthors = documentDefinedAuthors.concat(gitAuthors);
        
        allAuthors = Array.from(new Set(
            allAuthors
            .map(x=>DOCUMENT_AUTHOR_ALIASES[x]||x)
        ));

        var authorPluralization = (allAuthors || [1]).length == 1 ? "Author" : "Authors";

        erbParser({
            data: {
                fields: {
                    fontsStyle: FONTS_STYLE,
                    body: compiledHtml.html.text,
                    credits: allAuthors ? authorPluralization + ": " + allAuthors.join(", ") : "",
                    title: title,
                    generator: "markedIt",
                    railroadStyle: fileDiagramContext.railroad>0?RAILROAD_STYLE:"",
                    logoImage: "https://cdn.discordapp.com/icons/392830469500043266/ec0abbd24cc285867bf1a0f98048d327.png",
                    breadcrumbs: breadcrumbHtml,
                    analyticsScript: (process.env.CI=="true")?PRODUCTION_ANALYTICS:DEVENV_ANALYTICS,
                    metaTags: metaData.meta
                }
            },
            template: erbTemplate
        }, function(erbHtml) {
            if(debugLevel >=2) console.log(`Template applied successfully`);
            cb(erbHtml);
        }, function(error) {
            console.error("Template parsing error! Using bare parsed HTML. Error below:");
            console.error(error);
            cb(compiledHtml.html.text);
        });
}

function kebabToCapital(str) {
    let words = str.split("-");

    for(var i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substring(1);
    }

    return words.join(" ");
}

function loadMarkdownFilesFromFolder(folder) {
    let results = [];

    let folderContents = fs.readdirSync(folder, {
        withFileTypes: true
    });

    for(var i = 0; i < folderContents.length; i++) {
        let subfile = folderContents[i];

        if(subfile.isDirectory()) {
            results = results.concat(loadMarkdownFilesFromFolder(path.resolve(folder, subfile.name)));
        } else if(subfile.isFile() && subfile.name.endsWith(".md")) {
            results.push(path.resolve(folder, subfile.name));
        }
    }

    return results;
}

function loadHtmlFilesFromFolder(folder) {
    let results = [];

    let folderContents = fs.readdirSync(folder, {
        withFileTypes: true
    });

    for(var i = 0; i < folderContents.length; i++) {
        let subfile = folderContents[i];

        if(subfile.isDirectory()) {
            results = results.concat(loadHtmlFilesFromFolder(path.resolve(folder, subfile.name)));
        } else if(subfile.isFile() && subfile.name.endsWith(".html")) {
            results.push(path.resolve(folder, subfile.name));
        }
    }

    return results;
}

function cleanMarkdownFilesFromFolder(folder) {

    let folderContents = fs.readdirSync(folder, {
        withFileTypes: true
    });

    for(var i = 0; i < folderContents.length; i++) {
        let subfile = folderContents[i];

        if(subfile.isDirectory()) {
            cleanMarkdownFilesFromFolder(path.resolve(folder, subfile.name))
        } else if(subfile.isFile() && subfile.name.endsWith(".md")) {
            fs.unlinkSync(path.resolve(folder, subfile.name));
        }
    }
}

function parseDiagrams(html, data, context) {
    let dom = data.htmlToDom(html)[0];
    
    //if it has a foo-diagram class, it's a diagram
    if(dom.attribs.class && /( |^)\w+-diagram( |$)/.test(dom.attribs.class)) {
        let diagramType = /( |^)(\w+)-diagram( |$)/.exec(dom.attribs.class)[2];

        let innerText = data.domUtils.getText(dom),
            parsableText = parseCharacterEntities(innerText);
        switch(diagramType) {
            case "railroad":
                return {
                    type: "railroad",
                    html: parseRailroad(parsableText)
                };
            break;
            case "highchart":
                let chartParams = parseExpression(parsableText);

                //fill in properties that are required for the server-side variety
                if(!chartParams.chart) chartParams.chart = {};
                if(!chartParams.chart.width || !chartParams.chart.height) {
                    chartParams.chart.height = 600;
                    chartParams.chart.width = 800;
                }

                //default to no-credits
                if(!chartParams.credits) chartParams.credits = {};
                if(!chartParams.credits.enabled) chartParams.credits.enabled = false;

                if(!chartParams.colors) chartParams.colors = [
                    "#CD9575","#78DBE2","#87A96B","#FFA474","#9F8170","#FD7C6E","#1F75FE","#A2A2D0","#0D98BA","#7366BD","#DE5D83","#CB4154","#B4674D",
                    "#FF7F49","#EA7E5D","#B0B7C6","#00CC99","#DD4492","#1DACD6","#BC5D58","#DD9475","#9ACEEB","#FDDB6D","#2B6CC4","#CEFF1D","#71BC78",
                    "#6DAE81","#C364C5","#CC6666","#E7C697","#FCD975","#A8E4A0","#95918C","#1CAC78","#FF1DCE","#B2EC5D","#5D76CB","#CA3767","#3BB08F",
                    "#FEFE22","#FFBD88","#F664AF","#CD4A4C","#979AAA","#FF8243","#C8385A","#EF98AA","#30BA8F","#1974D2","#FFA343","#BAB86C","#FF7538",
                    "#FF6E4A","#1CA9C9","#F78FA7","#8E4585","#7442C8","#9D81BA","#FE4EDA","#FF496C","#D68A59","#FF48D0","#E3256B","#EE204D","#FF5349",
                    "#C0448F","#1FCECB","#7851A9","#FF9BAA","#FC2847","#76FF7A","#93DFB8","#A5694F","#8A795D","#45CEA2","#CDC5C2","#80DAEB","#FFCF48",
                    "#FD5E53","#FAA76C","#FC89AC","#DEAA88","#77DDE7","#926EAE","#F75394","#FFA089","#8F509D","#A2ADD0","#FF43A4","#FC6C85","#CDA4DE",
                    "#C5E384","#FFAE42"
                  ];

                let chart = Highcharts.chart(chartParams);

                return {
                    type: "highchart",
                    html: `<figure>${chart.container.__buildInnerHTML(false)}</figure>`
                };
            break;
        }
    }

    //also test for discord-messages
    if(dom.attribs.class && /( |^)discord-messages( |$)/.test(dom.attribs.class)) {
        let innerText = data.domUtils.getText(dom),
            parsableText = parseCharacterEntities(innerText);

            return {
                type: "discord",
                html: buildDiscord(parsableText, context)
            };
    }

}

function parseCharacterEntities(str) {
    return str.replace(/&amp;/g,"&")
              .replace(/&quot;/g,"\"")
              .replace(/&apos;/g,"'")
              .replace(/&lt;/g,"<")
              .replace(/&gt;/g,">")
              .replace(/&#39;/g,"'");
}