var mjq = function(input) {
    this.element = document.createElement("x");
    if (typeof input == "string") this.element = document.getElementById(input);
    else if (input.nodeName) this.element = input;
    return this;

}, mp = mjq.prototype, $ = function(input) {return new mjq(input)};

mp.val = function() {
    if (arguments.length) this.element.value = arguments[0];
    else return this.element.value;
}

mp.disabled = function(state) {
    this.element.disabled = state ? "disabled" : "";
    return this;
}

mp.addClass = function(className) {
    var c = this.element.className;
    if (c.indexOf(className) < 0) this.element.className += " " + className; 
    return this;
} 

mp.removeClass = function(className) {
    var c = this.element.className;
    if (c.indexOf(className) >= 0) this.element.className = c.replace(className, "");
    return this;
} 

mp.toggleClass = function(className) {
    var c = this.element.className;
    if (c.indexOf(className) < 0) return this.addClass(className); 
    else return this.removeClass(className);
} 

mp.clear = function() {
    this.element.innerHTML = "";
    return this;
}

mp.append = function(element, switch_to) {
    if (typeof element == "string") element = document.createElement(element);
    this.element.appendChild(element);
    if (switch_to) this.element = element;
    return this;
}

mp.text = function(text) {
    this.element.innerText = text;
    return this;
}
