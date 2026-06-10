const fs = require('fs');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const xlsx = require('xlsx');

const reportPath = path.join(__dirname, '..', 'reports', 'selenium-test-report.xlsx');
const records = [];

function addRecord(testCase, status, startedAt, endedAt, details) {
    const duration = ((endedAt - startedAt) / 1000).toFixed(2);
    records.push({
        'Test Case': testCase,
        'Status': status,
        'Started At': startedAt.toISOString(),
        'Ended At': endedAt.toISOString(),
        'Duration (s)': duration,
        'Details': details
    });
}

function writeReport() {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    const wsData = [
        ['Test Case', 'Status', 'Started At', 'Ended At', 'Duration (s)', 'Details'],
        ...records.map(row => [row['Test Case'], row['Status'], row['Started At'], row['Ended At'], row['Duration (s)'], row['Details']])
    ];
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(wsData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Selenium Report');
    xlsx.writeFile(workbook, reportPath);
    console.log(`\nReport generated: ${reportPath}`);
}

(async function runAutomationTest() {
    const testStart = new Date();
    const stepStart = new Date();
    let driver = null;
    let finalStatus = 'PASS';
    let finalDetails = 'All steps completed successfully.';

    try {
        // Setup Chrome options for headless execution by default.
        let options = new chrome.Options();
        const isHeadless = process.env.HEADLESS !== 'false';
        if (isHeadless) {
            options.addArguments(
                '--headless=new',
                '--disable-gpu',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1920,1080'
            );
        }

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        console.log('Starting Selenium E2E Test...');

        // Step 1: Open the local web application
        stepStart.setTime(Date.now());
        await driver.get('http://localhost:3000');
        await driver.wait(until.titleContains('SmartNotes'), 5000);
        addRecord('Open web app', 'PASS', new Date(stepStart), new Date(), 'Loaded localhost app successfully');
        console.log('✓ Web Page Loaded Successfully');

        // Step 2: Locate the text area and input study notes
        stepStart.setTime(Date.now());
        let inputArea = await driver.findElement(By.id('content-input'));
        await inputArea.sendKeys('Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water.');
        addRecord('Enter notes', 'PASS', new Date(stepStart), new Date(), 'Entered sample study content');
        console.log('✓ Input text entered');

        // Step 3: Click the Summarize button
        stepStart.setTime(Date.now());
        let summarizeBtn = await driver.findElement(By.id('btn-summarize'));
        await summarizeBtn.click();
        addRecord('Click summarize', 'PASS', new Date(stepStart), new Date(), 'Clicked Summarize button');
        console.log('✓ Summarize button clicked');

        // Step 4: Wait for result to appear
        stepStart.setTime(Date.now());
        let resultDisplay = await driver.findElement(By.id('result-display'));
        await driver.wait(async () => {
            const text = await resultDisplay.getText();
            return text !== '' && text !== 'Processing...';
        }, 15000);
        const finalResult = await resultDisplay.getText();
        addRecord('Verify result', 'PASS', new Date(stepStart), new Date(), `Result length: ${finalResult.length}`);
        console.log('✓ Test Result Received:', finalResult.substring(0, 50) + '...');

        console.log('\n[SUCCESS] E2E Automation Test Passed!');
    } catch (error) {
        finalStatus = 'FAIL';
        finalDetails = error.message || String(error);
        const failedAt = new Date();
        addRecord('Test execution', 'FAIL', testStart, failedAt, finalDetails);
        console.error('\n[FAILURE] Test execution failed:', error);
    } finally {
        if (driver) {
            await driver.quit();
        }
        const testEnd = new Date();
        if (finalStatus === 'PASS') {
            addRecord('Overall test', 'PASS', testStart, testEnd, 'Selenium test completed successfully.');
        } else {
            addRecord('Overall test', 'FAIL', testStart, testEnd, finalDetails);
        }
        writeReport();
    }
})();
