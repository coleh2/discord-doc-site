let generator = require(__dirname + "/railroad-svg-generator.js");
let parserTools = require(__dirname + "/parser-tools.js");

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

    let lineBreakIndex = parserTools.findUngroupedCharRegex(string, /[;\n]/);
    while(lineBreakIndex != -1) {
        lines.push(string.substring(0,lineBreakIndex));
        string = string.substring(lineBreakIndex+1);
        lineBreakIndex = parserTools.findUngroupedCharRegex(string, /[;\n]/);
    }

    return lines;
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
    if (parserTools.hasUngroupedChar(rightHandSide,",")) {
        let indexOfFirstComma = parserTools.findUngroupedSubstring(rightHandSide, ",");

        return {
            type: "concatenation",
            content: [
                parseRhs(rightHandSide.substring(0,indexOfFirstComma).trim()),
                parseRhs(rightHandSide.substring(indexOfFirstComma + 1).trim())
            ]
        };
    } else if (parserTools.hasUngroupedChar(rightHandSide,"|")) {
        let indexOfFirstPipe = parserTools.findUngroupedSubstring(rightHandSide, "|");

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