if(typeof module === 'object') module.exports = parseExpression;

function parseExpression(str) {
    str = str.trim();
    if(!str) return null;

    let result
    //Object
    if(str.startsWith("{") && str.endsWith("}")) {
        let objBody = str.substring(1,str.length - 1);
        let keyVals = groupAwareSplit(objBody, ",");

        result = {};
        for(var i = 0; i < keyVals.length; i++) {
            let keyVal = keyVals[i];

            let lhsRhsSeperatorIndex = findUngroupedChar(keyVal, ":");

            let lhs = keyVal.substring(0,lhsRhsSeperatorIndex).trim();
            let rhs = keyVal.substring(lhsRhsSeperatorIndex+1).trim();

            if(lhs) result[unQuote(lhs)] = parseExpression(rhs.trim());
        }
    }
    //Array
    else if (str.startsWith("[") && str.endsWith("]")) {
        let arrBody = str.substring(1,str.length - 1);
        let vals = groupAwareSplit(arrBody, ",");

        result = [];
        for(var i = 0; i < vals.length; i++) {
            result.push(parseExpression(vals[i]));
        }
    }
    //True/False
    else if(str == "true" || str == "false") {
        result = (str == "true");
    }
    //Function
    else if(str.startsWith("function")) {
        let functionExpression = str.substring("function".length).trim();

        let functionName = /^(\w+)/.exec(functionExpression);
        if(functionName) {
            functionName = functionName[1];
            
            functionExpression = functionExpression.substring(functionName.length).trim();   
        }

        let arguments = /\(([^)]*)\)/.exec(functionExpression)[1];

        let argList = arguments.split(",");

        for(var i = 0; i < argList.length; i++) argList[i] = argList[i].trim();

        let body = functionExpression.substring(arguments.length + 2).trim();
        body = body.substring(1,body.length-1);

        result = {
            __type: "function",
            displayName: functionName,
            arguments: argList,
            body: body
        };

        let safety = safetyCheckFunction(result);

        if(!safety.safe) throw "Safety check on function failed. " + safety.reason;
    }
    //Number
    else if(!isNaN(str)) {
        result = parseFloat(str);
    }
    //String
    else {
        return unQuote(str);
    }

    return result;
}

//TODO: write a proper safety checker (variable usage list, safe variables, etc.)
function safetyCheckFunction(func) {
    return {
        safe: false,
        reason: "At the moment, functions are not allowed due to vulnerabilities when running them."
    };
}

function unQuote(str) {
    if(str.startsWith("\"") && str.endsWith("\"")) {
        return str.substring(1,str.length-1);
    }
    
    if(str.startsWith("'") && str.endsWith("'")) {
        return str.substring(1,str.length-1);
    }

    return str;
}

function findUngroupedCharRegex(str, regex) {
    let inGroup = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for(var i = 0; i < str.length; i++) {
        if(str[i] == "\"" && str[i-1] != "\\" && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        if(str[i] == "'" && str[i-1] != "\\" && !inDoubleQuote) inSingleQuote = !inSingleQuote;

        let inQuote = inSingleQuote || inDoubleQuote;

        if((str[i] == "{" || str[i] == "[") && !inQuote) inGroup++;
        else if ((str[i] == "}" || str[i] == "]") && !inQuote) inGroup--;

        if(str[i].match(regex) && inGroup == 0 && inQuote == false) return i;
    }
    return -1;
}

function groupAwareSplit(str, split) {
    let words = [];

    split = split || " ";

    let prevSplitIndex = 0,
        nextSplitIndex = findUngroupedChar(str, split);
        

    while(nextSplitIndex != -1 && words.length < 1000) {
        words.push(str.substring(prevSplitIndex, nextSplitIndex));

        prevSplitIndex = nextSplitIndex+1;
        nextSplitIndex = findUngroupedChar(str.substring(prevSplitIndex), split);
        if(nextSplitIndex > -1) nextSplitIndex += prevSplitIndex;
    }

    words.push(str.substring(prevSplitIndex));

    return words;
}

function findUngroupedChar(str, char) {
    let inGroup = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for(var i = 0; i < str.length; i++) {
        if(str[i] == "\"" && str[i-1] != "\\" && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        if(str[i] == "'" && str[i-1] != "\\" && !inDoubleQuote) inSingleQuote = !inSingleQuote;

        let inQuote = inSingleQuote || inDoubleQuote;

        if((str[i] == "{" || str[i] == "[") && !inQuote) inGroup++;
        else if ((str[i] == "}" || str[i] == "]") && !inQuote) inGroup--;

        if(str[i] == char && inGroup == 0 && inQuote == false) return i;
    }
    return -1;
}

function hasUngroupedChar(str, char) {
    let inGroup = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for(var i = 0; i < str.length; i++) {
        if(str[i] == "\"" && str[i-1] != "\\" && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        if(str[i] == "'" && str[i-1] != "\\" && !inDoubleQuote) inSingleQuote = !inSingleQuote;

        let inQuote = inSingleQuote || inDoubleQuote;

        if((str[i] == "{" || str[i] == "[") && !inQuote) inGroup++;
        else if ((str[i] == "}" || str[i] == "]") && !inQuote) inGroup--;

        if(str[i] == char && inGroup == 0 && !inQuote) return true;
    }
    return false;
}