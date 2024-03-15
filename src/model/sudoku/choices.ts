// choices for commands with difficulty selection

import sudokuThemes from '../../data/sudokuThemes.json';

const difficultyChoices = [
  { name: 'Easy', value: 'Easy' },
  { name: 'Medium', value: 'Medium' },
  { name: 'Hard', value: 'Hard' },
  { name: 'Diabolical', value: 'Diabolical' }
];

// theme choices for theme command
const themeChoices = [];

for (const theme in sudokuThemes) {
  themeChoices.push({ name: `${theme.substring(0,1).toUpperCase()}${theme.substring(1)}`, value: theme });
}

// save data choices

const decisionChoices = [
  { name: 'Yes', value: '1' },
  { name: 'No', value: '0' }
];

export { difficultyChoices, themeChoices, decisionChoices };