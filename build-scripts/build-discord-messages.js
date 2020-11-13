let parseJsExpression = require("./parse-js-expression.js");
let fakeDom = require("./fake-dom.js");

let MONTHS = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

module.exports = function(parsable, context) {
    if(parsable[0] != "[") throw `Error parsing Discord messages "${parsable.substring(0,200)} ${parsable.length>200?"...":""}"`;

    //compact notation-- "[1:00 PM]"
    if(/\[\d{1,2}:\d{1,2} [AP]M\] /.test(parsable)) {
        let messageTexts = parsable.split("\n[") //TODO: make a more robust parser

        let messagesRoot = fakeDom.createElement("ol");
        messagesRoot.setAttribute("class", "embedded-discord-msgs chatContent- chat-3 theme-dark");

        for(var i = 0; i < messageTexts.length; i++) {
            let li = buildMessageListItemFromText(messageTexts[i]);
            messagesRoot.appendChild(li);
        }
        
        return (context.discord > 0 ? "" : `<link rel="stylesheet" href="/versions/4/asset/discord-messages.css">`) +
            messagesRoot.__buildOuterHTML(true);
    } else {
        //parse and put in ascending time order not descending
        let messages = JSON.parse(parsable).reverse();

        let messagesRoot = fakeDom.createElement("ol");
        messagesRoot.setAttribute("class", "embedded-discord-msgs chatContent- chat-3 theme-dark group-spacing-0");

        for(var i = 0; i < messages.length; i++) {

            //add a seperator if they're on a different day
            if(i==0 || new Date(messages[i].timestamp).getDate() > new Date(messages[i-1].timestamp).getDate()) {
                messagesRoot.appendChild(buildDayDivider(messages[i].timestamp));
            }
            let li = buildMessageListItemFromJson(messages[i]);
            messagesRoot.appendChild(li);
        }
        
        return (context.discord > 0 ? "" : `<link rel="stylesheet" href="/versions/4/asset/discord-messages.css">`) + 
            messagesRoot.__buildOuterHTML(true);
    }
}

function buildDayDivider(timestamp) {
    let date = new Date(timestamp);

    let divider = fakeDom.createElement("li");
    divider.setAttribute("class", "divider hasContent-1");

    let dividerContent = fakeDom.createElement("span");
    dividerContent.setAttribute("class", "content-1");
    dividerContent.textContent = `${MONTHS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;

    divider.appendChild(dividerContent);

    return divider;
}
function buildMessageListItemFromJson(messageObj) {
    let postDate = new Date(messageObj.timestamp);
    let messageTime = `${(postDate.getHours()%13)+1}:${postDate.getMinutes()>9?"":"0"}${postDate.getMinutes()} ${postDate.getHours()<12?"A":"P"}M`;
    let messageAuthor = messageObj.author.username;

    let li = fakeDom.createElement("li");
    li.setAttribute("class", "message-2 cozyMessage-3 groupStart-23 wrapper-2 cozy-3 zalgo");
    let contentsWrapper = fakeDom.createElement("div");
    contentsWrapper.setAttribute("class", "contents");

    let avatar = fakeDom.createElement("img");
    avatar.setAttribute("loading", "lazy");
    avatar.setAttribute("alt", `${messageObj.author.username}'s avatar`);
    avatar.setAttribute("src",authorToAvatar(messageObj.author));
    avatar.setAttribute("class", "avatar-1 clickable-1");

    let msgHeader = buildMessageHeader(messageTime, messageAuthor);

    let content = buildMessageContents(parseMessageContent(messageObj));

    li.appendChild(contentsWrapper);
    contentsWrapper.appendChild(avatar);
    contentsWrapper.appendChild(msgHeader);
    contentsWrapper.appendChild(content);

    if(messageObj.attachments || messageObj.reactions || messageObj.embeds) li.appendChild(buildEmbedsContainer(messageObj));

    return li; 
}

