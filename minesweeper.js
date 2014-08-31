var game;

// Validates game configuration
function validate(value, min, max) {
    var v = Math.round(value);
    $("btn_start").disabled(value != v || v < min || v > max); 
}

// Creates new game with user-provided parameters
// and runs it
function play() {
    $("welcome").addClass("hidden");
    $("playground").removeClass("hidden");
    game = new minesweeper(
        Math.round($("width").val()),
        Math.round($("height").val()),
        Math.round($("bombs").val())
    );
    game.run();
}

// Game data class
function minesweeper(width, height, bombs) {
    this.width = width;
    this.height = height;
    this.bombs = bombs;
    
    // Stores game cells data
    this.cells = new cells();
    this.status = $("result");

    // Updates game status (moves made/win/loose)
    this.update = function(status) {
        if (!status) status = this.moves + " moves made so far";
        this.status.text(status);
    }

    // Adds a bomb to the field randomly
    this.addBomb = function() {
        var c = this.cells.get(
                Math.round(this.width * Math.random()), 
                Math.round(this.height * Math.random())
            );
        if (c && !c.has_bomb) {
            c.has_bomb = true;
            c.forEachNeighbor(function(c) {c.bombs_around++});
        } else this.addBomb();
    }

    this.removeBomb = function(c) {
        c.has_bomb = false;
        c.forEachNeighbor(function(c) {c.bombs_around--});
    }

    // Prevents first move explosion
    this.checkFirstMove = function(c) {
        if (c.has_bomb) {
            this.addBomb();
            this.removeBomb(c);
        }
    }

    this.run = function() {
        // Reset the field
        $("field").clear();
        for (var y = 0; y < this.height; y++)
            for (var x = 0, c, tr = $("field").append("tr", true); x < this.width; x++) tr.append(new cell(x, y, this));

        // Set up the bombs
        for (var i = 0; i < this.bombs; i++) this.addBomb();

        // Clear states from previous rounds
        $("playground").removeClass("exploded").removeClass("won");
        this.opened = 0;
        this.ended = false;
        this.moves = 0;
        this.update();
    }

    // Called when bomb has exploded
    this.end = function(exploded_cell) {
        $("playground").addClass("exploded");
        this.ended = true;
        this.cells.each(function(i) {i.redraw()})
        this.update("All Your Base Are Belong To Us!");
    }

    // Checks whether game is won
    this.checkWin = function() {
        if (this.opened == this.width * this.height - this.bombs) {  
            $("playground").addClass("won");
            this.ended = true;
            this.update("Congratulations!");
        }
    }
}

// Collection of the cells
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

// Game field cell
function cell(x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;

    this.has_bomb = false;
    this.opened = false;
    this.flagged = false;

    this.bombs_around = 0;
    //this.closed_around = 8;

    this.element = document.createElement("td");
    this.element.cell = this;
    
    // Event handler for cell opening
    this.element.onclick = function() {
        if (!this.cell.game.moves) this.cell.game.checkFirstMove(this.cell);
        this.cell.stepped();
    }
    
    // Event handler for cell (un)flagging
    this.element.oncontextmenu = function() {
        if (!this.cell.opened && !this.cell.game.ended) {
            this.cell.flagged = !this.cell.flagged;
            this.cell.redraw();
        }
        return false;
    }
    this.game.cells.put(this);
    this.redraw();
    return this.element;
}

var cp = cell.prototype;

// Executes function provided for cell' neighbors
cp.forEachNeighbor = function(f, exclude_me) {
    for (var x = -1; x < 2; x++)
        for (var y = -1; y < 2; y++) {
            if (!x && !y && exclude_me) continue;
            var c = this.game.cells.get(this.x + x, this.y + y);
            if (c) f(c, arguments);
        }
}

// Redraws cell
cp.redraw = function() {
    state = "default";
    if (this.game.ended && this.has_bomb) state = "bomb";
    else if (this.opened) state = this.bombs_around ? "discovered a" + this.bombs_around: "opened";
    else if (this.flagged) state = "flag " + (this.discovered ? "opened" : "default");
    this.element.className = "cell " + state;
}

// Handler for cell click event
cp.stepped = function(discover) {
    // No clicking allowed if game has ended
    if (this.game.ended || this.opened) return false;
    // Explosion if clicked the cell with bomb
    if (this.has_bomb) return game.end(this);

    // Updating game moves count
    if (arguments.length == 0) {
        this.game.moves++;
        this.game.update();
    }

    // Marking clicked cell as opened
    this.opened = true;
    this.redraw();

    // Checking winnig
    this.game.opened++;
    this.game.checkWin();
    
    // Recursion for the neighbors
    this.forEachNeighbor(
            function(c, args) {
                var discover = args.length > 2 ? args[2] : null;
                // Skipping opened and armed cells
                if (c.opened || (c.has_bomb && discover !== false) || discover === false) return;

                // If bombs around
                if (c.bombs_around) {
                    // ... and we're on the first loop or 
                    // near the clean cell - keep discover around
                    if (discover !== false) c.stepped(false);
                } else 
                    // If no bombs around - just open the cell
                    // and discover surrounding ones
                    c.stepped(true);
            }, true, discover);
}

