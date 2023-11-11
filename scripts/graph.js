let lineChart;

export function createLineChart(canvasId, typingResults) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (lineChart) {
        lineChart.destroy();
    }

    if (typingResults) {

        const ctx = document.getElementById(canvasId).getContext('2d');

        const formattedData = typingResults.map(result => ({
            date: new Date(result.date),
            wpm: result.wpm,
            accuracy: result.accuracy
        }));

        const labels = formattedData.map((_, index) => index);
        const wpmData = formattedData.map(entry => entry.wpm);
        const accuracyData = formattedData.map(entry => entry.accuracy);

        lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'WPM',
                    data: wpmData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: false
                }, {
                    label: 'Accuracy',
                    data: accuracyData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom'
                    },
                    y: {
                        min: 0
                    }
                },
            }
        });

        return lineChart;
    }
}