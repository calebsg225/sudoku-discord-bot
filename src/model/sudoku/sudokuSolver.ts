class SudokuSolver {
  constructor() {}
  
  // checks that current puzzle is a valid sudoku solution
  // returns true if valid, false if not
  check = (puzzle: string): boolean => {
    const rows = Array.from(Array(9), () => new Set<number>());
    const cols = Array.from(Array(9), () => new Set<number>());
    const grids = Array.from(Array(9), () => new Set<number>());

    for (let i = 0; i < puzzle.length; i++) {
      // if any digit is 0, the puzzle is not solved
      if (!+puzzle[i]) return false

      const col = i%9;
      const row = (i-col)/9;
      const grid = 3*Math.floor(row/3) + Math.floor(col/3);

      // checks to see that new digit is unique in its row, column, and subgrid
      if (rows[row].size === rows[row].add(+puzzle[i]).size) return false;
      if (cols[col].size === cols[col].add(+puzzle[i]).size) return false;
      if (grids[grid].size === grids[grid].add(+puzzle[i]).size) return false;
    }

    return true;
  }

  // converts a sudoku in string form to a 2d array
  // res[row][col]
  private stringToArray = (puzzle: string): number[][] => {
    const res: number[][] = [];
    for (let i = 0; i < 9; i++) {
      const row = [];
      for (let j = 0; j < 9; j++) {
        row.push(puzzle[i*9+j]);
      }
      res.push(row);
    }
    return res;
  }

  solve = () => {}

  // faster solver
  // dancing links algorithm
  dlx = () => {}

  // slower solver
  // backtracking algorithm
  backtracking = () => {}
}

export default SudokuSolver;