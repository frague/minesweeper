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
    this.status = $("result");

    this.id = function(x, y) {return x + ":" + y}

    this.update = function(status) {
        if (!status) status = this.moves + " moves made so far";
        this.status.text(status);
    }

    this.run = function() {
        // Generate field
        $("field").clear();
        for (var y = 0; y < this.size; y++)
            for (var x = 0, c, tr = $("field").append("tr", true); x < size; x++) {
                c = new cell(x, y, this);
                if (!x || x == this.size - 1) c.closed_around -= 3;
                if (!y || y == this.size - 1) c.closed_around -= 3;
                tr.append(c);
            }

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

        $("field").removeClass("exploded").removeClass("won");
        this.ended = false;
        this.moves = 0;
        this.update();
    }

    this.end = function(exploded_cell) {
        $("field").addClass("exploded");
        this.ended = true;
        this.cells.each(function(i) {i.redraw()})
        this.update("All Your Base Are Belong To Us!");
    }

    this.won = function() {
        $("field").addClass("won");
        this.ended = true;
        this.update("Congratulations!");
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
    this.flagged = false;

    this.bombs_around = 0;
    this.closed_around = 8;

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

        // Check if game is won
        var completed = true, c;
        for (k in this.cell.game.cells.data) {
            c = this.cell.game.cells.data[k];
            if (!c.has_bomb && !c.opened) {
                completed = false;
                break;
            }
        }
        if (completed) this.cell.game.won();
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
    else if (this.opened) state = this.closed_around && this.bombs_around ? "discovered a" + this.bombs_around: "opened";
    else if (this.flagged) state = "flag " + (this.discovered ? "opened" : "default");
    //else if (this.discovered) state = "discovered a" + this.bombs_around;
    this.element.className = "cell " + state;
}

cp.stepped = function(rec) {
    if (this.game.ended || this.opened) return false;
    if (this.has_bomb) return game.end(this);

    if (arguments.length == 0) {
        this.game.moves++;
        this.game.update();
    }

    this.opened = true;
    this.redraw();
    for (var x = -1; x < 2; x++)
        for (var y = -1; y < 2; y++) {
            if (!x && !y) continue;

            var c = this.game.cells.get(this.x + x, this.y + y);
            if (!c || c.opened || (c.has_bomb && rec !== false)) continue;
            c.closed_around--;
            if (rec === false) continue;

            if (c.bombs_around) {
                if (rec !== false) c.stepped(false);
            }
            else c.stepped(true);
        }
}


