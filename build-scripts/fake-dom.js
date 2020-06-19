module.exports = {
    createElement: function (tag) {
        return {
            clientWidth: 100,
            clientHeight: 100,
            appendChild: function (child) {
                this.childNodes.push(child);
                child.parentNode = this;
            },
            insertBefore: function (newChild, reference) {
                this.childNodes.splice(this.childNodes.indexOf(reference), 0, newChild);
            },
            removeChild: function (child) {
                this.childNodes.splice(this.childNodes.indexOf(child), 1);
            },
            get clientWidth() {
                throw problem;
            },
            get scrollWidth() {
                throw problem;
            },
            get offsetWidth() {
                return 14 * arrayMax(this.textContent.split("\n")).length;
                throw problem;
            },
            get offsetHeight() {
                return 10;
                throw problem;
            },
            get offsetTop() {
                return 0;
                throw problem;
            },
            get offsetLeft() {
                return 0;
                throw problem;
            },
            innerHTML: "",
            nodeName: tag,
            getBoundingClientRect: function() {
                return {
                    top: 0,
                    left: 0,
                    width: this.offsetWidth,
                    height: 100,
                    x: 0,
                    y: 0
                };
            },
            setAttribute: function (attr, val) {
                if(val.toString() == "NaN") throw problem;
                this.attributes[attr] = val;
            },
            get textContent() {
                if (this.nodeName == "#text") return this.value;

                return this.childNodes.map(node => {
                    node.textContent;
                }).join("");
            },
            get innerHTML() {
                if (this.nodeName == "#text") return this.value;
                let attrs = Object.keys(this.attributes).map(attribute => {
                    return `${attribute}="${this.attributes[attribute]}"`
                });
                let styles = Object.keys(this.style).map(style => {
                    return `${camelToKebab(style)}: ${this.style[style]}`
                });
                return `<${this.nodeName} ${attrs.join(" ")}>${this.childNodes.map(node => node.innerHTML).join("")}</${this.nodeName}>`;
            },
            set innerHTML(val) {
                this.childNodes = [];
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
                    this[prop] = val + (attr&&" !" + attr);
                },
                getComputed: function() {
                    return this;
                },
                getPropertyValue: function(prop) {
                    return this[prop];
                }
            }
        };
    }
};

function camelToKebab(str) {
    let words = [];

    let wordStartIndex = 0;
    for(var i =0; i < str.length; i++) {
        if(str[i].toUpperCase() == str[i]) {
            words.push(str.substring(wordStartIndex, i).toLowerCase());
            wordStartIndex = i+1;
        }
    }

    return words.join("-");
}

function arrayMax(arr) {
    let max = arr[0];
    let i = arr.length;
    while(i--) {
        if(arr[i] > max) max = arr[i]
    };

    return max;
}