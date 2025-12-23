(function () {
  document.addEventListener('DOMContentLoaded', () => {

    const Elements = {
        field: document.querySelector('.field'),
        picture: document.querySelector('.picture'),
        sourceImage: document.querySelector('.sourceImage')
    };

    const Config = {
        IMAGE_WIDTH: 300,
        IMAGE_HEIGHT: 300,
        PIECE_WIDTH: 50,
        PIECE_HEIGHT: 50
    };

    const cols = Config.IMAGE_WIDTH / Config.PIECE_WIDTH;
    const rows = Config.IMAGE_HEIGHT / Config.PIECE_HEIGHT;
    const totalPieces = cols * rows;

    let pieceIdCounter = 0;

    function createPictureGrid() 
    {
        Elements.picture.innerHTML = '';

        const totalGridWidth = cols * Config.PIECE_WIDTH;
        const totalGridHeight = rows * Config.PIECE_HEIGHT;
        const offsetX = (Elements.picture.offsetWidth - totalGridWidth) / 2;
        const offsetY = (Elements.picture.offsetHeight - totalGridHeight) / 2;

        for (let row = 0; row < rows; row++) 
        {
            for (let col = 0; col < cols; col++) 
            {
                const cell = document.createElement('div');
                cell.className = 'picture-cell';
                cell.dataset.row = String(row);
                cell.dataset.col = String(col);

                cell.style.position = 'absolute';
                cell.style.left = `${offsetX + col * Config.PIECE_WIDTH}px`;
                cell.style.top = `${offsetY + row * Config.PIECE_HEIGHT}px`;
                cell.style.width = `${Config.PIECE_WIDTH}px`;
                cell.style.height = `${Config.PIECE_HEIGHT}px`;
                cell.style.border = '1px dashed var(--txt-color)';
                cell.style.boxSizing = 'border-box';

                cell.addEventListener('dragover', onDragOver);
                cell.addEventListener('dragleave', onDragLeave);
                cell.addEventListener('drop', onDropToCell);

                Elements.picture.appendChild(cell);
            }
        }
    }

    function makePiece(row, col) 
    {
        const piece = document.createElement('div');
        const index = row * cols + col;

        piece.style.width = `${Config.PIECE_WIDTH}px`;
        piece.style.height = `${Config.PIECE_HEIGHT}px`;
        piece.style.backgroundImage = `url(${Elements.sourceImage.src})`;
        piece.style.backgroundPosition = `-${col * Config.PIECE_WIDTH}px -${row * Config.PIECE_HEIGHT}px`;
        piece.style.backgroundSize = `${Config.IMAGE_WIDTH}px ${Config.IMAGE_HEIGHT}px`;

        piece.className = 'puzzle-piece';
        piece.draggable = true;

        const pid = 'piece_' + (pieceIdCounter++);
        piece.id = pid;

        piece.dataset.correctRow = String(row);
        piece.dataset.correctCol = String(col);
        piece.dataset.index = String(index);

        piece.addEventListener('dragstart', onDragStart);
        piece.addEventListener('dragend', onDragEnd);

        return piece;
    }

    function createPuzzlePieces() 
    {
        Elements.field.innerHTML = '';
        pieceIdCounter = 0;

        for (let row = 0; row < rows; row++) 
        {
            for (let col = 0; col < cols; col++) 
            {
                const piece = makePiece(row, col);
                Elements.field.appendChild(piece);
            }
        }
    }

    function getPieceById(id) 
    {
        return document.getElementById(id);
    }

    function onDragStart(e) 
    {
        const piece = e.target;
        if (piece.classList.contains('locked')) 
        {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', piece.id);
        e.dataTransfer.effectAllowed = 'move';
    }

    function onDragEnd() 
    {
        clearDragOverStyles();
    }

    function onDragOver(e) 
    {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'move';
    }

    function onDragLeave(e) 
    {
        e.currentTarget.classList.remove('drag-over');
    }

    function clearDragOverStyles() 
    {
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    }

    function onDropToCell(e) 
    {
        e.preventDefault();
        const cell = e.currentTarget;
        cell.classList.remove('drag-over');

        const pieceId = e.dataTransfer.getData('text/plain');
        const piece = getPieceById(pieceId);
        if (!piece) return;

        if (piece.classList.contains('locked'))
            return;

        if (cell.firstElementChild) return;

        cell.appendChild(piece);

        checkPiecePosition(piece, cell);
        checkWin();
    }

    function onDropToField(e) 
    {
        e.preventDefault();
        Elements.field.classList.remove('drag-over');

        const pieceId = e.dataTransfer.getData('text/plain');
        const piece = getPieceById(pieceId);
        if (!piece) return;

        if (piece.classList.contains('locked')) {
            piece.classList.remove('locked');
            piece.draggable = true;
        }

        Elements.field.appendChild(piece);
    }

    function attachFieldDnD() 
    {
        Elements.field.addEventListener('dragover', function (e) 
        {
            e.preventDefault();
            Elements.field.classList.add('drag-over');
            e.dataTransfer.dropEffect = 'move';
        });
        Elements.field.addEventListener('dragleave', function () 
        {
            Elements.field.classList.remove('drag-over');
        });
        Elements.field.addEventListener('drop', onDropToField);
    }

    function checkPiecePosition(piece, cell) 
    {
        const correctRow = piece.dataset.correctRow;
        const correctCol = piece.dataset.correctCol;
        const currentRow = cell.dataset.row;
        const currentCol = cell.dataset.col;

        if (correctRow === currentRow && correctCol === currentCol)
        {
            piece.classList.add('locked');
            piece.draggable = false;
        } 
        else 
        {
            piece.classList.remove('locked');
            piece.draggable = true;
        }
    }

    function shufflePieces() 
    {
        const piecesToShuffle = [];
        const lockedPieces = [];
        
        const fieldPieces = Array.from(Elements.field.querySelectorAll('.puzzle-piece'));
        piecesToShuffle.push(...fieldPieces);

        const picturePieces = Array.from(Elements.picture.querySelectorAll('.puzzle-piece'));
        picturePieces.forEach(piece => {
        if (!piece.classList.contains('locked')) {
            piecesToShuffle.push(piece);
            const parentCell = piece.parentElement;
            if (parentCell && parentCell.classList.contains('picture-cell')) {
            parentCell.removeChild(piece);
            }
        } 
        else {
            lockedPieces.push(piece);
        }});
        
        for (let i = piecesToShuffle.length - 1; i > 0; i--) 
        {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = piecesToShuffle[i];
            piecesToShuffle[i] = piecesToShuffle[j];
            piecesToShuffle[j] = tmp;
        }
        
        Elements.field.innerHTML = '';
        piecesToShuffle.forEach(p => Elements.field.appendChild(p));
        
        clearDragOverStyles();
    }

    // function resetPiecesToField() {
    //   const allPieces = document.querySelectorAll('.puzzle-piece');
    //   allPieces.forEach(p => {
    //     p.classList.remove('locked');
    //     p.draggable = true;
    //     Elements.field.appendChild(p);
    //   });
    //   clearDragOverStyles();
    // }

    function checkWin() 
    {
        const cells = Array.from(Elements.picture.querySelectorAll('.picture-cell'));
        let ok = 0;

        for (let i = 0; i < cells.length; i++) 
        {
            const cell = cells[i];
            const piece = cell.firstElementChild;
            if (!piece) return;

            const cr = piece.dataset.correctRow;
            const cc = piece.dataset.correctCol;
            if (cr === cell.dataset.row && cc === cell.dataset.col)
                ok++;
            else return;
        }

        if (ok === totalPieces)
            alert('You solve puzzle!');
    }

    function init() 
    {
        createPictureGrid();
        createPuzzlePieces();
        attachFieldDnD();
        shufflePieces();

        window.addEventListener('resize', function () 
        {
            const placements = new Map();
            document.querySelectorAll('.puzzle-piece').forEach(p => {
                const parent = p.parentElement;
                if (parent && parent.classList.contains('picture-cell')) {
                placements.set(p.id, { 
                    row: parent.dataset.row, 
                    col: parent.dataset.col,
                    isLocked: p.classList.contains('locked')
                });
                } else {
                placements.set(p.id, null);
                }
            });

            createPictureGrid();

            placements.forEach((pos, pid) => {
                const piece = getPieceById(pid);
                if (!piece) return;
                
                if (!pos) {
                Elements.field.appendChild(piece);
                } else {
                const cell = Elements.picture.querySelector(
                    `.picture-cell[data-row="${pos.row}"][data-col="${pos.col}"]`
                );
                if (cell && !cell.firstElementChild) {
                    cell.appendChild(piece);
                    if (pos.isLocked) {
                    piece.classList.add('locked');
                    piece.draggable = false;
                    }
                } else {
                    Elements.field.appendChild(piece);
                }
                }
            });
        });
    }

    if (Elements.sourceImage.complete)
      init();
    else
      Elements.sourceImage.onload = init;
});})();
