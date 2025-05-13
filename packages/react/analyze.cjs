// @ts-ignore
// Color Usage Analyzer
// This script will scan your codebase and report on color usage patterns

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configure these paths for your project
const ROOT_DIR = './src'; // Adjust this to your project's source directory
const FILE_PATTERNS = ['**/*.tsx', '**/*.jsx', '**/*.js', '**/*.ts', '**/*.css'];

// Color scales we want to analyze
const COLOR_SCALES = [
  'primary', 'primaryA', 
  'secondary', 'secondaryA', 
  'base', 'baseA',
  // Add any other color scales you use
];

// Initialize result structure
const results = {
  totalFiles: 0,
  filesWithColors: 0,
  colorUsage: {},
  colorsByFile: {},
  mostUsedColors: [],
};

// Initialize color usage counters
COLOR_SCALES.forEach(scale => {
  results.colorUsage[scale] = {};
  for (let i = 1; i <= 12; i++) {
    results.colorUsage[scale][i] = 0;
  }
});

// Regular expression to match Tailwind color classes
// This pattern looks for text-primary-1, bg-secondary-2, etc.
const colorPattern = new RegExp(`(text|bg|border|ring|fill|stroke|shadow|outline|accent)-(${COLOR_SCALES.join('|')})-(\\d{1,2})`, 'g');

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(colorPattern)];
  
  if (matches.length > 0) {
    results.filesWithColors++;
    results.colorsByFile[filePath] = [];
    
    matches.forEach(match => {
      const [fullMatch, prefix, scale, number] = match;
      
      // Record this color usage
      if (results.colorUsage[scale] && results.colorUsage[scale][number] !== undefined) {
        results.colorUsage[scale][number]++;
        
        // Also record which files use which colors
        const colorId = `${prefix}-${scale}-${number}`;
        if (!results.colorsByFile[filePath].includes(colorId)) {
          results.colorsByFile[filePath].push(colorId);
        }
      }
    });
  }
}

function findFiles() {
  let allFiles = [];
  FILE_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, { cwd: ROOT_DIR, absolute: true });
    allFiles = allFiles.concat(files);
  });
  return [...new Set(allFiles)]; // Remove duplicates
}

function generateMostUsedColors() {
  const allColors = [];
  
  // Flatten the color usage data
  Object.entries(results.colorUsage).forEach(([scale, numbers]) => {
    Object.entries(numbers).forEach(([number, count]) => {
      if (count > 0) {
        allColors.push({
          color: `${scale}-${number}`,
          count: count
        });
      }
    });
  });
  
  // Sort by usage count (descending)
  allColors.sort((a, b) => b.count - a.count);
  
  return allColors;
}

// Main execution
function analyzeColors() {
  console.log('Starting color usage analysis...');
  
  const files = findFiles();
  results.totalFiles = files.length;
  
  files.forEach(file => {
    analyzeFile(file);
  });
  
  results.mostUsedColors = generateMostUsedColors();
  
  // Output the results
  console.log(`\nAnalysis complete! Scanned ${results.totalFiles} files, found colors in ${results.filesWithColors} files.`);
  console.log('\nMost used colors:');
  results.mostUsedColors.slice(0, 20).forEach(color => {
    console.log(`  ${color.color}: ${color.count} uses`);
  });
  
  // Write detailed results to a JSON file
  fs.writeFileSync('color-analysis-results.json', JSON.stringify(results, null, 2));
  console.log('\nDetailed results written to color-analysis-results.json');
  }


analyzeColors();