(() => {
    const data = window.dashboardData || {};
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = '#a9a9b2';
    Chart.defaults.borderColor = 'rgba(255,255,255,.07)';
    Chart.defaults.font.family = 'Inter';

    const weekly = document.getElementById('weeklyChart');
    if (weekly) {
        new Chart(weekly, {
            type: 'bar',
            data: {
                labels: data.weekLabels || [],
                datasets: [{
                    label: 'Treinos',
                    data: data.weekValues || [],
                    backgroundColor: 'rgba(255,45,45,.78)',
                    borderColor: '#ff2d2d',
                    borderWidth: 1,
                    borderRadius: 10,
                    maxBarThickness: 42
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
    }

    const weight = document.getElementById('weightChart');
    if (weight) {
        new Chart(weight, {
            type: 'line',
            data: {
                labels: data.weightLabels || [],
                datasets: [{
                    label: 'Peso (kg)',
                    data: data.weightValues || [],
                    borderColor: '#ff3535',
                    backgroundColor: 'rgba(255,53,53,.13)',
                    fill: true,
                    tension: .38,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#ff3535',
                    pointBorderWidth: 2
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } } }
            }
        });
    }
})();
