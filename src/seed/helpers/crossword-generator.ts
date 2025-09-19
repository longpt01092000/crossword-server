import {
  Puzzle,
  InputWordClue,
  WordClue,
  Cell,
  CellIntersection,
  Direction,
  Line,
  Board,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '../../types/crossword-generator';

// validateWords function moved to helpers/validation.ts

export function genPuzzles(wordClues: InputWordClue[]): Puzzle[] {
  const puzzles: Puzzle[] = [];
  const words = wordClues.map((wordClue) => wordClue.word);
  const boards = genCrosswordBoards(words);
  for (const board of boards) {
    const firstLetterIntersections: CellIntersection[] =
      getFirstLetterIntersections(board);
    const newWordClues: WordClue[] = firstLetterIntersections.map(
      (intersection) => ({
        word: intersection.word,
        clue:
          wordClues.find((wordClue) => wordClue.word === intersection.word)
            ?.clue || '',
        dir: intersection.dir,
        xy: intersection.xy,
      }),
    );

    puzzles.push({
      board,
      wordClues: newWordClues,
      boardInfo: {
        width: board.length,
        height: board[0].length,
        fillRate: getBoardFillRatio(board),
        intersectionCount: getNumberOfIntersections(board),
        sizeRatio: getBoardSizeRatio(board),
        score: getBoardScore(board),
      },
    });
  }

  return puzzles;
}

function getFirstLetterIntersections(board: Board): CellIntersection[] {
  const firstLetterIntersections: CellIntersection[] = [];
  for (const row of board) {
    for (const cell of row) {
      if (cell) {
        firstLetterIntersections.push(
          ...cell.intersections.filter(
            (intersection) => intersection.letterIndex === 0,
          ),
        );
      }
    }
  }
  return firstLetterIntersections;
}

export function genCrosswordBoards(words: string[]): Board[] {
  let board1: Board = Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null),
  );
  let board2: Board = Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null),
  );

  const firstWord = words[0];
  let leftWords = words.slice(1);
  board1 = placeFirstWordAtCenter(board1, firstWord, Direction.A);
  board2 = placeFirstWordAtCenter(board2, firstWord, Direction.D);

  const hashBoards: Board[][] = [];
  hashBoards.push([board1, board2]);

  let previousBoards: Board[] = hashBoards[0];

  let attempt = 0;
  while (leftWords.length > 0 && attempt < words.length * 3) {
    attempt++;
    const word = leftWords[0];

    const newBoards: Board[] = [];

    for (let j = 0; j < previousBoards.length && newBoards.length < 100; j++) {
      const beginBoard = previousBoards[j];

      const intersectionCells = findIntersectionCells(beginBoard, word);
      if (intersectionCells.length === 0) {
        continue;
      }

      for (const intersectionCell of intersectionCells) {
        const line = findIntersectionLine(beginBoard, word, intersectionCell);
        if (line) {
          const newBoard = placeWordToBoard(
            beginBoard,
            line,
            words.length - leftWords.length,
          );
          newBoards.push(newBoard);
        }
      }
    }

    if (newBoards.length === 0) {
      leftWords = leftWords.slice(1);
      leftWords.push(word);
      continue;
    }

    leftWords = leftWords.slice(1);
    previousBoards = newBoards;
    hashBoards.push(newBoards);
  }

  const finalBoards = hashBoards[hashBoards.length - 1].map((board) =>
    reduceEmptyRowAndColumn(board),
  );

  finalBoards.sort((a, b) => getBoardScore(b) - getBoardScore(a));

  const uniqueBoards: Board[] = [];
  finalBoards.forEach((board) => {
    if (
      uniqueBoards[uniqueBoards.length - 1] &&
      getBoardScore(uniqueBoards[uniqueBoards.length - 1]) ===
        getBoardScore(board)
    ) {
      return;
    } else {
      uniqueBoards.push(board);
    }
  });

  const formattedBoards = uniqueBoards.map((board) => formatBoard(board));

  return formattedBoards;
}

function formatBoard(board: Board): Board {
  const formattedBoard: Board = JSON.parse(JSON.stringify(board));

  let wordIndex = 0;
  for (let i = 0; i < formattedBoard.length; i++) {
    for (let j = 0; j < formattedBoard[i].length; j++) {
      const cell = formattedBoard[i][j];
      if (!cell) continue;

      cell.intersections.map((intersection, i) => {
        const isFirstLetter = intersection.letterIndex === 0;
        if (!isFirstLetter) return;

        cell.intersections[i].wordIndex = wordIndex;
        wordIndex++;
      });

      formattedBoard[i][j] = { ...cell, row: i, col: j };
    }
  }

  return formattedBoard;
}

