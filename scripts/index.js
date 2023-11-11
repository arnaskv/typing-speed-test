import { TextGenerator } from './textGenerator.js';
import { Timer } from './timer.js';
import { saveTestData, loadTestData, resetTestData } from './dataManagment.js';
import { createLineChart } from './graph.js';

const testText = document.getElementById('test-text');
const userInput = document.getElementById('user-input');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

const testTextLength = 35;
const initialTimerValue = 5;

const upArrow = '\u2191';
const downArrow = '\u2193';

let testReady = false;

function clearObjectValues(obj) {
    Object.keys(obj).forEach(key => obj[key] = null);
}

function checkCharacter() {
    const testArray = testText.querySelectorAll('span');
    const userArray = userInput.value.split('');

    testArray.forEach((charSpan, index) => {
        const char = userArray[index];
        if (char == null) {
            charSpan.classList.remove('correct');
            charSpan.classList.remove('incorrect');
        } else if (char === charSpan.innerText) {
            charSpan.classList.add('correct');
            charSpan.classList.remove('incorrect');
        } else {
            charSpan.classList.remove('correct');
            charSpan.classList.add('incorrect');
        }
    })
}

function highlightCurrentWord() {
    const testArray = testText.querySelectorAll('span');
    const inputLength = userInput.value.length;

    testArray.forEach((charSpan) => {
        charSpan.classList.remove('current-word');
    });

    if (testArray[inputLength].innerText === ' ') {
        testArray[inputLength].classList.add('current-word');
        return;
    }

    let start = 0;
    for (let i = inputLength; i > 0; i--) {
        if (testArray[i].innerText === ' ') {
            start = i + 1;
            break;
        }
    }

    let end = testArray.length - 1;
    for (let i = inputLength; i < testArray.length; i++) {
        if (testArray[i].innerText === ' ') {
            end = i - 1;
            break;
        }
    }

    for (let i = start; i <= end; i++) {
        testArray[i].classList.add('current-word');
    }
}

function checkTextCompletion(testString) {
    const inputLength = userInput.value.length;

    if (inputLength === testString.length - 1) {
        return true;
    }
    return false;
}

function getTempResults() {
    const testArray = testText.querySelectorAll('span');
    let typedWords = 0;
    let correctWords = 0;

    let correct = true;
    let typed = false;
    for (let i = 0; i < testArray.length; i++) {
        
        if (testArray[i].classList.contains('incorrect') || testArray[i].classList.contains('correct')) {
            typed = true;
            if (testArray[i].classList.contains('incorrect')) {
                correct = false;
            }
        } else {
            correct = false;
        }
        if (testArray[i].innerText === ' ') {
            if (correct) {
                correctWords++;
            }
            if (typed) {
                typedWords++;
            }
            correct = true;
            typed = false;
        }
    }
    
    let results = {'correctWords': correctWords, 'typedWords': typedWords};

    return results;
}

function calculateTestResults(results) {
    const wpm = Math.round(results.correctWords / initialTimerValue * 60);
    const accuracy = Math.round(results.correctWords / results.typedWords * 100);
    const currentDate = new Date().toISOString();
    return {date: currentDate, wpm: wpm, accuracy: accuracy};
}

function renderTestResults(results) {
    const loadedData = loadTestData();
    document.getElementById('wpm').textContent = `WPM: ${results.wpm}`;
    document.getElementById('accuracy').textContent = `ACC: ${results.accuracy}%`;

    createLineChart('stats-chart', loadedData);
    if (loadedData) {
        const wpmDiff = results.wpm - loadedData[loadedData.length - 2].wpm;
        const accuracyDiff = results.accuracy - loadedData[loadedData.length - 2].accuracy;
    
        if (wpmDiff > 0) {
            document.getElementById('wpm-diff').textContent = `${upArrow}+${wpmDiff}`;
        } else if (wpmDiff < 0) {
            document.getElementById('wpm-diff').textContent = `${downArrow}${wpmDiff}`;
        }
        if (accuracyDiff > 0) {
            document.getElementById('accuracy-diff').textContent = `${upArrow}+${accuracyDiff}`;
        } else if (accuracyDiff < 0) {
            document.getElementById('accuracy-diff').textContent = `${downArrow}${accuracyDiff}`;
        }
    }

    document.getElementById('text-row-1').style.display = 'none';
    document.getElementById('text-row-2').style.display = 'none';
    document.getElementById('stats-chart').style.display = 'block';
}

