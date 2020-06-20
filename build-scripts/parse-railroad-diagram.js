let generator = require("./railroad-svg-generator.js");
let parse5 = require("parse5");
let parse5DomAdapter = require("parse5/lib/tree-adapters/default");
let xmlserializer = require('xmlserializer');

var fs = require('fs');

module.exports = function(ebnf) {
    let rules = {};
    let statements = splitLinesAccountingForQuotes(ebnf);

    let html = "";

    for(var j = 0; j < statements.length; j++) {
        let statement = statements[j];

        if(statement.trim() == "") continue;
        if(statement.startsWith("#")) continue;

        let leftHandSide = statement.split("=")[0].trim();
        let rightHandSide = statement.split("=")[1].trim();

        let railroadSvg = generator.Diagram(...ruleToSequence(parseRhs(rightHandSide))).toString();

        html += `<figure id="fig-${idAnize(leftHandSide)}"><figcaption>${leftHandSide}:</figcaption>${railroadSvg}</figure>`;

        
    }

    return html;
}

function splitLinesAccountingForQuotes(string) {
    let lines = [];

    let lineBreakIndex = findUngroupedCharRegex(string, /[;\n]/);
    while(lineBreakIndex != -1) {
        lines.push(string.substring(0,lineBreakIndex));
        string = string.substring(lineBreakIndex+1);
        lineBreakIndex = findUngroupedCharRegex(string, /[;\n]/);
    }

    return lines;
}

function removeAllChildren(node) {
    while(node.childNodes[0]) {
        node.childNodes.splice(0,1);
    }
}

function findRailroadDiagrams(document, accumulator) {
    if(accumulator === undefined) accumulator = [];
    document.childNodes&&document.childNodes.forEach(node => {
        if(node.tagName == "pre" &&
           (node.attrs.find(x=>x.name == "class") || {value:""}).value.match(/( |^)railroad-diagram( |$)/)
           ) {
               accumulator.push(node);
           }
           accumulator.push(...findRailroadDiagrams(node));
    });
    return accumulator;
}

function findByClass(document, cssClass) {
    if(document.childNodes) {
        for(var i = 0; i < document.childNodes.length; i++) {
            if(!document.childNodes[i].attrs) continue;
            if((document.childNodes[i].attrs.find(x=>x.name == "class") || {value:""}).value.includes(cssClass)) {
                return document.childNodes[i]
            }

            let scanChildren = findByClass(document.childNodes[i], cssClass);

            if(scanChildren) return scanChildren;
        }
    }
}

function getTextContent(node, content) {
    if(content === undefined) content = "";
    node.childNodes&&node.childNodes.forEach(childNode => {
        if(childNode.nodeName == "#text") {
            content += childNode.value;
        } else {
            content += getTextContent(childNode);
        }
    });
    return content;
    }

function idAnize(str) {
    return str.replace(/\W/g,"-").toLowerCase();
}

function ruleToSequence(rule) {
    switch(rule.type) {
        case "alternation": 
            return [generator.Choice(0, ...rule.content.map(function(elem) {
                return ruleToSequence(elem)[0];
            }))];
        break;

        case "terminal":
            return [generator.Terminal(rule.content)];
        break;

        case "identifier":
            return [generator.NonTerminal(rule.content)];
        break;

        case "concatenation":
            return [generator.Sequence(...rule.content.map(function(elem) {
                return ruleToSequence(elem)[0];
            }))];
        break;

        case "optional":
            return [generator.Optional(ruleToSequence(rule.content)[0], "skip")];
        break;

        case "repetition":
            return [generator.OneOrMore(...ruleToSequence(rule.content))];
        break;

        case "alternation":
            return [generator.Choice(0, ...rule.content.map(function(elem) {
                return ruleToSequence(elem)[0];
            }))];
        break;

        case "comment":
            return [generator.Comment(rule.content)]

        case "grouping":
            return ruleToSequence(rule.content);

        default:
            throw rule;

    }
}