export function getBoardScore(board: Board) {
  const sizeRatio = getBoardSizeRatio(board);
  const sizeRateScore = (1 - Math.abs(sizeRatio - 1)) * 100 * 100 * 100;
  const intersections = getNumberOfIntersections(board) * 100 * 100;
  const fillRate = getBoardFillRatio(board) * 100;
  return intersections + sizeRateScore + fillRate;
}

export function getBoardSizeRatio(board: Board) {
  const width = board.length;
  const height = board[0].length;
  return Math.round((width / height) * 100) / 100;
}

export function getBoardFillRatio(board: Board) {
  const filledCells = board.flat().filter((cell) => cell !== null).length;
  const totalCells = board.length * board[0].length;
  return Math.round((filledCells / totalCells) * 100) / 100;
}

export function getNumberOfIntersections(board: Board) {
  return board
    .flat()
    .filter((cell) => cell !== null && cell.intersections.length > 1).length;
}

function placeFirstWordAtCenter(
  board: Board,
  word: string,
  dir: Direction,
): Board {
  const CENTER_ROW = Math.round(BOARD_HEIGHT / 2);
  const CENTER_COL = Math.round(BOARD_WIDTH / 2);

  const START_ROW = CENTER_ROW - Math.round(word.length / 2);
  const START_COL = CENTER_COL - Math.round(word.length / 2);

  if (dir === Direction.A) {
    const line: Line = [];
    for (let i = 0; i < word.length; i++) {
      const cell = {
        letter: word[i],
        row: START_ROW,
        col: START_COL + i,
        intersections: [],
      };
      line.push(cell);
    }
    return placeWordToBoard(board, line, 0);
  }

  if (dir === Direction.D) {
    const line: Line = [];
    for (let i = 0; i < word.length; i++) {
      const cell = {
        letter: word[i],
        row: START_ROW + i,
        col: START_COL,
        intersections: [],
      };
      line.push(cell);
    }
    return placeWordToBoard(board, line, 0);
  }

  return board;
}

function findIntersectionCells(board: Board, word: string): Cell[] {
  const CENTER_ROW = Math.round(BOARD_HEIGHT / 2);
  const CENTER_COL = Math.round(BOARD_WIDTH / 2);

  function haveOneEmptyDirection(cell: Cell) {
    const { row: r, col: c } = cell;
    const left = board[r][c - 1];
    const right = board[r][c + 1];
    const top = board[r - 1][c];
    const bottom = board[r + 1][c];

    const hasEmptyVertical = !top && !bottom;
    const hasEmptyHorizontal = !left && !right;
    return hasEmptyVertical || hasEmptyHorizontal;
  }

  let range = 0;
  const cells: Cell[] = [];

  while (range < BOARD_HEIGHT / 2 && range < BOARD_WIDTH / 2) {
    const topRowI = CENTER_ROW - range;
    const bottomRowI = CENTER_ROW + range;
    const leftColI = CENTER_COL - range;
    const rightColI = CENTER_COL + range;

    for (let iC = leftColI; iC <= rightColI; iC++) {
      const topCell = board[topRowI][iC];
      if (
        topCell &&
        word.includes(topCell.letter) &&
        haveOneEmptyDirection(topCell)
      )
        cells.push(topCell);

      const bottomCell = board[bottomRowI][iC];
      if (
        bottomCell &&
        word.includes(bottomCell.letter) &&
        haveOneEmptyDirection(bottomCell)
      )
        cells.push(bottomCell);
    }

    for (let iR = topRowI + 1; iR <= bottomRowI - 1; iR++) {
      const leftCell = board[iR][leftColI];
      if (
        leftCell &&
        word.includes(leftCell.letter) &&
        haveOneEmptyDirection(leftCell)
      )
        cells.push(leftCell);

      const rightCell = board[iR][rightColI];
      if (
        rightCell &&
        word.includes(rightCell.letter) &&
        haveOneEmptyDirection(rightCell)
      )
        cells.push(rightCell);
    }

    range++;
  }

  return cells;
}

