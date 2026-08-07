(() => {
    const search = document.getElementById('searchWorkout');
    const level = document.getElementById('filterLevel');
    const goal = document.getElementById('filterGoal');
    const clear = document.getElementById('clearWorkoutFilters');
    const rows = [...document.querySelectorAll('[data-workout-row]')];

    const applyFilters = () => {
        const term = (search?.value || '').trim().toLowerCase();
        const selectedLevel = level?.value || '';
        const selectedGoal = goal?.value || '';

        rows.forEach((row) => {
            const matchesText = row.textContent.toLowerCase().includes(term);
            const matchesLevel = !selectedLevel || row.dataset.level === selectedLevel;
            const matchesGoal = !selectedGoal || row.dataset.goal === selectedGoal;
            row.hidden = !(matchesText && matchesLevel && matchesGoal);
        });
    };

    search?.addEventListener('input', applyFilters);
    level?.addEventListener('change', applyFilters);
    goal?.addEventListener('change', applyFilters);
    clear?.addEventListener('click', () => {
        if (search) search.value = '';
        if (level) level.value = '';
        if (goal) goal.value = '';
        applyFilters();
    });

    if (typeof Chart === 'undefined') return;
    const data = window.workoutChartData || {};
    Chart.defaults.color = '#a9a9b2';
    Chart.defaults.font.family = 'Inter';

    const colors = ['#ff2d2d', '#ff5d5d', '#ff8a8a', '#b91c1c'];

    const levelCanvas = document.getElementById('levelChart');
    if (levelCanvas) {
        new Chart(levelCanvas, {
            type: 'doughnut',
            data: {
                labels: data.levels?.labels || [],
                datasets: [{
                    data: data.levels?.values || [],
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    const goalCanvas = document.getElementById('goalChart');
    if (goalCanvas) {
        new Chart(goalCanvas, {
            type: 'bar',
            data: {
                labels: data.goals?.labels || [],
                datasets: [{
                    data: data.goals?.values || [],
                    backgroundColor: colors,
                    borderRadius: 8
                }]
            },
            options: {
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, ticks: { precision: 0 } },
                    y: { grid: { display: false } }
                }
            }
        });
    }
})();
