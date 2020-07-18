let parseJsExpression = require("./parse-js-expression.js");
let fakeDom = require("./fake-dom.js");

module.exports = function(parsable) {
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
        
        return `<link rel="stylesheet" href="/versions/4/asset/discordMessages.css">
        ${messagesRoot.__buildOuterHTML(true)}`;
    } else {
        let messages = JSON.parse(parsable);

        let messagesRoot = fakeDom.createElement("ol");
        messagesRoot.setAttribute("class", "embedded-discord-msgs chatContent-a9vAAp chat-3bRxxu theme-dark");

        for(var i = 0; i < messages.length; i++) {
            let li = buildMessageListItemFromJson(messages[i]);
            messagesRoot.appendChild(li);
        }
        
        return `<link rel="stylesheet" href="/versions/4/asset/discordMessages.css">
        ${messagesRoot.__buildOuterHTML(true)}`;
    }
}

function buildMessageListItemFromJson(messageObj) {
    let postDate = new Date(messageObj.timestamp);
    let messageTime = `${(postDate.getHours()%13)+1}:${postDate.getMinutes()} ${postDate.getHours()<12?"A":"M"}M`;
    let messageAuthor = messageObj.author.username;
    let messageContent = messageObj.content;

    let li = fakeDom.createElement("li");
    li.setAttribute("class", "message-2qnXI6 cozyMessage-3V1Y8y groupStart-23k01U wrapper-2a6GCs cozy-3raOZG zalgo-jN1Ica");
    let contentsWrapper = fakeDom.createElement("div");
    contentsWrapper.setAttribute("class", "contents-2mQqc9");

    let avatar = fakeDom.createElement("img");
    avatar.setAttribute("src",authorToAvatar(messageObj.author));
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
    if(/[0-9a-f]{32}/.test(author.avatar)) {
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