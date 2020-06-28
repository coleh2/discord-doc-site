window.addEventListener("load", function() {
    let syntaxCheckers = document.getElementsByClassName("syntax-checker-widget");

    for(var i = 0; i < syntaxCheckers.length; i++) {
        let checker = syntaxCheckers[i];
        let checkerSubtype = checker.getAttribute("data-backref-type");

        let checkerHeader = document.createElement("h5");
        checkerHeader.textContent = "Syntax Explorer";
        checker.appendChild(checkerHeader);

        let messageList = document.createElement("ol");
        messageList.classList.add("syntax-widget-messages");
        
        for(var i = 0; i < sampleMessages.length; i++) {
            let messageListItem = document.createElement("li");
            let message = sampleMessages[i];

            messageListItem.setAttribute("data-message-author",message.author);
            messageListItem.innerText = `[${message.time}] ${message.author}: ${message.message}`;

            messageList.appendChild(messageListItem);
        }

        checker.appendChild(messageList);
        messageList.scrollTop = messageList.scrollHeight;

        let body = document.createElement("div");
        body.classList.add("widget-body");

        let explaination = this.document.createElement("output");

        let textbox = document.createElement("textarea");
        textbox.setAttribute("aria-label","syntax-check-textarea");
        textbox.placeholder = "Enter a backreference";
        textbox.addEventListener("input", function() {
            let backrefData = findBackreferences(textbox.value);
            console.log(backrefData);

            clearSelection(messageList);

            let messagesToHighlight = getMessageElemsFromBackref(messageList, backrefData[0]);

            for(var i = 0; i < messagesToHighlight.length; i++) {
                if(messagesToHighlight[i]) messagesToHighlight[i].classList.add("selected");
            }

            let firstSelected = messagesToHighlight[0];
            if(firstSelected) {
                if(messageList.scrollTop < firstSelected.offsetTop ||
                    messageList.scrollTop + messageList.clientHeight > firstSelected.offsetTop) {
                    messageList.scrollTop = firstSelected.offsetTop;
                }
            }
        
            explaination.innerText = explainBackref(backrefData[0], messagesToHighlight);
        });

        let resizeDragHandle = document.createElement("div");
        resizeDragHandle.classList.add("drag-handle");

        let dragging = false;
        let mouseOrigin, checkerBox;
        resizeDragHandle.addEventListener("mousedown", function(event) {
            dragging = true;
            mouseOrigin = event.clientX;
            checkerBox = checker.getBoundingClientRect();
        });

        checker.addEventListener("mousemove", function(event) {
            if(dragging) {
                event.preventDefault();
                event.stopPropagation();

                let mouseCenterOffset = (checkerBox.x + checkerBox.width / 2) - event.clientX;
                let mouseOffsetProportion = mouseCenterOffset / checkerBox.width * 2;
                

                textbox.style.maxWidth = clamp(50-50*mouseOffsetProportion, 1, 99) + "%";
                textbox.style.minWidth = textbox.style.maxWidth;
                explaination.style.maxWidth = clamp(50+50*mouseOffsetProportion, 1, 99) + "%";
                explaination.style.minWidth = explaination.style.maxWidth;

                resizeDragHandle.style.left = textbox.style.maxWidth;
                resizeDragHandle.style.right = explaination.style.maxWidth;
            }
        });

        explaination.addEventListener("mousemove", function(event) {
            if(dragging) event.preventDefault();
        });

        checker.addEventListener("mouseup", function() {
            dragging = false;
        });

        body.appendChild(textbox);
        body.appendChild(resizeDragHandle);
        body.appendChild(explaination);

        checker.appendChild(body);
        
    }
});

const backrefPatterns = {
    "caret-count": {
        valid: /(\s|$|^)(\^+)(\s|$|^)/,
        validRelativeIndexPosition: 2,
        recommended: /(\s|$|^)(\^{1,5})(\s|$|^)/,
    },
    "caret-quantity": {
        valid: /(\s|$|^)(\^(\d+))(\s|$|^)/,
        validRelativeIndexPosition: 3,
        recommended: /(\s|$|^)(\^\d|(1[0-2]))(\s|$|^)/ 
    },
    "basic": {
        valid: /(\s|$|^)\^((\^*)|(\d+))(\s|$|^)/
    },
    "quote": {
        valid: /(\s|$|^)\^"(.+)"(\s|$|^)/
    },
    "authorFilter": {
        valid: /(\s|$|^)\^(\w+)(\s|$|^)/
    },
    "subjectFilter": {
        valid: /(\s|$|^)\^re:(\w+)(\s|$|^)/
    }
}

