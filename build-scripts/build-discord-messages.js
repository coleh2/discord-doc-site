let parseJsExpression = require("./parse-js-expression.js");
let fakeDom = require("./fake-dom.js");

let MONTHS = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

module.exports = function(parsable, context) {
    if(parsable[0] != "[") throw `Error parsing Discord messages "${parsable.substring(0,200)} ${parsable.length>200?"...":""}"`;

    //compact notation-- "[1:00 PM]"
    if(/\[\d{1,2}:\d{1,2} [AP]M\] /.test(parsable)) {
        let messageTexts = parsable.split("\n[") //TODO: make a more robust parser

        let messagesRoot = fakeDom.createElement("ol");
        messagesRoot.setAttribute("class", "embedded-discord-msgs chatContent-a9vAAp chat-3bRxxu theme-dark");

        for(var i = 0; i < messageTexts.length; i++) {
            let li = buildMessageListItemFromText(messageTexts[i]);
            messagesRoot.appendChild(li);
        }
        
        return (context.discord > 0 ? "" : `<link rel="stylesheet" href="/versions/4/asset/discordMessages.css">`) +
            messagesRoot.__buildOuterHTML(true);
    } else {
        //parse and put in ascending time order not descending
        let messages = JSON.parse(parsable).reverse();

        let messagesRoot = fakeDom.createElement("ol");
        messagesRoot.setAttribute("class", "embedded-discord-msgs chatContent-a9vAAp chat-3bRxxu theme-dark group-spacing-0");

        for(var i = 0; i < messages.length; i++) {

            //add a seperator if they're on a different day
            if(i==0 || new Date(messages[i].timestamp).getDate() > new Date(messages[i-1].timestamp).getDate()) {
                messagesRoot.appendChild(buildDayDivider(messages[i].timestamp));
            }
            let li = buildMessageListItemFromJson(messages[i]);
            messagesRoot.appendChild(li);
        }
        
        return (context.discord > 0 ? "" : `<link rel="stylesheet" href="/versions/4/asset/discordMessages.css">`) + 
            messagesRoot.__buildOuterHTML(true);
    }
}

