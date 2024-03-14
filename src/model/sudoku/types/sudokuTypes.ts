type Theme = {
  id: string,
  background: string,
  base: string,
  inputedDigit: string,
  highlightDigit: string,
  solvedDigit: string
}

type PuzzleData = {
  difficulty: string,
  defaultPuzzle: string,
  currentPuzzle: string,
  pencilMarkings: string
}

export { Theme, PuzzleData };