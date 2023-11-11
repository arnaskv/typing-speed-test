export function saveTestData(results) {
    const existingResults = JSON.parse(localStorage.getItem('typing-results')) || [];
    existingResults.push(results);
    localStorage.setItem('typing-results', JSON.stringify(existingResults));
}

export function loadTestData() {
    const loadedData = JSON.parse(localStorage.getItem('typing-results'));
    return loadedData;
}

export function resetTestData() {
    localStorage.removeItem('typing-results');
}