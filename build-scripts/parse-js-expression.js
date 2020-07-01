var safeEval, parserTools, require;

if (typeof module === 'object') {
    module.exports = parseExpression;

    safeEval = require("safe-eval");
    parserTools = require(__dirname + "/parser-tools.js");
} else {
    safeEval = eval;
}

function parseExpression(str) {
    str = str.trim().replace(/\n\s+/g, "");
    if (!str) return null;

    str = parserTools.stripComments(str);

    let result
    //Object
    if (str.startsWith("{") && str.endsWith("}")) {
        let objBody = str.substring(1, str.length - 1);
        let keyVals = parserTools.groupAwareSplit(objBody, ",");

        result = {};
        for (var i = 0; i < keyVals.length; i++) {
            let keyVal = keyVals[i];

            let lhsRhsSeperatorIndex = parserTools.findUngroupedSubstring(keyVal, ":");

            let lhs = keyVal.substring(0, lhsRhsSeperatorIndex).trim();
            let rhs = keyVal.substring(lhsRhsSeperatorIndex + 1).trim();

            

            if (lhs) result[parserTools.unQuote(lhs)] = parseExpression(rhs.trim());
        }
    }
    //Array
    else if (str.startsWith("[") && str.endsWith("]")) {
        console.log("array! ", str);
        let arrBody = str.substring(1, str.length - 1);
        console.log("body! ", arrBody);
        let vals = parserTools.groupAwareSplit(arrBody, ",");

        result = [];
        for (var i = 0; i < vals.length; i++) {
            result.push(parseExpression(vals[i]));
        }
    }
    //Boolean
    else if (str == "true" || str == "false") {
        result = (str == "true");
    }
    //Function
    else if (str.startsWith("function")) {
        result = function() {
            return safeEval(str)(...arguments);
        }
    }
    //Number
    else if (!isNaN(str)) {
        result = parseFloat(str);
    }
    //String
    else {
        return parserTools.unQuote(str);
    }

    return result;
}