function clearSelection(list) {
    let selected = list.childNodes;

    for(var i = 0; i < selected.length; i++) {
        selected[i].classList.remove("selected");
    }
}

function getMessageElemsFromBackref(list, backref) {
    if(backref.type == "basic") return [getMessageElemByRelativeIndex(list, backref.relativeIndex, backref.filters)];
    else if(backref.type == "quote") return [getMessageElemByQuote(list, backref.quote, backref.filters)];
    else if(backref.type == "range") return getMessageElemsFromRange(list,backref);
    else if(backref.type == "sequence") return getMessageElemsFromSequence(list,backref);
}

function getMessageElemsFromSequence(list,backref) {
    let result = [];
    for(var i = 0; i < backref.elements.length; i++) {
        let elementSelection = getMessageElemsFromBackref(list,backref.elements[i]);

        for(var j = 0; j < elementSelection.length; j++) result.push(elementSelection[j])
    }

    return result;
}

function getMessageElemsFromRange(list, backref) {
    let startElem = getMessageElemsFromBackref(list, backref.start)[0];
    let endElem = getMessageElemsFromBackref(list, backref.end)[0];

    console.log(startElem,endElem);
    
    let messageElemArray = Array.from(list.childNodes).reverse();

    let startIndex = messageElemArray.indexOf(startElem);
    let endIndex = messageElemArray.indexOf(endElem);

    console.log(startIndex,endIndex);

    let youngerIndex = Math.min(startIndex, endIndex);
    let olderIndex = Math.max(startIndex, endIndex);

    let result = [];
    for(var i = olderIndex; i >= youngerIndex; i--) {
        let clampedIndex = Math.max(Math.min(i,messageElemArray.length - 1),0)
        result.push(messageElemArray[clampedIndex]);
    }

    console.log(result);
    return result;
}

function getMessageElemByQuote(list, quote, filters) {
    let youngestNodes = Array.from(list.childNodes).reverse();
    for(var i = 0; i < youngestNodes.length; i++) {
        if(youngestNodes[i].textContent.includes(quote) && resolveFilters(filters, youngestNodes[i])) return youngestNodes[i];
    }
}

function getMessageElemByRelativeIndex(list, index, filters) {
    let youngestNodes = Array.from(list.childNodes).reverse();

    let clampedRelativeIndex = Math.min(Math.max(0, index),list.childNodes.length - 1);

    for(var i = 0, currentRelativeIndex = 0; i < youngestNodes.length; i++) {
        if(resolveFilters(filters, youngestNodes[i])) currentRelativeIndex++;
        if(currentRelativeIndex == clampedRelativeIndex && resolveFilters(filters, youngestNodes[i])) return youngestNodes[i];
    }
}

function resolveFilters(filters, elem) {
    for(var i = 0; i < filters.length; i++) {
        if(!resolveFilter(filters[i], elem)) return false;
    }
    return true;
}
function resolveFilter (filter, messageElem) {
    if(!filter) return true;
    if(filter.type == "author") return messageElem.getAttribute("data-message-author").includes(filter.value);
    else if(filter.type == "subject") return true;
}

function findBackreferences(message) {
    let words = quoteAwareSplit(message, " ", false);
    let results = [];

    for(var i = 0; i < words.length; i++) {
        if(words[i] == "") continue;

        

        if(words[i].startsWith("^")) results.push(parseBackreference(words[i]));
    }

    return results;
}

