const fs = require("fs");
const path = require("path");
var UglifyJS = require("uglify-es");

let projectFolder = process.env.NHS_RULES_DIR || path.resolve(__dirname,"..");

let buildFolder = path.resolve(projectFolder, "build");

let jsFiles = loadScriptFilesFromFolder(buildFolder);

console.log("minifying JS files");
for(var i = 0 ; i < jsFiles.length; i++) {
    let fileContent = fs.readFileSync(jsFiles[i]).toString();
    let minified = UglifyJS.minify(fileContent);
    if(!minified.error) {
        fs.writeFileSync(jsFiles[i], minified.code);
    } else {
        console.warn("Error minifying " + jsFiles[i]);
        console.warn(minified.error);
    }
}


function loadScriptFilesFromFolder(folder) {
    let results = [];

    let folderContents = fs.readdirSync(folder, {
        withFileTypes: true
    });

    for(var i = 0; i < folderContents.length; i++) {
        let subfile = folderContents[i];

        if(subfile.isDirectory()) {
            results = results.concat(loadScriptFilesFromFolder(path.resolve(folder, subfile.name)));
        } else if(subfile.isFile() && subfile.name.endsWith(".js")) {
            results.push(path.resolve(folder, subfile.name));
        }
    }

    return results;
}