if (typeof module === 'object') module.exports = parseExpression;

const safeEval = require("safe-eval");

function parseExpression(str) {
    str = str.trim();
    if (!str) return null;

    str = stripComments(str);

    let result
    //Object
    if (str.startsWith("{") && str.endsWith("}")) {
        let objBody = str.substring(1, str.length - 1);
        let keyVals = groupAwareSplit(objBody, ",");

        result = {};
        for (var i = 0; i < keyVals.length; i++) {
            let keyVal = keyVals[i];

            let lhsRhsSeperatorIndex = findUngroupedSubstring(keyVal, ":");

            let lhs = keyVal.substring(0, lhsRhsSeperatorIndex).trim();
            let rhs = keyVal.substring(lhsRhsSeperatorIndex + 1).trim();

            if (lhs) result[unQuote(lhs)] = parseExpression(rhs.trim());
        }
    }
    //Array
    else if (str.startsWith("[") && str.endsWith("]")) {
        let arrBody = str.substring(1, str.length - 1);
        let vals = groupAwareSplit(arrBody, ",");

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
        result = safeEval(str);
    }
    //Number
    else if (!isNaN(str)) {
        result = parseFloat(str);
    }
    //String
    else {
        return unQuote(str);
    }

    return result;
}

function stripComments(str) {

    let commentStart, commentEnd;

    let inSingleQuote = false, inDoubleQuote = false, inMultilineComment = false;

    for (var i = 0; i < str.length; i++) {
        let inQuote;
        if(!inMultilineComment) {
            if (str[i] == "\"" && str[i - 1] != "\\" && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
            if (str[i] == "'" && str[i - 1] != "\\" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
            inQuote = inSingleQuote || inDoubleQuote;
        }
        

        if (!inQuote && !inMultilineComment) {
            //inline comment
            if (str[i] == "/" && str[i + 1] == "/") {
                commentEnd = indexOfAfter(str,"\n",i);

                //if it's on the last line, commentEnd should be the end of the string
                commentEnd = commentEnd != -1 ? commentEnd : str.length;

                //with the length change, i is now at the end
                str = indexReplace(str, i, commentEnd, "\n");
            }

            //multiline comment
            if(str[i] == "/" && str[i + 1] == "*") {
                commentStart = i;
                inMultilineComment = true;
            }
        }

        //only the specific character sequence can end multilines, and only when one is already on
        if(str[i] == "*" && str[i + 1] == "/" && inMultilineComment) {
            commentEnd = i+1;
            str = indexReplace(str, commentStart, commentEnd, "");
            inMultilineComment = false;
        }
    }
    return str;
}


function indexOfAfter(str, substr, index) {
    return str.substring(index+1).indexOf(substr) + index + 1;
}

function indexReplace(str, replaceStart, replaceEnd, replaceText) {
    return str.substring(0, replaceStart) + replaceText + str.substring(replaceEnd + 1);
}

function unQuote(str) {
    if (str.startsWith("\"") && str.endsWith("\"")) {
        return str.substring(1, str.length - 1);
    }

    if (str.startsWith("'") && str.endsWith("'")) {
        return str.substring(1, str.length - 1);
    }

    return str;
}

function findUngroupedCharRegex(str, regex) {
    let inGroup = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (var i = 0; i < str.length; i++) {
        if (str[i] == "\"" && str[i - 1] != "\\" && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        if (str[i] == "'" && str[i - 1] != "\\" && !inDoubleQuote) inSingleQuote = !inSingleQuote;

        let inQuote = inSingleQuote || inDoubleQuote;

        if ((str[i] == "{" || str[i] == "[") && !inQuote) inGroup++;
        else if ((str[i] == "}" || str[i] == "]") && !inQuote) inGroup--;

        if (str[i].match(regex) && inGroup == 0 && inQuote == false) return i;
    }
    return -1;
}

function groupAwareSplit(str, split) {
    let words = [];

    split = split || " ";

    let prevSplitIndex = 0,
        nextSplitIndex = findUngroupedSubstring(str, split);


    while (nextSplitIndex != -1 && words.length < 1000) {
        words.push(str.substring(prevSplitIndex, nextSplitIndex));

        prevSplitIndex = nextSplitIndex + 1;
        nextSplitIndex = findUngroupedSubstring(str.substring(prevSplitIndex), split);
        if (nextSplitIndex > -1) nextSplitIndex += prevSplitIndex;
    }

    words.push(str.substring(prevSplitIndex));

    return words;
}

/**
 * A collection of options governing how to find groups.
 * @typedef {Object} GroupFindingOptions
 * @property {boolean} doQuotes - Treat quotes as groups
 * @property {boolean} doGroups - Use usual grouping symbols ([], {}, ())
 */

/**
 * 
 * @param {String} str The string to search in
 * @param {String} substr The string to search for
 * @param {Object} [options] - Options that govern how groups are defined
 * @param {boolean} options.doQuotes - Treat quotes as groups
 * @param {boolean} options.doGroups - Also use usual grouping symbols ([], {}, ())
 * @returns First index of the substring inside the string, or -1 if none were found
 */
function findUngroupedSubstring(str, substr, options) {
    let inGroup = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    //fill in defaults
    if (!options) options = {
        doQuotes: true,
        doGroups: true
    }

    for (var i = 0; i < str.length; i++) {

        if (options.doQuotes) {
            if (str[i] == "\"" && str[i - 1] != "\\" && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
            if (str[i] == "'" && str[i - 1] != "\\" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
        }

        let inQuote = inSingleQuote || inDoubleQuote;

        if (options.doGroups) {
            if ((str[i] == "{" || str[i] == "[") && !inQuote) inGroup++;
            else if ((str[i] == "}" || str[i] == "]") && !inQuote) inGroup--;
        }

        if (str.substring(i - substr.length + 1, i + 1) == substr &&
            inGroup == 0 &&
            inQuote == false) {
            return i - substr.length;
        }
    }
    return -1;
}

function hasUngroupedChar(str, char) {
    let inGroup = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (var i = 0; i < str.length; i++) {
        if (str[i] == "\"" && str[i - 1] != "\\" && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        if (str[i] == "'" && str[i - 1] != "\\" && !inDoubleQuote) inSingleQuote = !inSingleQuote;

        let inQuote = inSingleQuote || inDoubleQuote;

        if ((str[i] == "{" || str[i] == "[") && !inQuote) inGroup++;
        else if ((str[i] == "}" || str[i] == "]") && !inQuote) inGroup--;

        if (str[i] == char && inGroup == 0 && !inQuote) return true;
    }
    return false;
}