function parseMessageContent(messageObj) {
    let messageContent = messageObj.content;

    let components = [];
    let lastComponentIndex = 0;

    //check if the type of message is normal, pin, etc
    switch(messageObj.type) {
        case 0:
            break;
        case 6:
            return [{
                type: "text",
                content: `${messageObj.author.username} pinned a message to this channel.`
            }]
    }
    //loop through for links & mentions
    for(var i = 0; i < messageContent.length; i++) {

        //links! get the next "word"
        let nextWordBreak = messageContent.substring(i+1).indexOf(" ");
        if(nextWordBreak == -1) nextWordBreak = messageContent.length;
        let nextWord = messageContent.substring(i, nextWordBreak);
        
        if(nextWord.match(/^https?:\/\//)) {
            //fill in text before here
            components.push({
                type: "text",
                content: messageContent.substring(lastComponentIndex, i)
            });
            
            components.push({
                type: "link",
                content: nextWord
            });
            i = nextWordBreak;
            lastComponentIndex = i;
        }
        //mentions: all mentions need at least 21 characters, so don't test for them if there's less than 21 chars left
        else if(i + 21 <= messageContent.length) {
            //username mentions
            if(/<@\d{18}>/.test(messageContent.substring(i, i + 21))) {
                //fill in text before here
                components.push({
                    type: "text",
                    content: messageContent.substring(lastComponentIndex, i)
                });

                let mentionText = messageContent.substring(i, i + 21);
                let userId = /<@(\d{18})>/.exec(mentionText)[1];
                let mention = messageObj.mentions.find(x => x.id == userId);

                components.push({
                    type: "userMention",
                    mention: mention
                });

                lastComponentIndex = i += 21;
            }
            //nickname mentions (which have a different syntax, how annoying)
            if(/<@!\d{18}>/.test(messageContent.substring(i, i + 22))) {
                //fill in text before here
                components.push({
                    type: "text",
                    content: messageContent.substring(lastComponentIndex, i)
                });

                let mentionText = messageContent.substring(i, i + 22);
                let userId = /<@!(\d{18})>/.exec(mentionText)[1];
                let mention = messageObj.mentions.find(x => x.id == userId);

                components.push({
                    type: "userMention",
                    mention: mention
                });

                lastComponentIndex = i += 22;
            }
            //channel mentions
            if(/<#\d{18}>/.test(messageContent.substring(i, i + 21))) {
                //fill in text before here
                components.push({
                    type: "text",
                    content: messageContent.substring(lastComponentIndex, i)
                });

                let mentionText = messageContent.substring(i, i + 22);
                let channelId = /<#(\d{18})>/.exec(mentionText)[1];

                components.push({
                    type: "channelMention",
                    mention: `deleted-channel ${channelId % 100}`
                });

                lastComponentIndex = i += 22;
            }
            //role mentions
            if(/<@&\d{18}>/.test(messageContent.substring(i, i + 22))) {
                //fill in text before here
                components.push({
                    type: "text",
                    content: messageContent.substring(lastComponentIndex, i)
                });

                let mentionText = messageContent.substring(i, i + 22);
                let roleId = /<@&(\d{18})>/.exec(mentionText)[1];
                let mention = messageObj.mention_roles.find(x => x.id == roleId) || {};

                components.push({
                    type: "roleMention",
                    mention: mention
                });

                lastComponentIndex = i += 22;
            }
        }
    }

    //ending text, which can't get camptured in the normal loop
    components.push({
        type: "text",
        content: messageContent.substring(lastComponentIndex)
    });

    return components;
}

function buildMessageContents(components) {
    let content = fakeDom.createElement("div");
    content.setAttribute("class", "markup messageContent");
    
    for(var i = 0; i < components.length; i++) {
        let component = components[i];
        let mention, link;
        switch(component.type) {
            case "text":
                content.appendChild(fakeDom.createTextNode(component.content));
            break;
            case "link":
                link = fakeDom.createElement("a");
                link.setAttribute("class", "anchor anchorUnderlineOnHover");
                link.setAttribute("title", component.content);
                link.setAttribute("href", component.content);
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noreferrer noopener");
                link.textContent = component.content;
                content.appendChild(link);
            break;
            case "userMention":
            case "roleMention":
                mention = fakeDom.createElement("span");
                mention.setAttribute("class", "mention mentionWrapper interactive");
                mention.textContent = `@${component.mention.username || component.mention.name || "Unknown Role"}`;
                content.appendChild(mention);
            break;
            case "channelMention":
                mention = fakeDom.createElement("span");
                mention.setAttribute("class", "mention mentionWrapper interactive");
                mention.textContent = `#${component.mention || "Unknown Channel"}`;
                content.appendChild(mention);
            break;
        }
    }

    return content;
}

function buildEmbedsContainer(messageObj) {
    let container = fakeDom.createElement("div");
    container.setAttribute("class", "container-1ov-mD");
    //first, images

    if(messageObj.attachments) {
        for(var i = 0; i < messageObj.attachments.length; i++) {
            let imageHeight = 300;
            let imageWidth = messageObj.attachments[i].width / messageObj.attachments[i].height * imageHeight;

            if(imageWidth > 400) {
                imageWidth = 400;
                imageHeight =  messageObj.attachments[i].height / messageObj.attachments[i].width * imageWidth
            }

            let imageWrapper = fakeDom.createElement("a");
            imageWrapper.setAttribute("class", "anchor anchorUnderlineOnHover imageWrapper imageZoom clickable embedWrapper");
            imageWrapper.style.setProperty("width", imageWidth + "px");
            imageWrapper.style.setProperty("height", imageHeight + "px");

            let image = fakeDom.createElement("img");
            image.setAttribute("loading", "lazy");
            image.setAttribute("alt", `Attachment ${messageObj.attachments[i].name}`);
            image.setAttribute("src", messageObj.attachments[i].proxy_url + "?height=" + Math.round(imageHeight) + "&width=" + Math.round(imageWidth));
            image.setAttribute("height", imageHeight);
            
            imageWrapper.appendChild(image);
            container.appendChild(imageWrapper);
        }
    }

    //next, external embeds
    if(messageObj.embeds) {
        for(var i = 0; i < messageObj.embeds.length; i++) {
            let embedObj = messageObj.embeds[i];
            
            let embedContainer = fakeDom.createElement("div");
            embedContainer.setAttribute("class", "embedWrapper embedFull embed markup");
            //set color of embed side to hex value
            if(embedObj.color) embedContainer.style.setProperty("borderLeftColor", "#" + embedObj.color.toString(16));

            let embedGrid = fakeDom.createElement("div");
            //only give hasThumbnail class if it actually does
            embedGrid.setAttribute("class", `grid ${embedObj.thumbnail ? "hasThumbnail" : ""}`);

            if(embedObj.provider) {
                let embedProvider = fakeDom.createElement("div");
                embedProvider.setAttribute("class", "embedProvider embedMargin");
                
                let providerSpan = fakeDom.createElement("span");
                providerSpan.textContent = embedObj.provider.name;

                embedProvider.appendChild(providerSpan);
                embedGrid.appendChild(embedProvider);
            }

            if(embedObj.title) {
                let embedTitle = fakeDom.createElement("div");
                embedTitle.setAttribute("class", "embedTitle embedMargin");
                
                let titleLink = fakeDom.createElement("a");
                titleLink.setAttribute("class", "anchor anchorUnderlineOnHover embedTitleLink embedLink embedTitle");
                titleLink.setAttribute("href", embedObj.url || "");
                titleLink.setAttribute("target", "_blank");
                titleLink.setAttribute("rel", "noreferrer noopener");
                titleLink.textContent = embedObj.title;

                embedTitle.appendChild(titleLink);
                embedGrid.appendChild(embedTitle);
            }

            if(embedObj.description) {
                let embedDesc = fakeDom.createElement("div");
                embedDesc.setAttribute("class", "embedDescription embedMargin");
                embedDesc.textContent = embedObj.description;
                embedGrid.appendChild(embedDesc);
            }

            if(embedObj.thumbnail) {
                let embedThumbLink = fakeDom.createElement("a");
                embedThumbLink.setAttribute("class", "anchor anchorUnderlineOnHover imageWrapper imageZoom clickable embedThumbnail");
                embedThumbLink.setAttribute("href", embedObj.thumbnail.url);
                embedThumbLink.setAttribute("target", "_blank");
                embedThumbLink.setAttribute("rel", "noreferrer noopener");

                let embedThumbnail = fakeDom.createElement("img");
                embedThumbnail.setAttribute("loading", "lazy");
                embedThumbnail.setAttribute("alt", `Website thumbnail`);
                embedThumbnail.setAttribute("href", embedObj.thumbnail.proxy_url + "?width=80&height=80");

                embedThumbLink.appendChild(embedThumbnail);
                embedGrid.appendChild(embedThumbLink);
            }
            embedContainer.appendChild(embedGrid);
            container.appendChild(embedContainer);
        }
    }
    //last, reactions

    if(messageObj.reactions) {
        let reactions = fakeDom.createElement("div");
        reactions.setAttribute("class", "reactions");

        for(var i = 0; i < messageObj.reactions.length; i++) {
            let reactionWrapperWrapper = fakeDom.createElement("div");
            let reactionWrapper = fakeDom.createElement("div");
            reactionWrapper.setAttribute("class", "reaction");
            
            let reactionAriaPopout = fakeDom.createElement("div");

            let reactionInner = fakeDom.createElement("div");
            reactionInner.setAttribute("class", "reactionInner focusable");
            
            let emojiText = messageObj.reactions[i].emoji.name;
            let emojiImageUrl = "";

            //load twemoji if it's a normal unicode emoji
            if(messageObj.reactions[i].emoji.id == null) {
                //if it's 2 characters or more, treat it as a utf-16 emoji and do Confusing Bitwise Math to convert it to a single codepoint
                let reactionEmojiCode = emojiText.length == 1 ? 
                        emojiText.charCodeAt(0).toString(16)
                        : (0x10000 + (((emojiText.charCodeAt(0) & 0x3ff)<<10) | (emojiText.charCodeAt(1) & 0x3ff))).toString(16);

                emojiImageUrl = `https://twemoji.maxcdn.com/v/13.0.0/svg/${reactionEmojiCode}.svg`;
            } else {
                //load the discord cdn if it's not unicode
                emojiImageUrl = `https://cdn.discordapp.com/emojis/${messageObj.reactions[i].emoji.id}.png`;
            }

            let reactionEmoji = fakeDom.createElement("img");
            reactionEmoji.setAttribute("class", "emoji");
            reactionEmoji.setAttribute("alt", "Emoji reaction " + emojiText);
            reactionEmoji.setAttribute("loading", "lazy");
            reactionEmoji.setAttribute("src", emojiImageUrl);

            let reactionCount = fakeDom.createElement("div");
            reactionCount.setAttribute("class", "reactionCount");
            reactionCount.textContent = messageObj.reactions[i].count;
            reactionCount.style.setProperty("minWidth", reactionCount.offsetWidth + "px");
            reactionCount.style.setProperty("marginRight", "0.125rem");

            reactionInner.appendChild(reactionEmoji);
            reactionInner.appendChild(reactionCount);

            reactionAriaPopout.appendChild(reactionInner);

            reactionWrapper.appendChild(reactionAriaPopout);
            reactionWrapperWrapper.appendChild(reactionWrapper);

            reactions.appendChild(reactionWrapperWrapper);
        }

        container.appendChild(reactions);
    }

    return container;
}

function buildMessageListItemFromText(messageText) {
    //first, parse the messege time
    let messageRegexRes = /(\d{1,2}:\d{1,2} [AP]M)\] ([^:]+): (.+)/.exec(messageText);
    let messageTime = messageRegexRes[1];
    let messageAuthor = messageRegexRes[2];
    let messageContent = messageRegexRes[3];

    let li = fakeDom.createElement("li");
    li.setAttribute("class", "message-2 cozyMessage-3 groupStart-23 wrapper-2 cozy-3 zalgo");
    let contentsWrapper = fakeDom.createElement("div");
    contentsWrapper.setAttribute("class", "contents-2mQqc9");

    let avatar = fakeDom.createElement("img");
    avatar.setAttribute("loading", "lazy");
    avatar.setAttribute("alt", `${messageAuthor}'s avatar`);
    avatar.setAttribute("src",authorToPlaceholderAvatar(messageAuthor));
    avatar.setAttribute("class", "avatar-1 clickable-1bVtEA");

    let msgHeader = buildMessageHeader(messageTime, messageAuthor);

    let content = fakeDom.createElement("div");
    content.setAttribute("class", "markup messageContent");
    content.textContent = messageContent;

    li.appendChild(contentsWrapper);
    contentsWrapper.appendChild(avatar);
    contentsWrapper.appendChild(msgHeader);
    contentsWrapper.appendChild(content);

    return li;
}

