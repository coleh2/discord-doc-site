module.exports = {
    createTextNode(content) {
        var el = createElement("#text");
        el.value = content;
        return el;
    },
    createElement: function (tag) {
        return {
            appendChild: function (child) {
                this.childNodes.push(child);
                child.parentNode = this;

                return child;
            },
            insertBefore: function (newChild, reference) {
                let index = this.childNodes.indexOf(reference);
                if(index == -1) index = this.childNodes.length;

                this.childNodes.splice(index, 0, newChild);
                newChild.parentNode = this;

                return newChild;
            },
            removeChild: function (child) {
                this.childNodes.splice(this.childNodes.indexOf(child), 1);
                child.parentNode = null;

                return child;
            },
            get offsetWidth() {
                return 10 * Math.max(arrayMax(this.textContent.split("\n")).length,
                                     (this.attributes.text || "").length);
            },
            get offsetHeight() {
                return this.textContent.split("\n").length*20;
            },
            get offsetTop() {
                return this.attributes.y || this.attributes.top || 0
            },
            get offsetLeft() {
                return this.attributes.x || this.attributes.left || 0;
            },
            _innerHTML: "",
            nodeName: tag,
            getBoundingClientRect: function () {
                return {
                    top: 0,
                    left: 0,
                    width: this.offsetWidth,
                    height: this.offsetHeight,
                    x: 0,
                    y: 0
                };
            },
            cloneNode: function() {
                let copy = H.merge({}, this);
                copy.parentNode = null;
                return copy;
            },
            setAttribute: function (attr, val) {
                if (val.toString() == "NaN") throw problem;
                this.attributes[attr] = val;
            },
            setAttributeNS: function(ns, attr, val) {
                this.setAttribute(attr, val);
            },
            get textContent() {
                if (this.nodeName == "#text") return this.value;

                return this.childNodes.map(node => {
                    return node.textContent;
                }).join("");
            },
            set textContent(val) {
                this.childNodes = [
                    createTextNode(val)
                ];
            },
            get innerHTML() {
                return this.__buildInnerHTML(true);
            },
            set innerHTML(val) {
                this.childNodes = [];
            },
            __buildInnerHTML: function(includeStyles) {
                if (this.nodeName == "#text") return encodeCharacterEntities(this.value || "");
                let attrs = Object.keys(this.attributes).map(attribute => {
                    return `${attribute}="${this.attributes[attribute]}"`
                });
                
                if(includeStyles) {
                    let styles = Object.keys(this.style).map(style => {
                        if(["setProperty","getComputed","getPropertyValue"].includes(style)) return "";
                        return `${camelToKebab(style)}: ${encodeCharacterEntities(this.style[style].toString())};`;
                    });

                    attrs.push(`style="${styles.join("")}"`);
                }

                return "<"+this.nodeName +" "+attrs.join(" ") + ">" + 
                        this.childNodes.map(node => node.__buildInnerHTML(includeStyles)).join("") + 
                        "</" + this.nodeName + ">";
            },
            getElementsByTagName: function (tagName) {
                let children = this.childNodes.filter(node => {
                    return node.nodeName == tagName;
                });

                this.childNodes.forEach(node => {
                    children = children.concat(node.getElementsByTagName(tagName));
                });

                return children;
            },
            getAttribute: function (attr) {
                return this.attributes[attr];
            },
            removeAttribute: function (attr) {
                delete this.attributes[attr];
            },
            attributes: {},
            childNodes: [],
            parentNode: null,
            style: {
                setProperty: function (prop, val, attr) {
                    this[prop] = val + (attr && " !" + attr);
                },
                getComputed: function () {
                    return this;
                },
                getPropertyValue: function (prop) {
                    return this[prop];
                }
            }
        };
    }
};

function camelToKebab(str) {
    let words = [];

    let wordStartIndex = 0;
    for (var i = 0; i < str.length; i++) {
        if (str[i].toUpperCase() == str[i]) {
            words.push(str.substring(wordStartIndex, i).toLowerCase());
            wordStartIndex = i;
        }
    }
    words.push(str.substring(wordStartIndex).toLowerCase())

    return words.join("-");
}

function encodeCharacterEntities(str) {
    return str.replace(/&/g,"&amp;")
              .replace(/"/g,"&quot;")
              .replace(/'/g,"&apos;")
              .replace(/</g,"&lt;")
              .replace(/>/g,"&gt;");
}

function arrayMax(arr) {
    let max = arr[0];
    let i = arr.length;
    while (i--) {
        if (arr[i] > max) max = arr[i]
    };

    return max;
}