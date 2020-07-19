const express = require('express')
const app = express();
const fs = require("fs");
const compression = require("compression");

app.use(compression());

const redirectsFileAddress = __dirname + "/../build/_redirects";
const redirectsText = fs.existsSync(redirectsFileAddress) ? fs.readFileSync(redirectsFileAddress).toString() : "";
let redirects = redirectsText.split("\n").filter(x=>!x.startsWith("#") && x.trim());

//url rewriting
app.use(function(req, res, next) {
    for(var i = 0; i < redirects.length; i++) {
        let redirFrom = redirects[i].split(/ +/)[0];
        let redirTo = redirects[i].split(/ +/)[1];

        if(req.url.startsWith(redirFrom)) {
            console.log("redirecting", redirFrom, JSON.stringify(req.url.replace(redirFrom, redirTo).trim()));
            res.redirect(req.url.replace(redirFrom, redirTo).trim());
            break;
        }
    }

    next();
});

app.use(express.static(__dirname + "/../build", {extensions: ['html', 'htm']}));

app.listen(5555, function() {
    console.log("Open http://localhost:5555/ to view the site");
    console.log("Press CTRL+C to exit");
});