function parseBackreference(backref) {

    //test if it's a sequence-- if so, parse them seperately
    let sequenceSplit = quoteAwareSplit(backref, ",", false).filter(function (str) {return str;});
    if(sequenceSplit.length > 1) {
        return {
            type: "sequence",
            elements: sequenceSplit.map(function(sequenceElem) {
                return parseBackreference(sequenceElem);
            }),
            error: null
        };
    } 

    //same for a range

    let backrefRangeSplit = quoteAwareSplit(backref, "-",true).filter(function (str) {return str;});
    
    if(backrefRangeSplit.length == 2) {
        if(backrefRangeSplit[1].startsWith("-")) {
            //remove the hyphen
            backrefRangeSplit[1] = backrefRangeSplit[1].substring(1);

            //error handling: if there isn't a caret on the second item, prepend it
            if(!backrefRangeSplit[1].startsWith("^") && backrefRangeSplit[1]) backrefRangeSplit[1] = "^" + backrefRangeSplit[1];

            
            return {
                type: "range",
                start: parseBackreference(backrefRangeSplit[0]),
                end: parseBackreference(backrefRangeSplit[1]),
                error: null
            }
        }
    }

    //test for additional filters 
    let subBackrefs = quoteAwareSplit(backref, "^",true,true).filter(function (str) {return str;});

    let backrefFilters = [];
    if(subBackrefs.length > 1) {
                                           // - 1 to make sure we don't parse the base as a filter
        for(var i = 0; i < subBackrefs.length - 1; i++) {
            let parsed = parseBackreference(subBackrefs[i]);
            if(parsed.filters) backrefFilters.push(parsed.filters[0]);
        }

        backref = subBackrefs[subBackrefs.length - 1];
    }

    //if it's a basic backreference, then it can just go through this simple flow
    if(backrefPatterns.basic.valid.test(backref)) {
        let unBoilerplated = backrefPatterns.basic.valid.exec(backref)[2];
        let relativeIndex = unBoilerplated.length + 1;
        if(!isNaN(parseInt(unBoilerplated))) relativeIndex = parseInt(unBoilerplated);

        return {
            relativeIndex: relativeIndex,
            type: "basic",
            error: null,
            filters: backrefFilters
        };

        
    } else if(backrefPatterns.quote.valid.test(backref)) {
        let unBoilerplated = backrefPatterns.quote.valid.exec(backref)[2];

        return {
            error: null,
            type: "quote",
            quote: unBoilerplated,
            filters: backrefFilters
        };
    } else if (backrefPatterns.authorFilter.valid.test(backref)) {
        let unBoilerplated = backrefPatterns.authorFilter.valid.exec(backref)[2]; 

        return {
            type: "basic",
            relativeIndex: 1,
            error: null,
            filters: [
                {
                    type: "author",
                    value: unBoilerplated
                }
            ]
        }
    } else if (backrefPatterns.subjectFilter.valid.test(backref)) {
        let unBoilerplated = backrefPatterns.subjectFilter.valid.exec(backref)[2]; 

        return {
            type: "basic",
            relativeIndex: 1,
            error: null,
            filters: [
                {
                    type: "subject",
                    value: unBoilerplated
                }
            ]
        }
    }


    return {
        error: "no backref found"
    }
}

function quoteAwareSplit(str, split, includeBoundaries, dontSplitMultipleInARow) {
    let words = [];

    split = split || " ";

    let inQuote = false;
    let wordStartIndex = 0;
    for(var i = 0; i < str.length; i++) {
        if(str[i] == '"') inQuote = !inQuote;

        let inRow = dontSplitMultipleInARow && (str[i] == split && str[i-1] == split);

        if(!inQuote && !inRow && str[i] == split) {
            words.push(str.substring(wordStartIndex,i));
            wordStartIndex = i+(!includeBoundaries);
        }
    }

    words.push(str.substring(wordStartIndex));

    return words;
}

