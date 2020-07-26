window.addEventListener("load", function() {
let splash = document.getElementById("hero-splash");

let splashWidth = splash.offsetWidth;
let splashHeight = splash.offsetHeight;

let positioningExclusionCta = document.getElementById("hero-cta");
let ctaWidth = positioningExclusionCta.offsetWidth;
let ctaHeight = positioningExclusionCta.offsetHeight;

let messageExchanges = [
{
    user: [">namecolor blood orange", ">namecolor dark violet", ">namecolor orchid"],
    botId: "fossilbot",
    bot: "Your nametag color has been set!",
    effect: {
        target: "username",
        style: {
            "color": ["rgb(231, 56, 39)", "#46237A", "#F092DD"]
        }
    }
},
{
    user: [ ">namecolor #d6d4a0", ">namecolor #ffb30f", ">namecolor #849324", ">namecolor #ff3cc7", ">namecolor #214e34", ">namecolor #214e34", ">namecolor #fcff6c" ],
    botId: "fossilbot",
    bot: "Your nametag color has been set!",
    effect: {
        target: "username",
        style: {
            "color": ["#d6d4a0", "#FFB30F", "#849324", "#FF3CC7", "#214E34", "#214E34", "#FCFF6C"]
        }
    }
},
{
    user: ["@CS:GO Notifications anyone want to play?", "@Minecraft Notifications I finished the farm!!", "@Movie Night Notifications time for movie night-- join #voice-1!"],
    bot: ["comp if we get 3+", "2 stacks of melon blocks", "We're watching HPGOF"],
    effect: {
        botIsUser: true
    }
},
{
    user: [">notify cs:go", ">notify movie night", ">notify Valorant", ">notify minecraft"],
    botId: "fossilbot",
    bot: ["You've been added to the notification role for CS:GO", "You've been added to the notification role for Movie Night", "You've been added to the notification role for Valorant", "You've been added to the notification role for Minecraft"]
}
];

showExchange();

function showExchange() {
    let currentExchange = resolveRandExchange(messageExchanges[Math.floor(Math.random()*messageExchanges.length)]);

    let exchangeWrapperElem = document.createElement("div");
    exchangeWrapperElem.setAttribute("aria-hidden","true");
    exchangeWrapperElem.classList.add("chatContent-", "chat-3");

    splash.appendChild(exchangeWrapperElem);

    //randomly position the exchange-- can't be more than 75% so it doesn't overflow
    exchangeWrapperElem.style.transform = `translate(${Math.round(Math.random()*splashWidth*0.75)}px, ${Math.round(Math.random()*splashHeight*0.75)}px)`;

    let userMessage = makeMessage();

    exchangeWrapperElem.appendChild(userMessage.wrap);

    //hide message until avatar has loaded
    userMessage.wrap.hidden = true;
    userMessage.avatar.addEventListener("load", function() {
        userMessage.wrap.hidden = false;
        let index = 0;
        typewriter(50, userMessage.text, currentExchange.user, function() {
            let botResponse = makeMessage(currentExchange.botId);
            exchangeWrapperElem.appendChild(botResponse.wrap);

            //hide message until the avatar has loaded
            botResponse.wrap.hidden = true;
            botResponse.avatar.addEventListener("load", function() {
                botResponse.wrap.hidden = false;

                //if an effect is specified, apply it
                currentExchange.effect&&addEffect(currentExchange.effect, userMessage);


                //if it's a bot, send instantly. if a user, use typewriter effect

                //    short-circuit the evaluation to avoid errors when no effect is specified
                if(!currentExchange.effect||!currentExchange.effect.botIsUser) {
                    botResponse.text.textContent = currentExchange.bot;
                    startFadeOut();
                } else {
                    typewriter(50, botResponse.text, currentExchange.bot, startFadeOut);
                }

                function startFadeOut() {
                    console.log("fading");
                    //now that the writing is finished, start the fading
                    exchangeWrapperElem.classList.add("fading");
                    //show another exchange while it's fading
                    showExchange();
                    //after 5s, when it's faded out, remove it
                    setTimeout(function() {
                        splash.removeChild(exchangeWrapperElem);
                        
                    }, 5000);
                }

                
            });
        });
    
        
    
        
    
    });
}

function resolveRandExchange(messageExchange,idxOverride) {
    messageExchange = JSON.parse(JSON.stringify(messageExchange));
    let keys = Object.keys(messageExchange) 
    for(var i = 0; i < keys.length; i++) {
        let val = messageExchange[keys[i]];
        if(val.constructor == Array) {
            if(idxOverride === undefined) idxOverride = val.indexOf(randomFrom(val));
            messageExchange[keys[i]] = val[idxOverride];
        } else if(val.constructor == Object) {
            messageExchange[keys[i]] = resolveRandExchange(val, idxOverride);
        }
    }

    return messageExchange;
}

function typewriter(interval, elem, text, finish) {
    text=text||"";
    let i = 0,
    loop = setInterval(function() {
        if(i >= text.length) {
            clearInterval(loop);
            finish&&finish();
        } else {
            elem.textContent += text[i];
        }

        i++;
    }, interval);
}

function addEffect(effect, message) {
    let target = message[effect.target];
    if(effect.style) {
        let keys = Object.keys(effect.style);
        for(var i = 0; i < keys.length; i++) {
            target.style[keys[i]] = effect.style[keys[i]];
        }
    }
};

function makeMessage(botId) {
    let exchangeUserMsg = document.createElement("div"),
    exchangeUserContents = document.createElement("div"),
    exchangeUserHeader = makeMessageHeader(botId),
    exchangeUserAvatar = makeAvatar(exchangeUserHeader),
    exchangeUserMsgContent = makeMessageContent();

    exchangeUserMsg.classList.add("message-2", "cozyMessage-3", "groupStart-23", "wrapper-2", "cozy-3")

    exchangeUserMsg.appendChild(exchangeUserContents);
    exchangeUserContents.appendChild(exchangeUserAvatar);
    exchangeUserContents.appendChild(exchangeUserHeader);
    exchangeUserContents.appendChild(exchangeUserMsgContent);

    return {
        wrap: exchangeUserMsg,
        text: exchangeUserMsgContent,
        avatar: exchangeUserAvatar,
        username: exchangeUserHeader.firstElementChild
    }
}
function makeAvatar(header) {
    let username = header.firstElementChild.textContent;

    let avatar = document.createElement("img");
    avatar.classList.add("avatar-1");
    avatar.setAttribute("src", `/img/splash-user-avatar/${username.replace(/[^\w]+/g, "-").toLowerCase()}.svg`);

    return avatar;
}
function makeMessageContent() {
    let content = document.createElement("div");
    content.classList.add("messageContent");

    return content;
}

function makeMessageHeader(botId) {
    let usernames = ["Harry Potter", "abee", "Mr. Gorbachev", "ham", "rATs"];

    let header = document.createElement("h5");
    header.classList.add("header-23");

    let username = document.createElement("span");
    username.textContent = botId?botId:randomFrom(usernames);
    username.classList.add("username-1", "clickable-1", "focusable");

    header.appendChild(username);
    
    return header;
}

function randomFrom(array) {
    let randIndex = Math.random();
    if(randIndex == 1) randIndex = 0.99;

    return array[Math.floor(randIndex*array.length)];
}

});