function hideTestResults() {
    document.getElementById('wpm').textContent = '';
    document.getElementById('accuracy').textContent = '';
    document.getElementById('wpm-diff').textContent = '';
    document.getElementById('accuracy-diff').textContent = '';
    document.getElementById('stats-chart').style.display = 'none';
    document.getElementById('text-row-1').style.display = 'block';
    document.getElementById('text-row-2').style.display = 'block';
}

function startTest(timer) {
    userInput.disabled = false;
    checkCharacter();
    timer.start();
}

function endTest(currentResults) {
    testReady = false;
    userInput.blur();
    userInput.disabled = true;
    
    let endResults = getTempResults();
    if (currentResults) {
        endResults.correctWords += currentResults.correctWords;
        endResults.typedWords += currentResults.typedWords;
    }

    const calculatedResults = calculateTestResults(endResults);
    
    saveTestData(calculatedResults);
    renderTestResults(calculatedResults);
    clearObjectValues(currentResults);
}

function resetTest(timer, currentResults) {
    timer.reset();
    userInput.value = '';
    highlightCurrentWord();
    checkCharacter();
    testReady = true;
    userInput.disabled = false;
    hideTestResults();
    clearObjectValues(currentResults);
}

document.addEventListener('DOMContentLoaded', () => {
    let currentResults = {'correctWords': 0, 'typedWords': 0};
    let enterPressed = false;
    let escPressed = false;

    testText.textContent = '';
    userInput.value = '';
    
    const textGenerator = new TextGenerator(testTextLength);
    const timer = new Timer(initialTimerValue, (remainingTime) => {
        timerElement.textContent = remainingTime;
    }, () => {
        endTest(currentResults);
    });

    let testString;
    textGenerator.getRenderedText().then((response) => {
        testText.innerHTML = response.htmlContent;
        testString = response.originalString;
        highlightCurrentWord();
    })
    
    testReady = true;
    userInput.disabled = false;

    document.addEventListener('keyup', (event) => {
        if (event.key.match(/\d|^[A-Za-z]$/)) {
            if (!document.activeElement.isEqualNode(userInput) && testReady) {
                userInput.value += event.key;
                checkCharacter();
                userInput.focus();
            }
            if (!timer.active && testReady) {
                startTest(timer);
            }
        }
    })

    userInput.addEventListener('input', () => {
        if (checkTextCompletion(testString)) {
            const tempResults = getTempResults();
            if (!currentResults) {
                currentResults = tempResults;
            } else {
                currentResults.correctWords += tempResults.correctWords;
                currentResults.typedWords += tempResults.typedWords;
            }
            testText.textContent = '';
            userInput.value = '';
            textGenerator.getRenderedText().then((response) => {
                testText.innerHTML = response.htmlContent;
                testString = response.originalString;
                highlightCurrentWord();
            })
        } else {
            highlightCurrentWord();
        }
        checkCharacter();
    })

    startButton.addEventListener('click', () => {
        testText.textContent = '';
        userInput.value = '';
        timer.reset();
        textGenerator.getRenderedText().then((response) => {
            testText.innerHTML = response.htmlContent;
            testString = response.originalString;
            highlightCurrentWord();
        })
        userInput.disabled = false;
        testReady = true;
        hideTestResults();
    })

    restartButton.addEventListener('click', () => {
        resetTest(timer, currentResults);
    })

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Enter' && !enterPressed) {
            enterPressed = true;
            event.preventDefault();
            testText.textContent = '';
            userInput.value = '';
            textGenerator.getRenderedText().then((response) => {
                testText.innerHTML = response.htmlContent;
                testString = response.originalString;
                highlightCurrentWord();
            })
            timer.reset();
            testReady = true;
            userInput.disabled = false;
            hideTestResults();
        }

        if (event.code === 'Escape' && !escPressed) {
            resetTest(timer, currentResults);
        }
    })

    document.addEventListener('keyup', (event) => {
        if (event.code === 'Enter' && enterPressed) {
            enterPressed = false;
        }

        if (event.code === 'Escape' && escPressed) {
            escPressed = false;
        }
    })

    document.getElementById('reset-statistics').addEventListener('click', () => {
        resetTestData();
    })
})