function findIntersectionLine(
  board: Board,
  word: string,
  placedCell: Cell,
): Line | null {
  let line: Line | null = null;

  const isHorizontal = Math.random() < 0.5;

  if (isHorizontal) {
    line = findHorizontalIntersections(board, word, placedCell);
    if (!line) {
      line = findVerticalIntersections(board, word, placedCell);
    }
  } else {
    line = findVerticalIntersections(board, word, placedCell);
    if (!line) {
      line = findHorizontalIntersections(board, word, placedCell);
    }
  }

  return line;
}

function findVerticalIntersections(
  board: Board,
  word: string,
  placedCell: Cell,
): Line | null {
  const letterIndex = word.indexOf(placedCell.letter);
  const intersections: Line = [];

  const col = placedCell.col;
  const headRow = placedCell.row - letterIndex;
  const tailRow = headRow + word.length - 1;

  // Debug log for error cases
  if (headRow < 0 || tailRow >= board.length) {
    console.error(`❌ BOUNDS ERROR in findVerticalIntersections:`);
    console.error(`  Word: "${word}"`);
    console.error(
      `  PlacedCell: row=${placedCell.row}, col=${placedCell.col}, letter="${placedCell.letter}"`,
    );
    console.error(`  LetterIndex: ${letterIndex}`);
    console.error(`  HeadRow: ${headRow}, TailRow: ${tailRow}`);
    console.error(`  Board length: ${board.length}`);
  }

  if (board[headRow - 1][col] || board[tailRow + 1][col]) return null;

  for (let i = 0; i < word.length; i++) {
    const row = headRow + i;

    const currentCell = board[row][col];
    const leftCell = board[row][col - 1];
    const rightCell = board[row][col + 1];

    if (currentCell) {
      if (currentCell.letter !== word[i]) return null;
    } else {
      if (leftCell || rightCell) return null;
    }

    intersections.push({ letter: word[i], row, col, intersections: [] });
  }

  if (intersections.length === 0) return null;

  return intersections;
}

function findHorizontalIntersections(
  board: Board,
  word: string,
  placedCell: Cell,
): Line | null {
  const letterIndex = word.indexOf(placedCell.letter);
  const intersections: Line = [];

  const row = placedCell.row;
  const headCol = placedCell.col - letterIndex;
  const tailCol = headCol + word.length - 1;

  if (board[row][headCol - 1] || board[row][tailCol + 1]) return null;

  for (let i = 0; i < word.length; i++) {
    const col = headCol + i;

    const currentCell = board[row][col];
    const topCell = board[row - 1][col];
    const bottomCell = board[row + 1][col];

    if (currentCell) {
      if (currentCell.letter !== word[i]) return null;
    } else {
      if (topCell || bottomCell) return null;
    }

    intersections.push({ letter: word[i], row, col, intersections: [] });
  }

  if (intersections.length === 0) return null;

  return intersections;
}

function reduceEmptyRowAndColumn(board: Board) {
  const reducedBoard = board.map((row) => row.slice());

  let i = 0;
  while (i < reducedBoard.length) {
    if (reducedBoard[i].every((cell) => cell === null)) {
      reducedBoard.splice(i, 1);
      i--;
    }
    i++;
  }

  i = 0;
  while (i < reducedBoard[0].length) {
    if (reducedBoard.every((row) => row[i] === null)) {
      reducedBoard.forEach((row) => row.splice(i, 1));
      i--;
    }
    i++;
  }

  reducedBoard.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell) {
        cell.row = rowIndex;
        cell.col = colIndex;
      }
    });
  });

  return reducedBoard;
}

function getDirection(line: Line): Direction {
  const { row: r1, col: c1 } = line[0];
  const { row: r2, col: c2 } = line[1];

  if (r1 === r2) return Direction.A;
  if (c1 === c2) return Direction.D;

  return Direction.A;
}

function placeWordToBoard(board: Board, line: Line, wordIndex: number) {
  const newBoard = board.map((row) => row.slice());

  const word = line.map((cell) => cell.letter).join('');

  for (let i = 0; i < line.length; i++) {
    const { letter, row, col } = line[i];
    const dir = getDirection(line);

    let intersections: CellIntersection[] = [
      {
        word: word,
        wordIndex: wordIndex,
        letterIndex: i,
        dir,
        xy: `${row},${col}`,
      },
    ];

    const occupiedCell = newBoard[row][col];
    if (occupiedCell) {
      intersections = [...occupiedCell.intersections, ...intersections];
    }

    newBoard[row][col] = { letter, row, col, intersections };
  }

  return newBoard;
}
