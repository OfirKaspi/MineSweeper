// TODO : a winning function + chaging the restart buttn to other emoji
// TODO : a losing function + stop the negative lives count 
// TODO : BONUSES

const MINE = '💣'
var gBoard
var gMines
var gLives = 3
var isMineFirstTry
var isVictory
var isLose


var gLevel = {
    SIZE: 4,
    MINES: 2
}
   
function onInit(){
    buildBoard()
    renderMines()
    setMinesNegsCount(gBoard)
    renderBoard()
    isMineFirstTry = true
    isVictory = false
    isLose = false
}

function buildBoard() {
    gBoard = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false           
            };
        }
    }
}       

function renderBoard() {
    var strHTML = "";
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>\n`;
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j];
            const className = (cell.isMine) ? 'mine' : ''

            strHTML += `\t <td data-i="${i}" data-j="${j}"
                        class="cell covered ${className}" 
                        onclick="onCellClicked(this, ${i}, ${j})"
                        oncontextmenu="handleRightClick(event, this)">
                    </td>\n`;
        }
        strHTML += `</tr>\n`;
    }
    const elCells = document.querySelector('.board-cells');
    elCells.innerHTML = strHTML;
}

function renderMines(){
    gMines = []
    var positions = []
    var boardSize = gLevel.SIZE**2

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            positions.push({ i, j })
        }
    }

    for (var n = boardSize - 1; n > 0; n--) {
        var k = Math.floor(Math.random() * (n + 1));
        [positions[n], positions[k]] = [positions[k], positions[n]]
    }

    for (var i = 0; i < gLevel.MINES; i++) {
        var mineLocation = positions[i];
        gBoard[mineLocation.i][mineLocation.j].isMine = true
        gMines.push({ i: mineLocation.i, j: mineLocation.j })
    } 
    console.log(gMines);
}

function renderCell(i, j, value) {
    const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    elCell.innerText = value;
    elCell.classList = 'cell'
}

function setMinesNegsCount(gBoard){
    for( var i = 0; i < gLevel.SIZE; i++){
        for( var j = 0; j < gLevel.SIZE; j++){
            currCell = gBoard[i][j]
            currCell.minesAroundCount = checkNeighbors(gBoard, i, j)
            // console.log(currCell)
        }
    }
}

function checkNeighbors(board, rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue;
            if (j < 0 || j >= board[0].length) continue;
            var currCell = board[i][j];
            if (currCell.isMine) {
                count++;
            }
        }
    }
    if(count === 0) count = ''
    return count;
}

function onCellClicked(elCell, i, j){
    const currCell = gBoard[i][j];
    if(isVictory || isLose) return
    if(currCell.isShown || currCell.isMarked) return
    if(currCell.isMine){
        if (isMineFirstTry === true){
            onInit()
            onCellClicked(elCell, i, j)
            var cellValue = checkNeighbors(gBoard, i, j)
            renderCell(i, j, cellValue)
            elCell.classList.remove('covered')
            console.log('pressed on a mine in first try');
            console.log('new cell value is:', cellValue);
        }else{
            currCell.isShown = true;
            gLives--
            elCell.innerText = MINE
            elCell.classList.remove('covered')
            elLives = document.querySelector('.lives')
            elLives.innerHTML = `${gLives} LIVES LEFT`
            console.log(`You only got ${gLives} more lives !!`)
            if(gLives === 0){
                elBtn = document.querySelector('.restart')
                elBtn.innerHTML = '💀'
                console.log('Game over')
            }
            // need to put a function of game over
        }
    }else{
        isMineFirstTry = false
        currCell.isShown = true;
        elCell.classList.remove('covered');
        if(currCell.minesAroundCount){
            elCell.innerText = currCell.minesAroundCount
        }else{
            expandShown(gBoard,i, j)
        }
    }
    checkLose()
    checkVictory()
}

function handleRightClick(event, element) {
    event.preventDefault();
    if(isVictory || isLose) return
    const i = parseInt(element.getAttribute('data-i'));
    const j = parseInt(element.getAttribute('data-j')); 
    const currCell = gBoard[i][j]
    if(currCell.isShown) return
    if(element.innerText){
        element.innerText = ''
        currCell.isMarked = false
        checkVictory()
    }else{
        element.innerText = '❓'
        currCell.isMarked = true
        checkVictory()
    }
}

function restart(size,mines){
    gLevel.MINES = mines
    gLevel.SIZE = size
    onInit()
    elBtn = document.querySelector('.restart')
    elBtn.innerHTML = '😋'
    gLives = 3
    elLives = document.querySelector('.lives')
    elLives.innerHTML = `${gLives} LIVES LEFT`
}

function expandShown(board,rowIdx, colIdx){
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue;
            if (j < 0 || j >= board[0].length) continue;
            var currCell = board[i][j];
            if(!currCell.isMine && !currCell.isShown && !currCell.isMarked){
                currCell.isShown = true
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                elCell.classList.remove('covered')
                if (currCell.minesAroundCount > 0) {
                    elCell.innerText = currCell.minesAroundCount;
                } else {
                    elCell.innerText = ''
                    expandShown(board, i, j);
                }
            }
        }
    }
}

function checkVictory(){
    var livesLeft = 3 - gLives
    var countMarked = 0
    var countShown = 0
    for (var i = 0; i < gLevel.SIZE; i++){
        for (var j = 0; j < gLevel.SIZE; j++){
            var currCell = gBoard[i][j]
            if(currCell.isMarked) countMarked++
            if(currCell.isShown) countShown++
        }
    }
    if (countShown < gLevel.SIZE**2 - gLevel.MINES) return
    if (countMarked < gLevel.MINES - livesLeft) return
    isVictory = true
    elBtn = document.querySelector('.restart')
    elBtn.innerHTML = '🍟'
    setTimeout(function() {
        alert('WINNER!!!');
    }, 200);
}

function checkLose(){
    if (gLives !== 0) return
    elMines = document.querySelectorAll('.mine')
    for(var i = 0; i < elMines.length; i++){
        elMines[i].classList.remove('covered')
        elMines[i].innerText = MINE
    }
    isLose = true
    setTimeout(function() {
        alert('YOU LOSE!!!');
    }, 200);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


  