const sampleMessages = [
      {
        "time": "12:42 AM",
        "author": "jake",
        "message": "Do people REALLY just live 5 minutes from pizza places?"
      },
      {
        "time": "12:42 AM",
        "author": "pope france",
        "message": "i don't think you can, legally"
      },
      {
        "time": "12:43 AM",
        "author": "pope france",
        "message": "but i could live in a ramen shop"
      },
      {
        "time": "12:43 AM",
        "author": "pope france",
        "message": "right on the strip"
      },
      {
        "time": "12:43 AM",
        "author": "pope france",
        "message": "next door to my abode"
      },
      {
        "time": "12:43 AM",
        "author": "catnt",
        "message": "I've heard of ramen shops in a strip mall..."
      },
      {
        "time": "12:43 AM",
        "author": "catnt",
        "message": "like..."
      },
      {
        "time": "12:43 AM",
        "author": "catnt",
        "message": "at least in japan"
      },
      {
        "time": "12:43 AM",
        "author": "catnt",
        "message": "like kyoto"
      },
      {
        "time": "12:43 AM",
        "author": "jake",
        "message": "or brussels"
      },
      {
        "time": "12:43 AM",
        "author": "catnt",
        "message": "or something yeah"
      },
      {
        "time": "12:43 AM",
        "author": "catnt",
        "message": "not the US"
      },
      {
        "time": "12:43 AM",
        "author": "catnt",
        "message": "so..."
      },
      {
        "time": "12:44 AM",
        "author": "jake",
        "message": "But it was actually in a strip mall...."
      },
      {
        "time": "12:44 AM",
        "author": "pope france",
        "message": "i know that isnt accurate"
      },
      {
        "time": "12:44 AM",
        "author": "jake",
        "message": "I mean, i know it was in a strip mall...."
      },
      {
        "time": "12:44 AM",
        "author": "jake",
        "message": "I do know"
      },
      {
        "time": "12:44 AM",
        "author": "pope france",
        "message": "which means i could have shopped at those places.... or googled it"
      },
      {
        "time": "12:44 AM",
        "author": "pope france",
        "message": "and probably found it"
      },
      {
        "time": "12:45 AM",
        "author": "catnt",
        "message": "So like I don't think anyone is actually close by"
      },
      {
        "time": "12:45 AM",
        "author": "catnt",
        "message": "so I mean the next time I get a craving"
      },
      {
        "time": "12:45 AM",
        "author": "catnt",
        "message": "i'll get it"
      },
      {
        "time": "12:45 AM",
        "author": "pope france",
        "message": "ok"
      },
      {
        "time": "12:46 AM",
        "author": "pope france",
        "message": "but it's weird because i found a pizza coupon thing this past weekend"
      },
      {
        "time": "12:46 AM",
        "author": "catnt",
        "message": "I mean to be fair it's because i love pizza but still...."
      },
      {
        "time": "12:46 AM",
        "author": "pope france",
        "message": "but it was expired...."
      },
      {
        "time": "12:46 AM",
        "author": "catnt",
        "message": "I'm sorry"
      },
      {
        "time": "12:46 AM",
        "author": "pope france",
        "message": "and it got to the point that I would wake up at like 8:30 or 9 every night and just be like"
      },
      {
        "time": "12:47 AM",
        "author": "pope france",
        "message": "'OH GOD THERE'S A SANDWICH IN THE OVEN'"
      },
      {
        "time": "12:47 AM",
        "author": "catnt",
        "message": "i would never even see it"
      },
      {
        "time": "12:47 AM",
        "author": "jake",
        "message": "But my dad and I tried to order pizza from Dominos during this summer so I think we have some coupons if you want one"
      }
]

function explainBackref(backref, messagesToHighlight) {

    

    let nonexistant = ""
    if(!messagesToHighlight[0]) nonexistant = " There is no message in the example message database that matches this backreference."

    let baseExplain = "";
    if(backref.type == "basic") baseExplain = `This backreference refers to ${explainSingularBackref(relativeIndex)}`;
    else if(backref.type == "range") baseExplain = `This backreference refers all messages from ${explainSingularBackref(backref.start)} to ${explainSingularBackref(backref.start)}`

    let summary = `${baseExplain}${filterSummary}.${nonexistant}`;

    return summary;
}

function explainSingularBackref(backref) {
    let filterSummary = explainFilters(backref.filters);

    if(backref.type == "basic") return `the ${superlative(backref.start.relativeIndex)} youngest message${filterSummary}`;
    else if (backref.type == "quote") return `the youngest message that says ${backref.quote}${filterSummary}`
}

function explainFilters(filters) {
    
    filterSummary = "";
    for(var i = 0; i < backref.filters.length; i++) {
        if(i == 0) filterSummary = " with";

        let listAnd = "";
        if(backref.filters.length > 1) listAnd = ","
        if(i == backref.filters.length - 1 && i > 1) listAnd = ", and";

        let subjectivityDisclaimer = ""
        if(filters.type == "subject") subjectivityDisclaimer += " (Note: Since this filter is subjective and cannot be detected by a computer, it is ignored here) "

        filterSummary += ` ${aOrAn(filters.type)} of "${filters.value}"${subjectivityDisclaimer}${listAnd}`;
        
    }

    return filterSummary;
}

function aOrAn(string) {
    let vowels = ["a","e","i","o","u"]
    if(vowels.includes(string[0])) return "an " + string;
    else return "a " + string;
}

function superlative(num) {
    if(num == 1) return "";
    else return `${formatNumberth(num)} `;
}

function formatNumberth(num) {
    //special case for 12, 13, etc
    if(num > 10 && num < 20) return num + "th"

    let lastDigit = num % 10;
    if(lastDigit == 1) return num + "st";
    else if (lastDigit == 2) return num + "nd";
    else if (lastDigit == 3) return num + "rd";
    else return num + "th";
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}