function buildDayDivider(timestamp) {
    let date = new Date(timestamp);

    let divider = fakeDom.createElement("li");
    divider.setAttribute("class", "divider-JfaTT5 hasContent-1_DUdQ divider-JfaTT5 hasContent-1cNJDh");

    let dividerContent = fakeDom.createElement("span");
    dividerContent.setAttribute("class", "content-1o0f9g");
    dividerContent.textContent = `${MONTHS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;

    divider.appendChild(dividerContent);

    return divider;
}
function buildMessageListItemFromJson(messageObj) {
    let postDate = new Date(messageObj.timestamp);
    let messageTime = `${(postDate.getHours()%13)+1}:${postDate.getMinutes()>9?"":"0"}${postDate.getMinutes()} ${postDate.getHours()<12?"A":"P"}M`;
    let messageAuthor = messageObj.author.username;
    let messageContent = messageObj.content;

    let li = fakeDom.createElement("li");
    li.setAttribute("class", "message-2qnXI6 cozyMessage-3V1Y8y groupStart-23k01U wrapper-2a6GCs cozy-3raOZG zalgo-jN1Ica");
    let contentsWrapper = fakeDom.createElement("div");
    contentsWrapper.setAttribute("class", "contents-2mQqc9");

    let avatar = fakeDom.createElement("img");
    avatar.setAttribute("loading", "lazy");
    avatar.setAttribute("alt", `${messageObj.author.username}'s avatar`);
    avatar.setAttribute("src",authorToAvatar(messageObj.author));
    avatar.setAttribute("class", "avatar-1BDn8e clickable-1bVtEA");

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
    //loop through for links & mentions
    for(var i = 0; i < messageContent.length; i++) {

        //mentions: all mentions need at least 21 characters, so don't test for them if there's less than 21 chars left
        if(i + 21 <= messageContent.length) {
            //username mentions
            if(/<@\d{18}>/.test(messageContent.substring(i, i + 21))) {
                //fill in text before here
                components.push({
                    type: "text",
                    content: messageContent.substring(lastComponentIndex, i-1)
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
                    content: messageContent.substring(lastComponentIndex, i-1)
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
            if(/<@#\d{18}>/.test(messageContent.substring(i, i + 22))) {
                //fill in text before here
                components.push({
                    type: "text",
                    content: messageContent.substring(lastComponentIndex, i-1)
                });

                let mentionText = messageContent.substring(i, i + 22);
                let channelId = /<@#(\d{18})>/.exec(mentionText)[1];
                let mention = messageObj.mention_channels.find(x => x.id == channelId);

                components.push({
                    type: "channelMention",
                    mention: mention
                });

                lastComponentIndex = i += 22;
            }
            //role mentions
            if(/<@&\d{18}>/.test(messageContent.substring(i, i + 22))) {
                //fill in text before here
                components.push({
                    type: "text",
                    content: messageContent.substring(lastComponentIndex, i-1)
                });

                let mentionText = messageContent.substring(i, i + 22);
                let roleId = /<@&(\d{18})>/.exec(mentionText)[1];
                let mention = messageObj.mention_roles.find(x => x.id == roleId);

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
    content.setAttribute("class", "markup-2BOw-j messageContent-2qWWxC");
    
    for(var i = 0; i < components.length; i++) {
        let component = components[i];
        let mention;
        switch(component.type) {
            case "text":
                content.appendChild(fakeDom.createTextNode(component.content));
            break;
            case "userMention":
            case "roleMention":
                mention = fakeDom.createElement("span");
                mention.setAttribute("class", "mention wrapper-3WhCwL mention interactive");
                mention.textContent = `@${component.mention.username || component.mention.name || "Unknown Role"}`;
                content.appendChild(mention);
            break;
            case "channelMention":
                mention = fakeDom.createElement("span");
                mention.setAttribute("class", "mention wrapper-3WhCwL mention interactive");
                mention.textContent = `@${component.mention.username || component.mention.name || "Unknown Role"}`;
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

            let imageWrapper = fakeDom.createElement("a");
            imageWrapper.setAttribute("class", "anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB imageWrapper-2p5ogY imageZoom-1n-ADA clickable-3Ya1ho embedWrapper-lXpS3L");
            imageWrapper.style.setProperty("width", imageWidth + "px");
            imageWrapper.style.setProperty("height", imageHeight + "px");

            let image = fakeDom.createElement("img");
            image.setAttribute("loading", "lazy");
            image.setAttribute("alt", `Attachment ${messageObj.attachments[i].name}`);
            image.setAttribute("src", messageObj.attachments[i].proxy_url + "?height=300&width=" + Math.round(imageWidth));
            
            imageWrapper.appendChild(image);
            container.appendChild(imageWrapper);
        }
    }

    //next, external embeds
    if(messageObj.embeds) {
        for(var i = 0; i < messageObj.embeds.length; i++) {
            let embedObj = messageObj.embeds[i];
            
            let embedContainer = fakeDom.createElement("div");
            embedContainer.setAttribute("class", "embedWrapper-lXpS3L embedFull-2tM8-- embed-IeVjo6 markup-2BOw-j");
            //set color of embed side to hex value
            if(embedObj.color) embedContainer.style.setProperty("borderLeftColor", "#" + embedObj.color.toString(16));

            let embedGrid = fakeDom.createElement("div");
            //only give hasThumbnail class if it actually does
            embedGrid.setAttribute("class", `grid-1nZz7S ${embedObj.thumbnail ? "hasThumbnail-3FJf1w" : ""}`);

            if(embedObj.provider) {
                let embedProvider = fakeDom.createElement("div");
                embedProvider.setAttribute("class", "embedProvider-3k5pfl embedMargin-UO5XwE");
                
                let providerSpan = fakeDom.createElement("span");
                providerSpan.textContent = embedObj.provider.name;

                embedProvider.appendChild(providerSpan);
                embedGrid.appendChild(embedProvider);
            }

            if(embedObj.title) {
                let embedTitle = fakeDom.createElement("div");
                embedTitle.setAttribute("class", "embedTitle-3OXDkz embedMargin-UO5XwE");
                
                let titleLink = fakeDom.createElement("a");
                titleLink.setAttribute("class", "anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB embedTitleLink-1Zla9e embedLink-1G1K1D embedTitle-3OXDkz");
                titleLink.setAttribute("href", embedObj.url);
                titleLink.setAttribute("target", "_blank");
                titleLink.setAttribute("rel", "noreferrer noopener");
                titleLink.textContent = embedObj.title;

                embedTitle.appendChild(titleLink);
                embedGrid.appendChild(embedTitle);
            }

            if(embedObj.description) {
                let embedDesc = fakeDom.createElement("div");
                embedDesc.setAttribute("class", "embedDescription-1Cuq9a embedMargin-UO5XwE");
                embedDesc.textContent = embedObj.description;
                embedGrid.appendChild(embedDesc);
            }

            if(embedObj.thumbnail) {
                let embedThumbLink = fakeDom.createElement("a");
                embedThumbLink.setAttribute("class", "anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB imageWrapper-2p5ogY imageZoom-1n-ADA clickable-3Ya1ho embedThumbnail-2Y84-K");
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
        reactions.setAttribute("class", "reactions-12N0jA");

        for(var i = 0; i < messageObj.reactions.length; i++) {
            let reactionWrapperWrapper = fakeDom.createElement("div");
            let reactionWrapper = fakeDom.createElement("div");
            reactionWrapper.setAttribute("class", "reaction-1hd86g");
            
            let reactionAriaPopout = fakeDom.createElement("div");

            let reactionInner = fakeDom.createElement("div");
            reactionInner.setAttribute("class", "reactionInner-15NvIl focusable-1YV_-H");
            
            let emojiText = messageObj.reactions[i].emoji.name
            //if it's 2 characters or more, treat it as a utf-16 emoji and do Confusing Bitwise Math to convert it to a single codepoint
            let reactionEmojiCode = emojiText.length == 1 ? 
                    emojiText.charCodeAt(0).toString(16)
                    : (0x10000 + (((emojiText.charCodeAt(0) & 0x3ff)<<10) | (emojiText.charCodeAt(1) & 0x3ff))).toString(16);
            let reactionEmoji = fakeDom.createElement("img");
            reactionEmoji.setAttribute("class", "emoji");
            reactionEmoji.setAttribute("alt", "Emoji reaction " + emojiText);
            reactionEmoji.setAttribute("loading", "lazy");
            reactionEmoji.setAttribute("src", `https://twemoji.maxcdn.com/v/13.0.0/svg/${reactionEmojiCode}.svg`);

            let reactionCount = fakeDom.createElement("div");
            reactionCount.setAttribute("class", "reactionCount-2mvXRV");
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
    li.setAttribute("class", "message-2qnXI6 cozyMessage-3V1Y8y groupStart-23k01U wrapper-2a6GCs cozy-3raOZG zalgo-jN1Ica");
    let contentsWrapper = fakeDom.createElement("div");
    contentsWrapper.setAttribute("class", "contents-2mQqc9");

    let avatar = fakeDom.createElement("img");
    avatar.setAttribute("loading", "lazy");
    avatar.setAttribute("alt", `${messageAuthor}'s avatar`);
    avatar.setAttribute("src",authorToPlaceholderAvatar(messageAuthor));
    avatar.setAttribute("class", "avatar-1BDn8e clickable-1bVtEA");

    let msgHeader = buildMessageHeader(messageTime, messageAuthor);

    let content = fakeDom.createElement("div");
    content.setAttribute("class", "markup-2BOw-j messageContent-2qWWxC");
    content.textContent = messageContent;

    li.appendChild(contentsWrapper);
    contentsWrapper.appendChild(avatar);
    contentsWrapper.appendChild(msgHeader);
    contentsWrapper.appendChild(content);

    return li;
}

function buildMessageHeader(messageTime, messageAuthor) {
    let msgHeader = fakeDom.createElement("h5");
    msgHeader.setAttribute("class", "header-23xsNx");
    
    let timestamp = fakeDom.createElement("span");
    timestamp.setAttribute("class", "latin24CompactTimeStamp-2V7XIQ timestamp-3ZCmNB");
    
    let timestampAriaSpan = fakeDom.createElement("span");
    timestampAriaSpan.setAttribute("aria-label", messageTime);
    timestampAriaSpan.textContent = messageTime;
    timestamp.appendChild(timestampAriaSpan);

    let username = fakeDom.createElement("span");
    username.setAttribute("class", "username-1A8OIy clickable-1bVtEA focusable-1YV_-H");
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