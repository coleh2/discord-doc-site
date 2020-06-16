var fs = require("fs");
var path = require("path");

let projectFolder = process.env.NHS_RULES_DIR || path.resolve(__dirname,"..");

let mdSourceFolder = path.resolve(projectFolder, "source");

let mdFolders = loadMarkdownFilesFromFolder(mdSourceFolder);

makeIndexesInFolder(mdFolders);

function makeIndexesInFolder(folder) {
    let folderAddress = folder.name;

    let markdownFiles = [];
    for(var i = 0; i < folder.children.length; i++) {
        if(typeof folder.children[i] == "string") {
            if(path.basename(folder.children[i]) == "index.md") continue;
            markdownFiles.push(folder.children[i]);
        } else {
            markdownFiles.push(folder.children[i].name);
            makeIndexesInFolder(folder.children[i]);
        }
    }

    let markdownSource = `# Index of ${path.basename(folderAddress)}`

    for(var i = 0; i < markdownFiles.length; i++) {
        let filename = path.basename(markdownFiles[i],".md");
        markdownSource += `\n * [${kebabToCapital(filename)}](${filename})`;
    }

    let indexAddress = path.resolve(folderAddress, "index.md");

    fs.writeFileSync(indexAddress, markdownSource);
}

function kebabToCapital(str) {
    str = str.replace(/v(\d+)-(\d+)-(\d+)/,"v$1.$2.$3");
    let words = str.split("-");

    for(var i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substring(1);
    }

    return words.join(" ");
}

function loadMarkdownFilesFromFolder(folder) {
    let results = {
        name: folder,
        children: []
    };

    let folderContents = fs.readdirSync(folder, {
        withFileTypes: true
    });

    for(var i = 0; i < folderContents.length; i++) {
        let subfile = folderContents[i];

        if(subfile.isDirectory()) {
            results.children.push(loadMarkdownFilesFromFolder(path.resolve(folder, subfile.name)));
        } else if(subfile.isFile() && subfile.name.endsWith(".md")) {
            results.children.push(path.resolve(folder, subfile.name));
        }
    }

    return results;
}