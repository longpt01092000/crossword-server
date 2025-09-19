export type Puzzle = {
  board: Board;
  boardInfo: {
    width: number;
    height: number;
    fillRate: number;
    intersectionCount: number;
    sizeRatio: number;
    score: number;
  };
  wordClues: WordClue[];
};

export type InputWordClue = {
  word: string;
  clue: string;
};

export type WordClue = {
  word: string;
  clue: string;
  dir: Direction;
  xy: string;
};

export type Cell = {
  letter: string;
  intersections: CellIntersection[];
  row: number;
  col: number;
};

export type CellIntersection = {
  word: string;
  wordIndex: number;
  letterIndex: number;
  dir: Direction;
  xy: string;
};

export enum Direction {
  D = 'D', // Down
  A = 'A', // Across
}

export type Line = Cell[];
export type Board = Cell[][];

export const BOARD_WIDTH = 100;
export const BOARD_HEIGHT = 100;
