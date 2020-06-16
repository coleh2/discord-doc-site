const express = require('express')
const app = express();

app.use(express.static(__dirname + "/../build", {extensions: ['html', 'htm']}));

app.listen(5555, function() {
    console.log("Open http://localhost:5555/ to view the site");
    console.log("Press CTRL+C to exit");
});