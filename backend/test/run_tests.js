const { exec } = require('child_process');
const path = require('path');

// 1. List all the test files you want to execute
const testFiles = [
  'auth_test_cases.js',
  'payment_test_cases.js',
  'test_cases.js',
  'user_test_cases.js',
];

function runTestFile(fileName) {
  return new Promise((resolve) => {
    const filePath = path.join(__dirname, fileName);
    
    // FIX: Wrap the path in escaped double quotes \" so Windows handles spaces correctly
    exec(`npx mocha "${filePath}"`, (error, stdout, stderr) => {
      const passed = !error && !stderr;
      
      resolve({
        fileName,
        rawOutput: stdout + '\n' + stderr,
        failedFile: !!error
      });
    });
  });
}

async function main() {
  console.log("🚀 Running CI/CD Test Suite and parsing individual cases...\n");

  const results = await Promise.all(testFiles.map(runTestFile));
  
  const allParsedRows = [];
  let globalTestCaseCounter = 1;
  let hasAnyFailure = false;

  results.forEach(result => {
    // Split the terminal output line by line
    const lines = result.rawOutput.split('\n');
    let dynamicSuiteName = result.fileName;

    lines.forEach(line => {
        // console.log(line);
      const trimmed = line.trim();

      // Track the header blocks (e.g., "registerUser Function Test") to use as context
      if (trimmed && !trimmed.startsWith('✔') && !trimmed.startsWith('✖') && !trimmed.startsWith('❌')) {
        dynamicSuiteName = trimmed;
        return;
      }

      // Check if the line contains a test case result symbol
      const isPass = trimmed.startsWith('✔') || trimmed.startsWith('✅');
      // Match failing patterns: ❌, ✖, or a number followed by a bracket like "1)"
      const isFail = trimmed.startsWith('❌') || trimmed.startsWith('✖') || /^\d+\)/.test(trimmed);

      // 2. If it's a test case, process it into the table array
      if (isPass || isFail) {
        if (isFail) {
          hasAnyFailure = true;
        }

        // Clean up the test name text by removing the checkmark or the "1)" prefix
        let testName = trimmed;
        if (isPass) {
          testName = trimmed.replace(/^[✔✅]\s*/, '');
        } else {
          testName = trimmed.replace(/^\d+\)\s*/, '').replace(/^[❌✖]\s*/, '');
        }

        allParsedRows.push({
          "Test Case #": globalTestCaseCounter++,
          "Suite / Context": dynamicSuiteName,
          "Name": testName,
          "Expected Outcome": "Pass without errors",
          "Outcome": isPass ? "Completed successfully" : "Test failed / Assertion errored",
          "Status": isPass ? "✅ PASSED" : "❌ FAILED"
        });
        return;
      }

      // 3. Context tracking: If the line doesn't state total passing/failing summaries, 
      // treat it as the current Suite header (e.g., "registerUser Function Test")
      if (!trimmed.includes('passing') && !trimmed.includes('failing') && !trimmed.includes('Error:')) {
        dynamicSuiteName = trimmed;
      }
    });
  });

  // Output the clean summary matrix table
  console.table(allParsedRows);

  // CI/CD Enforcer
  if (hasAnyFailure) {
    console.error("\n❌ CI/CD Build Failed: Framework reported test case failures.");
    process.exit(1);
  } else {
    console.log("\n✨ All individual test cases passed successfully!");
    process.exit(0);
  }
}

main();