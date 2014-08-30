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
    this.cells = {};
    this.ended = false;

    this.id = function(x, y) {return x + ":" + y}

    this.run = function() {
        // Generate field
        $("field").clear();
        for (var y = 0; y < this.size; y++)
            for (var x = 0, tr = $("field").append("tr", true); x < size; x++) tr.append(new cell(x, y, this));

        // Set the bombs
        for (var i = 0, a = x * y / 3; i < a; i++) {
            var id = Math.round(size * Math.random()) + ":" + Math.round(size * Math.random()), c = this.cells[id];
            console.log(id, c);
            if (!c || c.has_bomb) {
                i--;
                continue;
            }
            c.has_bomb = true;
            //c.setState("bomb");
            this.ended = false;
            $("field").removeClass("exploded");
        }
    }

    this.end = function(exploded_cell) {
        exploded_cell.setState("bomb");
        $("field").addClass("exploded");
        this.ended = true;
    }
}

function cell(x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.has_bomb = false;
    this.id = x + ":" + y;
    this.element = document.createElement("td");
    this.element.id = this.id;
    this.element.cell = this;
    this.element.onclick = function() {
        this.cell.stepped();
    }
    this.element.oncontextmenu = function() {
        var s = this.cell.state;
        if (s == "opened" || this.cell.game.ended) return false;
        this.cell.setState(s == "flag" ? "default" : "flag");
        return false;
    }
    this.game.cells[this.id] = this;
    this.setState("default");
    return this.element;
}

var cp = cell.prototype;

cp.setState = function(state) {
    this.element.className = "cell " + state;
    this.state = state;
}

cp.stepped = function() {
    if (this.game.ended) return false;
    if (this.has_bomb) return game.end(this);
   this.setState("opened"); 
}