function parseRhs(rightHandSide) {
    if (hasUngroupedChar(rightHandSide,",")) {
        let indexOfFirstComma = findUngroupedChar(rightHandSide, ",");

        return {
            type: "concatenation",
            content: [
                parseRhs(rightHandSide.substring(0,indexOfFirstComma).trim()),
                parseRhs(rightHandSide.substring(indexOfFirstComma + 1).trim())
            ]
        };
    } else if (hasUngroupedChar(rightHandSide,"|")) {
        let indexOfFirstPipe = findUngroupedChar(rightHandSide, "|");

        return {
            type: "alternation",
            content: [
                parseRhs(rightHandSide.substring(0,indexOfFirstPipe).trim()),
                parseRhs(rightHandSide.substring(indexOfFirstPipe + 1).trim())
            ]
        };
    } else if(rightHandSide.startsWith("[") && rightHandSide.endsWith("]")) {
        let optionalInside = rightHandSide.substring(1, rightHandSide.length - 1);

        return {
            type: "optional",
            content: parseRhs(optionalInside.trim())
        };
    } else if(rightHandSide.startsWith("{") && rightHandSide.endsWith("}")) {
        let repInside = rightHandSide.substring(1, rightHandSide.length - 1);

        return {
            type: "repetition",
            content: parseRhs(repInside.trim())
        };
    } else if (rightHandSide.startsWith("(") && rightHandSide.endsWith(")")) {
        let groupInside = rightHandSide.substring(1, rightHandSide.length - 1);

        if(groupInside.startsWith("*") && groupInside.endsWith("*")) {
            let commentText = groupInside.substring(1, groupInside.length - 1);
            return {
                type: "comment",
                content: commentText
            };
        }

        return {
            type: "grouping",
            content: parseRhs(groupInside.trim())
        };
    }   else if (rightHandSide.startsWith("\"") && rightHandSide.endsWith("\"")) {
        return {
            type: "terminal",
            content: rightHandSide.substring(1, rightHandSide.length - 1).replace(/\\/g,"")
        };
    } else if (rightHandSide.startsWith("'") && rightHandSide.endsWith("'")) {
        return {
            type: "terminal",
            content: rightHandSide.substring(1, rightHandSide.length - 1).replace(/\\/g,"")
        };
    } else if((/^[\w ]+$/).test(rightHandSide.trim())) {
        return {
            type: "identifier",
            content: rightHandSide.trim()
        }
    } else {
        return {
            type: "error",
            content: rightHandSide
        };
    }
}

function findUngroupedCharRegex(str, regex) {
    let inGroup = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for(var i = 0; i < str.length; i++) {
        if(str[i] == "\"" && str[i-1] != "\\" && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        if(str[i] == "'" && str[i-1] != "\\" && !inDoubleQuote) inSingleQuote = !inSingleQuote;

        let inQuote = inSingleQuote || inDoubleQuote;

        if((str[i] == "{" || str[i] == "[" || str[i] == "(") && !inQuote) inGroup++;
        else if ((str[i] == "}" || str[i] == "]" || str[i] == ")") && !inQuote) inGroup--;

        if(str[i].match(regex) && inGroup == 0 && inQuote == false) return i;
    }
    return -1;
}

function findUngroupedChar(str, char) {
    let inGroup = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for(var i = 0; i < str.length; i++) {
        if(str[i] == "\"" && str[i-1] != "\\" && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        if(str[i] == "'" && str[i-1] != "\\" && !inDoubleQuote) inSingleQuote = !inSingleQuote;

        let inQuote = inSingleQuote || inDoubleQuote;

        if((str[i] == "{" || str[i] == "[" || str[i] == "(") && !inQuote) inGroup++;
        else if ((str[i] == "}" || str[i] == "]" || str[i] == ")") && !inQuote) inGroup--;

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

        if((str[i] == "{" || str[i] == "[" || str[i] == "(") && !inQuote) inGroup++;
        else if ((str[i] == "}" || str[i] == "]" || str[i] == ")") && !inQuote) inGroup--;

        if(str[i] == char && inGroup == 0 && !inQuote) return true;
    }
    return false;
}