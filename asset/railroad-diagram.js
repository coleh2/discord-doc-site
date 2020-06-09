window.addEventListener("load", function() {
    let diagrams = document.querySelectorAll("pre.railroad-diagram");

    if(diagrams.length > 0) {
        let svgMakerScript = document.createElement("script");
        svgMakerScript.src = "../../asset/railroad-diagram-generator.js";
        document.head.appendChild(svgMakerScript); 

        let svgStyles = document.createElement("link");
        svgStyles.href = "../../asset/railroad-diagrams.css";
        svgStyles.rel = "stylesheet";
        document.head.appendChild(svgStyles); 


        window.rules = {};

        for(var i = 0; i < diagrams.length; i++) {
            let diagram = diagrams[i];

            let statements = diagram.innerText.split(/[;\n]/);

            for(var j = 0; j < statements.length; j++) {
                let statement = statements[j];

                if(statement == "") continue;

                let leftHandSide = statement.split("=")[0].trim();
                let rightHandSide = statement.split("=")[1].trim();

                if(leftHandSide.startsWith("#")) continue;

                rules[leftHandSide] = parseRhs(rightHandSide);
            }
        }

        svgMakerScript.addEventListener("load", function() {
            for(var i = 0; i < diagrams.length; i++) {
                let diagram = diagrams[i];

                let statements = diagram.innerText.split(/[;\n]/);

                //load rules stated in this diagram to the ruleNames array
                let ruleNames = [];
                for(var j = 0; j < statements.length; j++) {
                    if(statements[j] == "") continue;
                    if(!statements[j].startsWith("#")) ruleNames.push(statements[j].split("=")[0].trim());
                }

                //find the target element
                let targetElement = diagram;
                if(diagram.parentElement.tagName == "PRE") targetElement = diagram.parentElement;

                //clean the target element of the EBNF
                targetElement.innerHTML = "";

                for(var k = 0; k < ruleNames.length; k++) {                    
                    let ruleName = ruleNames[k];

                    let diagramHeader = document.createElement("h5");
                    diagramHeader.textContent = ruleName + ":";
                    diagramHeader.id = `railroad-diagram-${idAnize(ruleName)}`;
                    targetElement.appendChild(diagramHeader);

                    targetElement.appendChild(Diagram(...ruleToSequence(rules[ruleName])).toSVG());
                }
            }
        });
    }
});

function idAnize(str) {
    return str.replace(/\W/g,"-").toLowerCase();
}

function ruleToSequence(rule) {
    switch(rule.type) {
        case "alternation": 
            return [Choice(0, ...rule.content.map(function(elem) {
                return ruleToSequence(elem)[0];
            }))];
        break;

        case "terminal":
            return [Terminal(rule.content)];
        break;

        case "identifier":
            return [NonTerminal(rule.content)];
        break;

        case "concatenation":
            return [Sequence(...rule.content.map(function(elem) {
                return ruleToSequence(elem)[0];
            }))];
        break;

        case "optional":
            return [Optional(ruleToSequence(rule.content)[0], "skip")];
        break;

        case "repetition":
            return [OneOrMore(...ruleToSequence(rule.content))];
        break;

        case "alternation":
            return [Choice(0, ...rule.content.map(function(elem) {
                return ruleToSequence(elem)[0];
            }))];
        break;

        case "comment":
            return [Comment(rule.content)]

        case "grouping":
            return ruleToSequence(rule.content);

        default:
            console.log("error in rule translation for rule: ", rule);

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

function findUngroupedChar(str, char) {
    let inGroup = 0;
    let inQuote = false;
    for(var i = 0; i < str.length; i++) {
        if(str[i] == "\"" && str[i-1] != "\\") inQuote = !inQuote

        if(str[i] == "{" || str[i] == "[" || str[i] == "(") inGroup++;
        else if (str[i] == "}" || str[i] == "]" || str[i] == ")") inGroup--;

        if(str[i] == char && inGroup == 0 && inQuote == false) return i;
    }
    return -1;
}

function hasUngroupedChar(str, char) {
    let inGroup = 0;
    let inQuote = false;
    for(var i = 0; i < str.length; i++) {
        if(str[i] == "\"" && str[i-1] != "\\") inQuote = !inQuote

        if(str[i] == "{" || str[i] == "[" || str[i] == "(") inGroup++;
        else if (str[i] == "}" || str[i] == "]" || str[i] == ")") inGroup--;

        if(str[i] == char && inGroup == 0 && inQuote == false) return true;
    }
    return false;
}