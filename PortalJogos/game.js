class TetrisGame {
    constructor() {
        // Game elements
        this.board = document.getElementById('tetris-board');
        this.nextPieceDisplay = document.getElementById('next-piece');
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.levelElement = document.getElementById('level');
        this.startButton = document.getElementById('start-btn');
        this.pauseButton = document.getElementById('pause-btn');
        this.backButton = document.getElementById('back-btn');
        
        // Game state
        this.grid = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.isGameOver = false;
        this.isPaused = false;
        this.gameInterval = null;
        this.dropSpeed = 1000; // milliseconds
        
        // Current and next tetromino
        this.currentTetromino = null;
        this.nextTetromino = null;
        
        // Tetromino shapes
        this.tetrominoes = [
            // I
            {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: 1
            },
            // J
            {
                shape: [
                    [2, 0, 0],
                    [2, 2, 2],
                    [0, 0, 0]
                ],
                color: 2
            },
            // L
            {
                shape: [
                    [0, 0, 3],
                    [3, 3, 3],
                    [0, 0, 0]
                ],
                color: 3
            },
            // O
            {
                shape: [
                    [4, 4],
                    [4, 4]
                ],
                color: 4
            },
            // S
            {
                shape: [
                    [0, 5, 5],
                    [5, 5, 0],
                    [0, 0, 0]
                ],
                color: 5
            },
            // T
            {
                shape: [
                    [0, 6, 0],
                    [6, 6, 6],
                    [0, 0, 0]
                ],
                color: 6
            },
            // Z
            {
                shape: [
                    [7, 7, 0],
                    [0, 7, 7],
                    [0, 0, 0]
                ],
                color: 7
            }
        ];
        
        this.currentPosition = {x: 0, y: 0};
        
        this.initBoard();
        this.setupEventListeners();
    }
    
    initBoard() {
        // Clear the board
        this.board.innerHTML = '';
        this.nextPieceDisplay.innerHTML = '';
        
        // Create cells for the main board
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.board.appendChild(cell);
            }
        }
        
        // Create cells for the next piece display
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.classList.add('next-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.nextPieceDisplay.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        // Start button
        this.startButton.addEventListener('click', () => {
            if (this.isGameOver) {
                this.resetGame();
            }
            this.startGame();
        });
        
        // Pause button
        this.pauseButton.addEventListener('click', () => {
            this.togglePause();
        });
        
        // Back button
        this.backButton.addEventListener('click', () => {
            this.goBack();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver || this.isPaused) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.moveTetrominoLeft();
                    break;
                case 'ArrowRight':
                    this.moveTetrominoRight();
                    break;
                case 'ArrowDown':
                    this.moveTetrominoDown();
                    break;
                case 'ArrowUp':
                    this.rotateTetromino();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
            }
        });
    }
    
    resetGame() {
        // Reset game state
        this.grid = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.isGameOver = false;
        this.dropSpeed = 1000;
        
        // Update UI
        this.updateScore();
        this.clearBoard();
    }
    
    startGame() {
        if (this.gameInterval) clearInterval(this.gameInterval);
        
        this.isPaused = false;
        this.isGameOver = false;
        this.startButton.textContent = 'Reiniciar';
        
        if (!this.currentTetromino) {
            this.getNewTetromino();
        }
        
        this.gameInterval = setInterval(() => {
            this.gameLoop();
        }, this.dropSpeed);
    }
    
    togglePause() {
        if (this.isGameOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            clearInterval(this.gameInterval);
            this.pauseButton.textContent = 'Continuar';
        } else {
            this.gameInterval = setInterval(() => {
                this.gameLoop();
            }, this.dropSpeed);
            this.pauseButton.textContent = 'Pausar';
        }
    }
    
    gameLoop() {
        if (!this.moveTetrominoDown()) {
            this.lockTetromino();
            this.clearLines();
            
            if (!this.getNewTetromino()) {
                this.gameOver();
            }
        }
    }
    
    getNewTetromino() {
        // Get the next tetromino if exists, or create a new random one
        if (this.nextTetromino) {
            this.currentTetromino = this.nextTetromino;
        } else {
            const randomIndex = Math.floor(Math.random() * this.tetrominoes.length);
            this.currentTetromino = JSON.parse(JSON.stringify(this.tetrominoes[randomIndex]));
        }
        
        // Generate new next tetromino
        const randomIndex = Math.floor(Math.random() * this.tetrominoes.length);
        this.nextTetromino = JSON.parse(JSON.stringify(this.tetrominoes[randomIndex]));
        
        // Set starting position (center top)
        this.currentPosition = {
            x: Math.floor((10 - this.currentTetromino.shape[0].length) / 2),
            y: 0
        };
        
        // Check if the new tetromino can be placed
        if (!this.isValidMove(this.currentPosition.x, this.currentPosition.y, this.currentTetromino.shape)) {
            return false; // Game over
        }
        
        this.drawTetromino();
        this.drawNextTetromino();
        
        return true;
    }
    
    drawTetromino() {
        this.clearBoard();
        
        // Draw the current state of the grid
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                if (this.grid[row][col] !== 0) {
                    const cell = this.board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.add('occupied', `color-${this.grid[row][col]}`);
                }
            }
        }
        
        // Draw the current tetromino
        const shape = this.currentTetromino.shape;
        const color = this.currentTetromino.color;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const boardRow = this.currentPosition.y + row;
                    const boardCol = this.currentPosition.x + col;
                    
                    if (boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10) {
                        const cell = this.board.querySelector(`[data-row="${boardRow}"][data-col="${boardCol}"]`);
                        cell.classList.add('occupied', `color-${color}`);
                    }
                }
            }
        }
    }
    
    drawNextTetromino() {
        // Clear next piece display
        const nextCells = this.nextPieceDisplay.querySelectorAll('.next-cell');
        nextCells.forEach(cell => {
            cell.classList.remove('occupied');
            for (let i = 1; i <= 7; i++) {
                cell.classList.remove(`color-${i}`);
            }
        });
        
        // Draw the next tetromino
        const shape = this.nextTetromino.shape;
        const color = this.nextTetromino.color;
        
        // Calculate the offset to center the piece
        const offsetRow = Math.floor((4 - shape.length) / 2);
        const offsetCol = Math.floor((4 - shape[0].length) / 2);
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const displayRow = offsetRow + row;
                    const displayCol = offsetCol + col;
                    
                    if (displayRow >= 0 && displayRow < 4 && displayCol >= 0 && displayCol < 4) {
                        const cell = this.nextPieceDisplay.querySelector(`[data-row="${displayRow}"][data-col="${displayCol}"]`);
                        cell.classList.add('occupied', `color-${color}`);
                    }
                }
            }
        }
    }
    
    clearBoard() {
        const cells = this.board.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('occupied');
            for (let i = 1; i <= 7; i++) {
                cell.classList.remove(`color-${i}`);
            }
        });
    }
    
    moveTetrominoLeft() {
        if (this.isValidMove(this.currentPosition.x - 1, this.currentPosition.y, this.currentTetromino.shape)) {
            this.currentPosition.x--;
            this.drawTetromino();
            return true;
        }
        return false;
    }
    
    moveTetrominoRight() {
        if (this.isValidMove(this.currentPosition.x + 1, this.currentPosition.y, this.currentTetromino.shape)) {
            this.currentPosition.x++;
            this.drawTetromino();
            return true;
        }
        return false;
    }
    
    moveTetrominoDown() {
        if (this.isValidMove(this.currentPosition.x, this.currentPosition.y + 1, this.currentTetromino.shape)) {
            this.currentPosition.y++;
            this.drawTetromino();
            return true;
        }
        return false;
    }
    
    hardDrop() {
        while (this.moveTetrominoDown()) {
            // Move down until it can't move anymore
        }
        this.lockTetromino();
        this.clearLines();
        if (!this.getNewTetromino()) {
            this.gameOver();
        }
    }
    
    rotateTetromino() {
        // Create a deep copy of the current tetromino
        const originalShape = JSON.parse(JSON.stringify(this.currentTetromino.shape));
        
        // Get dimensions
        const n = originalShape.length;
        
        // Create a new rotated shape
        const rotatedShape = Array(n).fill().map(() => Array(n).fill(0));
        
        // Rotate 90 degrees clockwise
        for (let row = 0; row < n; row++) {
            for (let col = 0; col < n; col++) {
                rotatedShape[col][n - 1 - row] = originalShape[row][col];
            }
        }
        
        // Check if the rotation is valid
        if (this.isValidMove(this.currentPosition.x, this.currentPosition.y, rotatedShape)) {
            this.currentTetromino.shape = rotatedShape;
            this.drawTetromino();
            return true;
        }
        
        // Try wall kicks (simple version: try to move left or right if rotation is blocked by wall)
        const kicks = [-1, 1, -2, 2]; // Try these horizontal adjustments
        
        for (const kick of kicks) {
            if (this.isValidMove(this.currentPosition.x + kick, this.currentPosition.y, rotatedShape)) {
                this.currentPosition.x += kick;
                this.currentTetromino.shape = rotatedShape;
                this.drawTetromino();
                return true;
            }
        }
        
        return false;
    }
    
    isValidMove(x, y, shape) {
        // Check if the move is valid (within boundaries and not colliding)
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const boardRow = y + row;
                    const boardCol = x + col;
                    
                    // Check boundaries
                    if (boardCol < 0 || boardCol >= 10 || boardRow >= 20) {
                        return false;
                    }
                    
                    // Check collision with locked pieces
                    if (boardRow >= 0 && this.grid[boardRow][boardCol] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    lockTetromino() {
        // Lock the current tetromino in place
        const shape = this.currentTetromino.shape;
        const color = this.currentTetromino.color;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const boardRow = this.currentPosition.y + row;
                    const boardCol = this.currentPosition.x + col;
                    
                    if (boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10) {
                        this.grid[boardRow][boardCol] = color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        // Check each row from bottom to top
        for (let row = 19; row >= 0; row--) {
            if (this.grid[row].every(cell => cell !== 0)) {
                // Remove the line
                this.grid.splice(row, 1);
                // Add a new empty line at the top
                this.grid.unshift(Array(10).fill(0));
                linesCleared++;
                row++; // Re-check the same row index as it now contains a new line
            }
        }
        
        if (linesCleared > 0) {
            // Update score and level
            this.lines += linesCleared;
            
            // Calculate score (different points for different number of lines)
            switch (linesCleared) {
                case 1: this.score += 100 * this.level; break;
                case 2: this.score += 300 * this.level; break;
                case 3: this.score += 500 * this.level; break;
                case 4: this.score += 800 * this.level; break; // Tetris!
            }
            
            // Update level every 10 lines
            this.level = Math.floor(this.lines / 10) + 1;
            
            // Adjust drop speed based on level
            this.dropSpeed = Math.max(100, 1000 - (this.level - 1) * 100);
            
            // Update the game interval
            clearInterval(this.gameInterval);
            this.gameInterval = setInterval(() => {
                this.gameLoop();
            }, this.dropSpeed);
            
            this.updateScore();
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = `Pontuação: ${this.score}`;
        this.linesElement.textContent = `Linhas: ${this.lines}`;
        this.levelElement.textContent = `Nível: ${this.level}`;
    }
    
    gameOver() {
        clearInterval(this.gameInterval);
        this.isGameOver = true;
        this.startButton.textContent = 'Novo Jogo';
        
        // Flash animation for game over
        const flashCount = 5;
        let count = 0;
        
        const flashInterval = setInterval(() => {
            const cells = this.board.querySelectorAll('.cell');
            cells.forEach(cell => {
                cell.style.opacity = count % 2 === 0 ? '0.3' : '1';
            });
            
            count++;
            if (count >= flashCount * 2) {
                clearInterval(flashInterval);
                cells.forEach(cell => {
                    cell.style.opacity = '1';
                });
                
                alert(`Fim de jogo! Pontuação: ${this.score}`);
            }
        }, 250);
    }
    
    goBack() {
        // If the game is running, stop it
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        // You could redirect to a main menu page if one exists
        // window.location.href = 'index.html';
        
        // Or show a confirmation dialog before leaving
        if (confirm('Tem certeza que deseja voltar? O progresso do jogo será perdido.')) {
            // In a real application, this would navigate back or to a main menu
            alert('Função de voltar acionada! Em uma aplicação real, isso levaria a uma página principal.');
            
            // Reset game state
            this.resetGame();
        } else {
            // If the game was running, restart it
            if (!this.isGameOver && !this.isPaused) {
                this.startGame();
            }
        }
    }
}

// Initialize the game when the window loads
window.addEventListener('load', () => {
    new TetrisGame();
});