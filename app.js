(() => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('menuToggle');

    const closeMenu = () => {
        sidebar?.classList.remove('open');
        overlay?.classList.remove('show');
    };

    toggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('show');
    });

    overlay?.addEventListener('click', closeMenu);

    document.querySelectorAll('[data-close-alert]').forEach((button) => {
        button.addEventListener('click', () => button.closest('[data-alert]')?.remove());
    });

    window.setTimeout(() => {
        document.querySelector('[data-alert]')?.classList.add('fade-out');
    }, 4500);

    const foodSearch = document.getElementById('foodSearch');
    foodSearch?.addEventListener('input', () => {
        const value = foodSearch.value.trim().toLowerCase();
        document.querySelectorAll('[data-food-row]').forEach((row) => {
            row.hidden = !row.textContent.toLowerCase().includes(value);
        });
    });

    const workoutForm = document.getElementById('workoutForm');
    if (workoutForm) {
        const workoutStorageKey = 'fitnessWorkouts';
        const goalsStorageKey = 'fitnessWorkoutGoals';
        const workoutTableBody = document.getElementById('workoutTableBody');
        const workoutsCount = document.getElementById('workoutsCount');
        const workoutsCompleted = document.getElementById('workoutsCompleted');
        const workoutsTotalTime = document.getElementById('workoutsTotalTime');
        const workoutsProgress = document.getElementById('workoutsProgress');
        const streakCount = document.getElementById('streakCount');
        const weeklyGoalInput = document.getElementById('weeklyGoalInput');
        const monthlyGoalInput = document.getElementById('monthlyGoalInput');
        const weeklyGoalFill = document.getElementById('weeklyGoalFill');
        const monthlyGoalFill = document.getElementById('monthlyGoalFill');
        const weeklyGoalText = document.getElementById('weeklyGoalText');
        const monthlyGoalText = document.getElementById('monthlyGoalText');
        const workoutProgressChart = document.getElementById('workoutProgressChart');
        const workoutSearch = document.getElementById('workoutSearch');
        const filterMuscle = document.getElementById('filterMuscle');
        const filterDifficulty = document.getElementById('filterDifficulty');
        const filterDay = document.getElementById('filterDay');
        const cancelWorkoutEdit = document.getElementById('cancelWorkoutEdit');
        const workoutSubmitBtn = document.getElementById('workoutSubmitBtn');
        const workoutId = document.getElementById('workoutId');
        const inputWorkoutName = document.getElementById('inputWorkoutName');
        const inputWorkoutCategory = document.getElementById('inputWorkoutCategory');
        const inputWorkoutMuscle = document.getElementById('inputWorkoutMuscle');
        const inputWorkoutDifficulty = document.getElementById('inputWorkoutDifficulty');
        const inputWorkoutDay = document.getElementById('inputWorkoutDay');
        const inputWorkoutDuration = document.getElementById('inputWorkoutDuration');
        const inputWorkoutExercises = document.getElementById('inputWorkoutExercises');
        const routineDaysGroup = document.getElementById('routineDaysGroup');

        let workouts = JSON.parse(localStorage.getItem(workoutStorageKey) || '[]');
        let goals = JSON.parse(localStorage.getItem(goalsStorageKey) || JSON.stringify({ weekly: 0, monthly: 0 }));
        let editingWorkoutId = '';

        const saveWorkouts = () => {
            localStorage.setItem(workoutStorageKey, JSON.stringify(workouts));
        };

        const saveGoals = () => {
            localStorage.setItem(goalsStorageKey, JSON.stringify(goals));
        };

        let workoutChart;

        const getStreak = () => {
            const completedDays = Array.from(new Set(workouts.filter((w) => w.completed).map((workout) => workout.day)));
            return completedDays.length;
        };

        const getCompletedCount = () => workouts.filter((workout) => workout.completed).length;

        const updateGoalProgress = () => {
            const completedCount = getCompletedCount();
            const weeklyGoal = Number(goals.weekly || 0);
            const monthlyGoal = Number(goals.monthly || 0);
            const weeklyProgress = weeklyGoal ? Math.min(100, Math.round((completedCount / weeklyGoal) * 100)) : 0;
            const monthlyProgress = monthlyGoal ? Math.min(100, Math.round((completedCount / monthlyGoal) * 100)) : 0;

            weeklyGoalInput.value = weeklyGoal || '';
            monthlyGoalInput.value = monthlyGoal || '';
            weeklyGoalFill.style.width = `${weeklyProgress}%`;
            monthlyGoalFill.style.width = `${monthlyProgress}%`;
            weeklyGoalText.textContent = `${completedCount} de ${weeklyGoal} treinos concluídos`;
            monthlyGoalText.textContent = `${completedCount} de ${monthlyGoal} treinos concluídos`;
        };

        const getChartData = () => {
            const labels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
            const counts = labels.map((day) => workouts.filter((w) => w.completed && w.day === day).length);
            return { labels, counts };
        };

        const renderWorkoutChart = () => {
            if (!workoutProgressChart) return;
            const chartData = getChartData();

            if (!workoutChart) {
                workoutChart = new Chart(workoutProgressChart, {
                    type: 'bar',
                    data: {
                        labels: chartData.labels,
                        datasets: [{
                            label: 'Treinos concluídos',
                            data: chartData.counts,
                            backgroundColor: 'rgba(255, 69, 69, 0.75)',
                            borderRadius: 8,
                            barThickness: 24,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { color: '#ddd' } },
                            y: { beginAtZero: true, ticks: { color: '#ddd', stepSize: 1 } }
                        }
                    }
                });
            } else {
                workoutChart.data.labels = chartData.labels;
                workoutChart.data.datasets[0].data = chartData.counts;
                workoutChart.update();
            }
        };

        const updateWorkoutStats = () => {
            const completedCount = getCompletedCount();
            const totalTime = workouts.reduce((sum, workout) => sum + Number(workout.duration || 0), 0);
            const totalCount = workouts.length;
            const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
            const streak = getStreak();

            workoutsCount.textContent = totalCount;
            workoutsCompleted.textContent = completedCount;
            workoutsTotalTime.textContent = `${totalTime} min`;
            workoutsProgress.textContent = `${progress}%`;
            streakCount.textContent = streak;
            updateGoalProgress();
            renderWorkoutChart();
        };

        const formatStatusTag = (completed) => {
            return completed
                ? '<span class="tag" style="border-color: rgba(43, 213, 118, .3); background: rgba(43, 213, 118, .12); color: #b9ffd2;">Completo</span>'
                : '<span class="tag" style="border-color: rgba(255, 69, 69, .3); background: rgba(255, 69, 69, .08); color: #ffd5d5;">Pendente</span>';
        };

        const getWorkoutFilters = () => {
            const search = workoutSearch.value.trim().toLowerCase();
            const muscle = filterMuscle.value;
            const difficulty = filterDifficulty.value;
            const day = filterDay.value;

            return workouts.filter((workout) => {
                const matchesSearch = workout.name.toLowerCase().includes(search);
                const matchesMuscle = muscle ? workout.muscle === muscle : true;
                const matchesDifficulty = difficulty ? workout.difficulty === difficulty : true;
                const matchesDay = day ? workout.day === day : true;
                return matchesSearch && matchesMuscle && matchesDifficulty && matchesDay;
            });
        };

        const renderWorkoutTable = () => {
            const visibleWorkouts = getWorkoutFilters();
            workoutTableBody.innerHTML = '';

            if (!visibleWorkouts.length) {
                workoutTableBody.innerHTML = '<tr><td colspan="8" class="empty-state">Nenhum treino encontrado. Adicione um novo ou ajuste os filtros.</td></tr>';
                updateWorkoutStats();
                return;
            }

            visibleWorkouts.forEach((workout) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${workout.name}</td>
                    <td>${workout.category || '—'}</td>
                    <td>${workout.muscle}</td>
                    <td>${workout.difficulty}</td>
                    <td>${workout.day}</td>
                    <td>${workout.exercises || '—'}</td>
                    <td>${formatStatusTag(workout.completed)}</td>
                    <td class="action-row">
                        <button class="icon-btn success" data-action="toggle" data-id="${workout.id}" title="Marcar como concluído"><i class="fa-solid fa-check"></i></button>
                        <button class="icon-btn edit" data-action="edit" data-id="${workout.id}" title="Editar treino"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn danger" data-action="delete" data-id="${workout.id}" title="Excluir treino"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                workoutTableBody.appendChild(row);
            });
            updateWorkoutStats();
        };

        const resetWorkoutForm = () => {
            workoutId.value = '';
            editingWorkoutId = '';
            workoutForm.reset();
            workoutSubmitBtn.textContent = 'Adicionar treino';
            cancelWorkoutEdit.classList.add('hidden');
            routineDaysGroup.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => checkbox.checked = false);
        };

        const fillWorkoutForm = (workout) => {
            editingWorkoutId = workout.id;
            workoutId.value = workout.id;
            inputWorkoutName.value = workout.name;
            inputWorkoutCategory.value = workout.category || 'Força';
            inputWorkoutMuscle.value = workout.muscle;
            inputWorkoutDifficulty.value = workout.difficulty;
            inputWorkoutDay.value = workout.day;
            inputWorkoutDuration.value = workout.duration;
            inputWorkoutExercises.value = workout.exercises || '';
            routineDaysGroup.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
                checkbox.checked = workout.routineDays?.includes(checkbox.value) || false;
            });
            workoutSubmitBtn.textContent = 'Atualizar treino';
            cancelWorkoutEdit.classList.remove('hidden');
        };

        workoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const workoutData = {
                id: editingWorkoutId || `w-${Date.now()}`,
                name: inputWorkoutName.value.trim(),
                category: inputWorkoutCategory.value,
                muscle: inputWorkoutMuscle.value,
                difficulty: inputWorkoutDifficulty.value,
                day: inputWorkoutDay.value,
                duration: Number(inputWorkoutDuration.value),
                exercises: inputWorkoutExercises.value.trim(),
                routineDays: Array.from(routineDaysGroup.querySelectorAll('input[type="checkbox"]'))
                    .filter((checkbox) => checkbox.checked)
                    .map((checkbox) => checkbox.value),
                completed: false,
            };

            if (!workoutData.name) return;

            if (editingWorkoutId) {
                workouts = workouts.map((workout) => workout.id === workoutData.id ? { ...workout, ...workoutData, completed: workout.completed } : workout);
            } else {
                workouts.push(workoutData);
            }

            saveWorkouts();
            renderWorkoutTable();
            resetWorkoutForm();
        });

        workoutTableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action]');
            if (!button) return;
            const action = button.dataset.action;
            const id = button.dataset.id;
            const workout = workouts.find((item) => item.id === id);
            if (!workout) return;

            if (action === 'toggle') {
                workout.completed = !workout.completed;
                saveWorkouts();
                renderWorkoutTable();
            }
            if (action === 'edit') {
                fillWorkoutForm(workout);
            }
            if (action === 'delete') {
                workouts = workouts.filter((item) => item.id !== id);
                saveWorkouts();
                renderWorkoutTable();
                if (editingWorkoutId === id) resetWorkoutForm();
            }
        });

        workoutSearch?.addEventListener('input', renderWorkoutTable);
        filterMuscle?.addEventListener('change', renderWorkoutTable);
        filterDifficulty?.addEventListener('change', renderWorkoutTable);
        filterDay?.addEventListener('change', renderWorkoutTable);
        weeklyGoalInput?.addEventListener('input', () => {
            goals.weekly = Number(weeklyGoalInput.value || 0);
            saveGoals();
            updateGoalProgress();
        });
        monthlyGoalInput?.addEventListener('input', () => {
            goals.monthly = Number(monthlyGoalInput.value || 0);
            saveGoals();
            updateGoalProgress();
        });
        cancelWorkoutEdit?.addEventListener('click', resetWorkoutForm);

        updateGoalProgress();
        renderWorkoutChart();
        renderWorkoutTable();
    }

    const mealForm = document.getElementById('mealForm');
    if (mealForm) {
        const mealStorageKey = 'fitnessMeals';
        const mealTableBody = document.getElementById('mealTableBody');
        const mealsCount = document.getElementById('mealsCount');
        const caloriesTotal = document.getElementById('caloriesTotal');
        const proteinTotal = document.getElementById('proteinTotal');
        const carbsTotal = document.getElementById('carbsTotal');
        const fatTotal = document.getElementById('fatTotal');
        const mealTypeFilter = document.getElementById('mealTypeFilter');
        const cancelMealEdit = document.getElementById('cancelMealEdit');
        const mealSubmitBtn = document.getElementById('mealSubmitBtn');
        const mealId = document.getElementById('mealId');
        const inputMealDescription = document.getElementById('inputMealDescription');
        const inputMealType = document.getElementById('inputMealType');
        const inputMealCalories = document.getElementById('inputMealCalories');
        const inputMealProtein = document.getElementById('inputMealProtein');
        const inputMealCarbs = document.getElementById('inputMealCarbs');
        const inputMealFat = document.getElementById('inputMealFat');

        let meals = JSON.parse(localStorage.getItem(mealStorageKey) || '[]');
        let editingMealId = '';

        const saveMeals = () => {
            localStorage.setItem(mealStorageKey, JSON.stringify(meals));
        };

        const getMealFilters = () => {
            const type = mealTypeFilter?.value || '';
            return meals.filter((meal) => {
                return type ? meal.type === type : true;
            });
        };

        const updateMealStats = () => {
            const totalMeals = meals.length;
            const totalCalories = meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
            const totalProtein = meals.reduce((sum, meal) => sum + Number(meal.protein || 0), 0);
            const totalCarbs = meals.reduce((sum, meal) => sum + Number(meal.carbs || 0), 0);
            const totalFat = meals.reduce((sum, meal) => sum + Number(meal.fat || 0), 0);

            mealsCount.textContent = totalMeals;
            caloriesTotal.textContent = totalCalories;
            proteinTotal.textContent = `${totalProtein}g`;
            carbsTotal.textContent = `${totalCarbs}g`;
            if (fatTotal) fatTotal.textContent = `${totalFat}g`;
        };

        const renderMealTable = () => {
            const visibleMeals = getMealFilters();
            mealTableBody.innerHTML = '';

            if (!visibleMeals.length) {
                mealTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhuma refeição registrada. Adicione a primeira refeição.</td></tr>';
                updateMealStats();
                return;
            }

            visibleMeals.forEach((meal) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${meal.description}</td>
                    <td>${meal.type}</td>
                    <td>${meal.calories}</td>
                    <td>${meal.protein}g</td>
                    <td>${meal.carbs}g</td>
                    <td class="action-row">
                        <button class="icon-btn edit" data-action="edit" data-id="${meal.id}" title="Editar refeição"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn danger" data-action="delete" data-id="${meal.id}" title="Excluir refeição"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                mealTableBody.appendChild(row);
            });
            updateMealStats();
        };

        const resetMealForm = () => {
            mealId.value = '';
            editingMealId = '';
            mealForm.reset();
            mealSubmitBtn.textContent = 'Adicionar refeição';
            cancelMealEdit.classList.add('hidden');
        };

        const fillMealForm = (meal) => {
            editingMealId = meal.id;
            mealId.value = meal.id;
            inputMealDescription.value = meal.description;
            inputMealType.value = meal.type || 'Café da manhã';
            inputMealCalories.value = meal.calories;
            inputMealProtein.value = meal.protein;
            inputMealCarbs.value = meal.carbs;
            inputMealFat.value = meal.fat || 0;
            mealSubmitBtn.textContent = 'Atualizar refeição';
            cancelMealEdit.classList.remove('hidden');
        };

        mealForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const mealData = {
                id: editingMealId || `m-${Date.now()}`,
                description: inputMealDescription.value.trim(),
                type: inputMealType.value,
                calories: Number(inputMealCalories.value),
                protein: Number(inputMealProtein.value),
                carbs: Number(inputMealCarbs.value),
                fat: Number(inputMealFat.value) || 0,
            };

            if (!mealData.description) return;

            if (editingMealId) {
                meals = meals.map((meal) => meal.id === mealData.id ? { ...meal, ...mealData } : meal);
            } else {
                meals.push(mealData);
            }

            saveMeals();
            renderMealTable();
            resetMealForm();
        });

        mealTableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action]');
            if (!button) return;
            const action = button.dataset.action;
            const id = button.dataset.id;
            const meal = meals.find((item) => item.id === id);
            if (!meal) return;

            if (action === 'edit') {
                fillMealForm(meal);
            }
            if (action === 'delete') {
                meals = meals.filter((item) => item.id !== id);
                saveMeals();
                renderMealTable();
                if (editingMealId === id) resetMealForm();
            }
        });

        const initMealSuggestions = () => {
            document.querySelectorAll('.suggestion-add').forEach((button) => {
                button.addEventListener('click', () => {
                    inputMealDescription.value = button.dataset.description || '';
                    inputMealType.value = button.dataset.type || 'Almoço';
                    inputMealCalories.value = button.dataset.calories || 0;
                    inputMealProtein.value = button.dataset.protein || 0;
                    inputMealCarbs.value = button.dataset.carbs || 0;
                    inputMealFat.value = button.dataset.fat || 0;
                });
            });
        };

        mealTypeFilter?.addEventListener('change', renderMealTable);
        cancelMealEdit?.addEventListener('click', resetMealForm);
        initMealSuggestions();
        renderMealTable();
    }

    const cardioForm = document.getElementById('cardioForm');
    if (cardioForm) {
        const cardioKey = 'fitnessCardio';
        const cardioTableBody = document.getElementById('cardioTableBody');
        const runDistanceTotal = document.getElementById('runDistanceTotal');
        const walkDistanceTotal = document.getElementById('walkDistanceTotal');
        const runHoursTotal = document.getElementById('runHoursTotal');
        const walkHoursTotal = document.getElementById('walkHoursTotal');
        const cancelCardioEdit = document.getElementById('cancelCardioEdit');
        const cardioSubmitBtn = document.getElementById('cardioSubmitBtn');
        const cardioId = document.getElementById('cardioId');
        const inputCardioType = document.getElementById('inputCardioType');
        const inputCardioDistance = document.getElementById('inputCardioDistance');
        const inputCardioDuration = document.getElementById('inputCardioDuration');
        const inputCardioDate = document.getElementById('inputCardioDate');
        const inputCardioNotes = document.getElementById('inputCardioNotes');

        let cardios = JSON.parse(localStorage.getItem(cardioKey) || '[]');
        let editingCardioId = '';

        const saveCardios = () => {
            localStorage.setItem(cardioKey, JSON.stringify(cardios));
        };

        const updateCardioStats = () => {
            const runDistance = cardios.filter(c => c.type === 'Corrida').reduce((s, c) => s + Number(c.distance || 0), 0);
            const walkDistance = cardios.filter(c => c.type === 'Caminhada').reduce((s, c) => s + Number(c.distance || 0), 0);
            const runMinutes = cardios.filter(c => c.type === 'Corrida').reduce((s, c) => s + Number(c.duration || 0), 0);
            const walkMinutes = cardios.filter(c => c.type === 'Caminhada').reduce((s, c) => s + Number(c.duration || 0), 0);

            if (runDistanceTotal) runDistanceTotal.textContent = runDistance.toFixed(2);
            if (walkDistanceTotal) walkDistanceTotal.textContent = walkDistance.toFixed(2);
            if (runHoursTotal) runHoursTotal.textContent = `${(runMinutes / 60).toFixed(1)}h`;
            if (walkHoursTotal) walkHoursTotal.textContent = `${(walkMinutes / 60).toFixed(1)}h`;
        };

        const renderCardioTable = () => {
            cardioTableBody.innerHTML = '';
            if (!cardios.length) {
                cardioTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum registro.</td></tr>';
                updateCardioStats();
                return;
            }

            cardios.slice().reverse().forEach((c) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${c.type}</td>
                    <td>${Number(c.distance || 0).toFixed(2)}</td>
                    <td>${c.duration || 0}</td>
                    <td>${c.date || ''}</td>
                    <td>${c.notes || ''}</td>
                    <td class="action-row">
                        <button class="btn btn-muted" data-action="edit" data-id="${c.id}" title="Editar">Editar</button>
                        <button class="btn btn-muted" data-action="delete" data-id="${c.id}" title="Excluir">Excluir</button>
                    </td>
                `;
                cardioTableBody.appendChild(row);
            });
            updateCardioStats();
        };

        const resetCardioForm = () => {
            cardioId.value = '';
            editingCardioId = '';
            cardioForm.reset();
            cardioSubmitBtn.textContent = 'Adicionar registro';
            cancelCardioEdit.classList.add('hidden');
        };

        const fillCardioForm = (entry) => {
            editingCardioId = entry.id;
            cardioId.value = entry.id;
            inputCardioType.value = entry.type;
            inputCardioDistance.value = entry.distance;
            inputCardioDuration.value = entry.duration;
            inputCardioDate.value = entry.date || '';
            inputCardioNotes.value = entry.notes || '';
            cardioSubmitBtn.textContent = 'Atualizar registro';
            cancelCardioEdit.classList.remove('hidden');
        };

        cardioForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const entry = {
                id: editingCardioId || `c-${Date.now()}`,
                type: inputCardioType.value,
                distance: Number(inputCardioDistance.value) || 0,
                duration: Number(inputCardioDuration.value) || 0,
                date: inputCardioDate.value,
                notes: inputCardioNotes.value.trim(),
            };

            if (!entry.distance && !entry.duration) return;

            if (editingCardioId) {
                cardios = cardios.map((c) => c.id === entry.id ? { ...c, ...entry } : c);
            } else {
                cardios.push(entry);
            }

            saveCardios();
            renderCardioTable();
            resetCardioForm();
        });

        cardioTableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action]');
            if (!button) return;
            const action = button.dataset.action;
            const id = button.dataset.id;
            const entry = cardios.find((item) => item.id === id);
            if (!entry) return;

            if (action === 'edit') {
                fillCardioForm(entry);
            }
            if (action === 'delete') {
                cardios = cardios.filter((item) => item.id !== id);
                saveCardios();
                renderCardioTable();
                if (editingCardioId === id) resetCardioForm();
            }
        });

        cancelCardioEdit?.addEventListener('click', resetCardioForm);

        renderCardioTable();
    }
})();
