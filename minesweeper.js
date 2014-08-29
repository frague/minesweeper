var mjq = function(input) {
    this.element = null;
    if (typeof input == "string") this.element = document.getElementById(input);
    else if (typeof input == "object" && input.nodeName) this.element = input;
    this.found = !!this.element;
    console.log(this.found);
    return this;

}, mp = mjq.prototype, $ = function(input) {return new mjq(input)};

mp.val = function() {
    if (this.found) {
        if (arguments.length) this.element.value = arguments[0];
        else return this.element.value;
    }
}

mp.disabled = function(state) {
    if (this.found) this.element.disabled = state ? "disabled" : "";
    return this;
}

mp.toggleClass = function(className) {
    if (this.found) {
        var c = this.element.className;
        if (c.indexOf(className) < 0) this.element.className += " " + className; 
        else this.element.className = c.replace(className, "");
    }
    return this;
} 

mp.clear = function() {
    if (this.found) this.element.innerHTML = "";
    return this;
}

mp.append = function(element, switch_to) {
    if (this.found) {
        if (typeof element == "string") element = document.createElement(element);
        this.element.appendChild(element);
        if (switch_to) this.element = element;
    }
    return this;
}
//------------------------------------------------------------------------------------

function validate(value) {
    var v = Math.round(value);
    $("btn_start").disabled(value != v || v < 3 || v > 20); 
    console.log(1);
}

function play() {
    $("welcome").toggleClass("hidden");
    $("playground").toggleClass("hidden");
    var game = new minesweeper(Math.round($("size").val()));
    game.run();
}

function minesweeper(size) {
    this.size = size;
    this.cells = {};

    this.id = function(x, y) {return x + ":" + y}

    this.run = function() {
        // Generate field
        $("field").clear();
        for (var y = 0; y < this.size; y++)
            for (var x = 0, tr = $("field").append("tr", true); x < size; x++) tr.append(new cell(x, y, this.cells));
    }
}

function cell(x, y, cells) {
    this.x = x;
    this.y = y;
    this.state = "default";
    this.cells = cells;
    this.id = x + ":" + y;
    this.element = document.createElement("td");
    this.element.id = this.id;
    this.element.cell = this;
    this.element.onclick = function() {
        this.cell.stepped();
    }
    this.element.oncontextmenu = function() {
        console.log(this.cell.x, this.cell.y);
        return false;
    }
    this.cells[this.id] = this;
    return this.element;
}

cell.prototype.stepped = function() {
    
}
