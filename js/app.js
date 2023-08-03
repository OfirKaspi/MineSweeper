// TODO : a winning function + chaging the restart buttn to other emoji
// TODO : a losing function + stop the negative lives count 
// TODO : BONUSES

const MINE = '💣'
var gBoard
var gMines
var gLives = 3
var isMineFirstTry
var isGameOver
var gHint
var timerInterval
var gSafePlace



var gLevel = {
    SIZE: 4,
    MINES: 2
}
   
function onInit(){
    buildBoard()
    renderMines()
    setMinesNegsCount(gBoard)
    renderBoard()
    resetHelps()
    isMineFirstTry = true
    isGameOver = false
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
    if(isGameOver) return
    if(currCell.isShown || currCell.isMarked) return
    if(gHint) {
        removeCoveredForOneSecond(i, j)
        gHint = false
        return
    }   
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
            elLives.innerHTML = `💕 : ${gLives}`
            console.log(`You only got ${gLives} more lives !!`)
            if(gLives === 0){
                elBtn = document.querySelector('.restart')
                elBtn.innerHTML = '💀'
                console.log('Game over')
                checkLose()
                return
            }
        }
    }else{
        if(isMineFirstTry){
            isMineFirstTry = false
            startTimer()
        }
        currCell.isShown = true;
        elCell.classList.remove('covered');
        if(currCell.minesAroundCount){
            elCell.innerText = currCell.minesAroundCount
        }else{
            expandShown(i, j)
        }
    }
    checkVictory()
}

function handleRightClick(event, element) {
    event.preventDefault();
    if(isGameOver) return
    const i = parseInt(element.getAttribute('data-i'));
    const j = parseInt(element.getAttribute('data-j')); 
    const currCell = gBoard[i][j]
    if(currCell.isShown) return
    if(element.innerText){
        element.innerText = ''
        currCell.isMarked = false
    }else{
        element.innerText = '❓'
        currCell.isMarked = true
        checkVictory()
    }
}

function restart(size,mines){
    gLevel.MINES = mines
    gLevel.SIZE = size
    clearInterval(timerInterval)
    onInit()
    elTimer = document.querySelector('.timer')
    elTimer.innerHTML = ' ⌛ : '
    elBtn = document.querySelector('.restart')
    elBtn.innerHTML = '😋'
    gLives = 3
    elLives = document.querySelector('.lives')
    elLives.innerHTML = `💕 : ${gLives}`
}

function expandShown(rowIdx, colIdx){
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue;
            if (j < 0 || j >= gLevel.SIZE) continue;
            var currCell = gBoard[i][j];
            if(!currCell.isMine && !currCell.isShown && !currCell.isMarked){
                currCell.isShown = true
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                elCell.classList.remove('covered')
                if (currCell.minesAroundCount > 0) {
                    elCell.innerText = currCell.minesAroundCount;
                } else {
                    elCell.innerText = ''
                    expandShown(i, j);
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
    if(countShown + countMarked !== gLevel.SIZE**2) return
    if (countMarked < gLevel.MINES - livesLeft) return
    isGameOver = true
    elBtn = document.querySelector('.restart')
    elBtn.innerHTML = '🍟'
    clearInterval(timerInterval)
    setTimeout(function() {
        alert('WINNER!!!');
    }, 200);
}

function checkLose(){
    elMines = document.querySelectorAll('.mine')
    for(var i = 0; i < elMines.length; i++){
        elMines[i].classList.remove('covered')
        elMines[i].innerText = MINE
    }
    isGameOver = true
    clearInterval(timerInterval)
    setTimeout(function() {
        alert('YOU LOSE!!!');
    }, 200);
}

function getHint(element){
    if(isGameOver || gHint || isMineFirstTry) return
    if(element.classList.contains('unused')){
        element.classList.remove('unused')
        element.src = 'images/img.2.png'
        gHint = true
        console.log(gHint);
    }
}

function getSafePlace(element){
    if(isGameOver || gSafePlace || isMineFirstTry) return
    if(element.classList.contains('unused')){
        element.classList.remove('unused')
        element.src = 'images/safe.2.png'
        var cell = getRandomEmptyCell()
        if (cell) {
            var i = cell.i;
            var j = cell.j;
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            elCell.classList.remove('covered');
            var currCell = gBoard[i][j]
            if(currCell.minesAroundCount) elCell.innerText = currCell.minesAroundCount
            setTimeout(function () {
                elCell.classList.add('covered');
                elCell.innerText = ''
            }, 2000);
        }
    }
}

function resetHelps(){
    gHint = false
    var elHints = document.querySelectorAll('.hints')
    var elsafes = document.querySelectorAll('.safes')
    for(var i = 0; i < 3; i++){
        elHints[i].src = 'images/img.1.png'
        elsafes[i].src = 'images/safe.1.png'
        elHints[i].classList.add('unused')
        elsafes[i].classList.add('unused')
    }
}

function removeCoveredForOneSecond(rowIdx, colIdx) {
    var neighbors = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            var currCell = gBoard[i][j];
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            elCell.classList.remove('covered')
            if (currCell.isMine) {
                elCell.innerText = MINE
                console.log('a mine')
            }else if (currCell.minesAroundCount){
                elCell.innerText = currCell.minesAroundCount
                console.log('not a mine');
            }
            neighbors.push(elCell)
            }
    }
    console.log(neighbors)
    setTimeout(function () {
        for(var i = 0; i < neighbors.length; i++){
            neighbors[i].classList.add('covered');
            neighbors[i].innerText = ''
        }
    }, 1000)
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomEmptyCell() {
    var emptyCells = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                emptyCells.push({ i, j });
            }
        }
    }

    if (emptyCells.length === 0) return null;

    var randomIdx = getRandomInt(0, emptyCells.length);
    return emptyCells[randomIdx];
}

function startTimer() {
    let startTime = Date.now()
    function updateTimer() {
      const currentTime = Date.now()
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
      document.querySelector('.timer').innerText = ` ⌛ : ${elapsedSeconds}`
    }
    timerInterval = setInterval(updateTimer, 1000)
}