type Theme = {
  id: string,
  background: string,
  base: string,
  inputedDigit: string,
  highlightedDigit: string,
  solvedDigit: string
}

type PuzzleData = {
  difficulty: string,
  defaultPuzzle: string,
  currentPuzzle: string,
  pencilMarkings: string
}

type ViewModeType = "Completed" | "Saved";

export { Theme, PuzzleData, ViewModeType };