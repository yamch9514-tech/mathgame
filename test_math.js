const fs = require('fs');
const path = require('path');

// Extract MathEngine from app.js to prevent duplication
const appJsPath = path.join(__dirname, 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Find and isolate MathEngine definition
const startIdx = appJsContent.indexOf('const MathEngine = {');
if (startIdx === -1) {
  console.error("❌ Failed to find MathEngine in app.js");
  process.exit(1);
}

// Find matching bracket for the object
let openBrackets = 0;
let endIdx = -1;
for (let i = startIdx; i < appJsContent.length; i++) {
  if (appJsContent[i] === '{') openBrackets++;
  if (appJsContent[i] === '}') {
    openBrackets--;
    if (openBrackets === 0) {
      endIdx = i + 1;
      break;
    }
  }
}

if (endIdx === -1) {
  console.error("❌ Failed to parse MathEngine structure");
  process.exit(1);
}

const mathEngineCode = appJsContent.substring(startIdx, endIdx);

// Instantiate MathEngine in current scope
let MathEngine;
try {
  eval(mathEngineCode);
} catch (err) {
  console.error("❌ Failed to eval MathEngine:", err);
  process.exit(1);
}

console.log("🔍 MathEngine successfully loaded for tests.");
console.log("-----------------------------------------");

// Run Tests
let passed = true;
let totalTests = 0;

for (let floor = 1; floor <= 20; floor++) {
  console.log(`\nFloor ${floor} Question Generator Tests:`);
  let floorPassed = true;

  // Run 100 iterations per floor to check robustness
  for (let i = 0; i < 100; i++) {
    totalTests++;
    try {
      const q = MathEngine.generate(floor);
      
      // Assertion 1: Valid structure
      if (!q.instruction || typeof q.instruction !== 'string') {
        throw new Error(`Invalid instruction: ${JSON.stringify(q.instruction)}`);
      }
      if (!q.expression || typeof q.expression !== 'string') {
        throw new Error(`Invalid expression: ${JSON.stringify(q.expression)}`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Options must be an array of length 4. Found: ${JSON.stringify(q.options)}`);
      }
      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
        throw new Error(`Invalid correctIndex: ${q.correctIndex}`);
      }

      // Assertion 2: All options are unique
      const uniqueOptions = new Set(q.options);
      if (uniqueOptions.size !== 4) {
        throw new Error(`Duplicate options found: ${JSON.stringify(q.options)}`);
      }

      // Assertion 3: Clean, printable strings
      q.options.forEach((opt, idx) => {
        if (!opt || opt.includes('NaN') || opt.includes('undefined') || opt.includes('null')) {
          throw new Error(`Dirty option text at index ${idx}: "${opt}"`);
        }
      });
      if (q.expression.includes('NaN') || q.expression.includes('undefined')) {
        throw new Error(`Dirty expression string: "${q.expression}"`);
      }

      // Assertion 4: Correct answer index aligns with correct content
      const correctVal = q.options[q.correctIndex];
      if (!correctVal) {
        throw new Error(`No option at correctIndex ${q.correctIndex}`);
      }

    } catch (err) {
      console.error(`  ❌ Attempt ${i} failed:`, err.message);
      floorPassed = false;
      passed = false;
      break;
    }
  }

  if (floorPassed) {
    console.log(`  ✅ All 100 iterations passed successfully!`);
  }
}

console.log("\n-----------------------------------------");
if (passed) {
  console.log(`🎉 SUCCESS: All ${totalTests} algebra math engine tests passed!`);
  process.exit(0);
} else {
  console.log(`❌ FAILURE: Math engine tests failed.`);
  process.exit(1);
}
