var game;

function validate(value) {
    var v = Math.round(value);
    $("btn_start").disabled(value != v || v < 3 || v > 20); 
}

function play() {
    $("welcome").addClass("hidden");
    $("playground").removeClass("hidden");
    game = new minesweeper(Math.round($("size").val()));
    game.run();
}

function minesweeper(size) {
    this.size = size;
    this.cells = new cells();
    this.ended = false;

    this.id = function(x, y) {return x + ":" + y}

    this.run = function() {
        // Generate field
        $("field").clear();
        for (var y = 0; y < this.size; y++)
            for (var x = 0, tr = $("field").append("tr", true); x < size; x++) tr.append(new cell(x, y, this));

        // Set the bombs
        for (var i = 0, a = x * y / 7; i < a; i++) {
            var c = this.cells.get(Math.round(size * Math.random()), Math.round(size * Math.random()));
            if (!c || c.has_bomb) {
                i--;
                continue;
            }

            c.has_bomb = true;
            for (var x = -1; x < 2; x++)
                for (var y = -1; y < 2; y++) {
                    var c1 = this.cells.get(c.x + x, c.y + y);
                    if (!c1) continue;
                    c1.bombs_around++;
                }
        }

        $("field").removeClass("exploded");
        this.ended = false;
    }

    this.end = function(exploded_cell) {
        $("field").addClass("exploded");
        this.ended = true;
        this.cells.each(function(i) {i.redraw()})
    }
}

function cells() {
    this.data = {};

    this.get = function(x, y) {
        var i = this.data[x + ":" + y];
        if (i) return i;
        else return null;
    }

    this.put = function(c) {
        this.data[c.x + ":" + c.y] = c;
    }

    this.each = function(f) {
        for (k in this.data) f(this.data[k]);
    }
}


function cell(x, y, game) {
    this.x = x;
    this.y = y;
    this.id = x + ":" + y;
    this.game = game;

    this.has_bomb = false;
    this.opened = false;
    this.discovered = false;
    this.flagged = false;

    this.bombs_around = 0;
    this.element = document.createElement("td");
    this.element.id = this.id;
    this.element.cell = this;
    this.element.onclick = function() {
        this.cell.stepped();
    }
    this.element.oncontextmenu = function() {
        if (this.cell.opened || this.cell.game.ended) return false;
        this.cell.flagged = !this.cell.flagged;
        this.cell.redraw();
        return false;
    }
    this.game.cells.put(this);
    this.redraw();
    return this.element;
}

var cp = cell.prototype;

cp.redraw = function() {
    state = "default";
    if (this.game.ended && this.has_bomb) state = "bomb";
    else if (this.opened) state = "opened";
    else if (this.flagged) state = "flag " + (this.discovered ? "opened" : "default");
    else if (this.discovered) state = "discovered a" + this.bombs_around;
    this.element.className = "cell " + state;
}

cp.stepped = function() {
    if (this.game.ended) return false;
    if (this.has_bomb) return game.end(this);
    this.opened = true;
    this.redraw();
    for (var x = -1; x < 2; x++)
        for (var y = -1; y < 2; y++) {
            if (!x && !y) continue;
            var c = this.game.cells.get(this.x + x, this.y + y);
            if (!c || c.opened || c.discovered) continue;
            if (c.bombs_around) {
                c.discovered = true;
                c.redraw();
            } else c.stepped();
        }
}


