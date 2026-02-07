const jest = require('jest');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log('Starting Jest programmatically...');
    try {
        const { results } = await jest.runCLI({
            runInBand: true,
            colors: false,
            json: true,
            _: []
        }, [process.cwd()]);

        console.log('Jest finished. Writing results...');

        const simplifiedResults = {
            success: results.success,
            numFailedTests: results.numFailedTests,
            numPassedTests: results.numPassedTests,
            testResults: results.testResults.map(suite => ({
                testFilePath: path.relative(process.cwd(), suite.testFilePath),
                failureMessage: suite.failureMessage,
                testResults: suite.testResults.map(test => ({
                    title: test.title,
                    status: test.status,
                    failureMessages: test.failureMessages
                }))
            }))
        };

        fs.writeFileSync('jest_results.json', JSON.stringify(simplifiedResults, null, 2));
        console.log('Results written to jest_results.json');
        process.exit(0);
    } catch (e) {
        console.error('Error running jest:', e);
        fs.writeFileSync('jest_error.txt', e.toString());
        process.exit(1);
    }
}

run();
