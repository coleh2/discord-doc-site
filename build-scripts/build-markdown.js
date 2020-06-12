let markedIt = require("marked-it-core");

let parseRailroad = require("./parse-railroad-diagram.js");

let erbParser = require("erb");

let projectFolder = process.env.NHS_RULES_DIR || "..";

var fs = require("fs");
var path = require("path");

let mdSourceFolder = path.resolve(projectFolder, "source");
let mdBuildFolder = path.resolve(projectFolder, "build");

let mdFiles = loadMarkdownFilesFromFolder(mdSourceFolder);

for(var i = 0; i < mdFiles.length; i++) {
    let source = fs.readFileSync(mdFiles[i], {encoding: "utf-8"})

    compileMarkdown(source, mdFiles[i], function(html,builtFileName) {
        fs.writeFileSync(builtFileName,html);
    });
    
}

//remove all markdown files from build, where they may've been copied by the build process
cleanMarkdownFilesFromFolder(mdBuildFolder);

function compileMarkdown(mdSource, sourceFileName, cb) {    
    let compiledHtml = markedIt.generate(mdSource, {
        extensions: {
            html: {
                onCode: parseDiagrams,
                onList: function(html, data) {
                    if(html.startsWith("<ul toc>")) return "<ul toc></ul>";
                }
            }
        }
    });

    compiledHtml.html.text = replaceToc(compiledHtml);

    let builtFileName = sourceFileName.replace(mdSourceFolder,mdBuildFolder).replace(/\.md$/,".html");

    let sourceFileFolder = sourceFileName.replace(path.basename(sourceFileName),"");

    //make folder to place built file in
    let builtFileFolder = builtFileName.replace(path.basename(builtFileName),"");
    fs.mkdirSync(builtFileFolder, { recursive: true });

    let templateFileName = path.resolve(sourceFileFolder,"docpage.html.erb");

    //if there's a template in the folder, load and apply it
    if(fs.existsSync(templateFileName)) {
        let erbTemplate = fs.readFileSync(templateFileName, {encoding: "utf-8"});

        resolveDocpageTemplate(compiledHtml, builtFileName, erbTemplate, function(erbHtml) {
            cb(erbHtml,builtFileName);
        });
    } else {
        cb(compiledHtml.html.text,builtFileName);
    }
}

function replaceToc(compiledHtml) {
    if(compiledHtml.jsonToc.text.length > "{\"toc\":{}}".length) {
        let toc = JSON.parse(compiledHtml.jsonToc.text);
        return compiledHtml.html.text.replace("<ul toc></ul>",`<ul toc>${generateTocList(toc.toc, 3)}`);
    }
}

function generateTocList(toc,maxLevel,parserProblemState,currentLevel) {
    if(!toc.topics) return "";
    if(!parserProblemState) parserProblemState = 0;
    if(!currentLevel) currentLevel = 0;

    if(!toc.label) parserProblemState = 2;

    if(currentLevel >= maxLevel) return "";

    //The parser treats divs as headings, but without labels; to fix this,  this skips them (not making another ul)
    let html = "<ul>"
    if(parserProblemState == 2 || parserProblemState == 3) html = "";

    for(var i = 0; i < toc.topics.length; i++) {
        //communicate current parser-weirdness to the children so they can adapt to it
        let childParserProblem = 0;
        if(toc.topics[i+1] && !toc.topics[i+1].label) childParserProblem = 1;
        
        if(!toc.topics[i].label) html += generateTocList(toc.topics[i], maxLevel, 3,currentLevel+1);
        else html += `<li><a href="#${toc.topics[i].id}">${toc.topics[i].label}</a>${generateTocList(toc.topics[i], maxLevel, childParserProblem,currentLevel+1)}</li>`
    }

    if(parserProblemState != 1 && parserProblemState != 3) html += "</ul>";

    return html;
}

function resolveDocpageTemplate(compiledHtml, fileName, erbTemplate, cb) {
        let title;

        if(compiledHtml.jsonToc.text.length > "{\"toc\":{}}".length) {
            let toc = JSON.parse(compiledHtml.jsonToc.text);
            title = toc.toc.topics[0].label;
        } else {
            title = kebabToCapital(path.basename(fileName,".html"));
        }

        let version = /(v\d+)/.exec(fileName) || "?";
        if(version) version = version[1];

        erbParser({
            data: {
                fields: {
                    body: compiledHtml.html.text,
                    title: title,
                    generator: "markedIt",
                    logoImage: "https://cdn.discordapp.com/icons/392830469500043266/8e8f9eff25ffa6d7677a1e7150d1a7a8.png",
                    versionIndexUrl: "./",
                    docVersion: version
                }
            },
            template: erbTemplate
        }).then(function(erbHtml) {
            cb(erbHtml);
        }, function(error) {
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

function parseDiagrams(html, data) {
    let dom = data.htmlToDom(html)[0];
    
    
    
    //if the railroad-diagram class is in the code elem
    if(dom.attribs.class && /( |^)railroad-diagram( |$)/.test(dom.attribs.class)) {
        let innerText = data.domUtils.getText(dom);
        let parsableText = parseCharacterEntities(innerText);

        return html.replace(innerText,parseRailroad(parsableText));
    }
}

function parseCharacterEntities(str) {
    return str.replace(/&amp;/g,"&")
              .replace(/&quot;/g,"\"")
              .replace(/&apos;/g,"'")
              .replace(/&lt;/g,"<")
              .replace(/&gt;/g,">");
}