document.addEventListener('DOMContentLoaded', () => {

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const store = {
        activeDay: 'Monday',
        schedule: JSON.parse(localStorage.getItem('if_schedule')) || {
            Monday: 'Chest', Tuesday: 'Back', Wednesday: 'Rest',
            Thursday: 'Shoulders', Friday: 'Legs', Saturday: 'Arms', Sunday: 'Cardio'
        },
        workouts: JSON.parse(localStorage.getItem('if_workouts')) || [],
        weightLogs: JSON.parse(localStorage.getItem('if_weights')) || [],

        save() {
            localStorage.setItem('if_schedule', JSON.stringify(this.schedule));
            localStorage.setItem('if_workouts', JSON.stringify(this.workouts));
            localStorage.setItem('if_weights', JSON.stringify(this.weightLogs));
            render();
        }
    };

    // NAV TABS
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(`${item.dataset.tab}-tab`).classList.add('active');

            if (navigator.vibrate) navigator.vibrate(20);
        });
    });

    function render() {
        // Day dropdown
        const dropdown = document.getElementById('day-dropdown');
        dropdown.innerHTML = daysOfWeek.map(d =>
            `<option value="${d}" ${d === store.activeDay ? 'selected' : ''}>${d}</option>`
        ).join('');

        document.getElementById('day-focus-label').innerText =
            `Focus: ${store.schedule[store.activeDay]}`;

        // Logs
        const list = document.getElementById('exercise-list');
        const todays = store.workouts.filter(w => w.day === store.activeDay);

        list.innerHTML = todays.length ? todays.map(w => `
    <div class="exercise-row">
      <div><strong>${w.name}</strong><br>${w.weight}${w.unit} × ${w.reps}</div>
      <button class="delete-btn" onclick="deleteEx('${w.id}')">DEL</button>
    </div>
  `).join('') : `<p style="text-align:center;opacity:.6">No logs</p>`;

        // Weight history
        document.getElementById('weight-history-list').innerHTML =
            store.weightLogs.slice().reverse().map(w =>
                `<div class="glass-card" style="text-align:center">
        <h3>${w.value} kg</h3><small>${w.date}</small>
      </div>`
            ).join('');

        // Split config
        document.getElementById('schedule-config-list').innerHTML =
            daysOfWeek.map(d => `
      <div style="display:flex;gap:10px;margin-bottom:10px">
        <label style="width:90px">${d}</label>
        <input class="schedule-input" data-day="${d}" value="${store.schedule[d]}">
      </div>
    `).join('');
    }

    // ADD EXERCISE
    document.getElementById('exercise-form').addEventListener('submit', e => {
        e.preventDefault();

        store.workouts.push({
            id: crypto.randomUUID(),
            day: store.activeDay,
            name: document.getElementById('ex-name').value,
            weight: document.getElementById('ex-weight').value,
            unit: document.getElementById('unit-select').value,
            reps: document.getElementById('ex-reps').value
        });

        e.target.reset();
        store.save();
    });

    // DAY CHANGE
    document.getElementById('day-dropdown').onchange = e => {
        store.activeDay = e.target.value;
        render();
    };

    // BODY WEIGHT
    document.getElementById('log-weight-btn').onclick = () => {
        const bwInput = document.getElementById('body-weight-input');
        if (!bwInput.value) return;

        store.weightLogs.push({
            value: bwInput.value,
            date: new Date().toLocaleDateString()
        });

        bwInput.value = '';
        store.save();
    };

    // SAVE SPLIT
    document.getElementById('save-schedule').onclick = () => {
        document.querySelectorAll('.schedule-input').forEach(i => {
            store.schedule[i.dataset.day] = i.value;
        });
        store.save();
    };

    // DELETE SET
    window.deleteEx = id => {
        store.workouts = store.workouts.filter(w => w.id !== id);
        store.save();
    };

    render();
});