function buildMessageHeader(messageTime, messageAuthor) {
    let msgHeader = fakeDom.createElement("h5");
    msgHeader.setAttribute("class", "header-23");
    
    let timestamp = fakeDom.createElement("span");
    timestamp.setAttribute("class", "latin24CompactTimeStamp timestamp");
    
    let timestampAriaSpan = fakeDom.createElement("span");
    timestampAriaSpan.setAttribute("aria-label", messageTime);
    timestampAriaSpan.textContent = messageTime;
    timestamp.appendChild(timestampAriaSpan);

    let username = fakeDom.createElement("span");
    username.setAttribute("class", "username-1 clickable-1 focusable");
    username.textContent = messageAuthor;

    msgHeader.appendChild(username);
    msgHeader.appendChild(timestamp);

    return msgHeader;
}

function authorToAvatar(author) {
    if(author.avatar == "") {
        return `https://cdn.discordapp.com/embed/avatars/${parseInt(author.discriminator) % 5}.png?size=128`;
    } else if(/[0-9a-f]{32}/.test(author.avatar)) {
        return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`;
    } else {
        return author.avatar;
    }
}
function authorToPlaceholderAvatar(authorName) {
    let num = 0;
    for(var i = 0; i < 3; i++) {
        num = num ^ authorName.charCodeAt(i);
    }

    return `https://cdn.discordapp.com/embed/avatars/${num % 5}.png?size=128`;
}