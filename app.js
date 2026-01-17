const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const store = {
    activeDay: 'Monday',
    schedule: JSON.parse(localStorage.getItem('if_schedule')) || {
        Monday: 'Chest', Tuesday: 'Back', Wednesday: 'Rest', Thursday: 'Shoulders', Friday: 'Legs', Saturday: 'Arms', Sunday: 'Cardio'
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

// Tab Switcher
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
});

const render = () => {
    // Workout Tab
    const dropdown = document.getElementById('day-dropdown');
    dropdown.innerHTML = daysOfWeek.map(d => `<option value="${d}" ${d === store.activeDay ? 'selected' : ''}>${d}</option>`).join('');
    document.getElementById('day-focus-label').innerText = `Focus: ${store.schedule[store.activeDay]}`;

    const list = document.getElementById('exercise-list');
    list.innerHTML = store.workouts
        .filter(w => w.day === store.activeDay)
        .map(w => `
            <div class="glass-card" style="display:flex; justify-content:space-between; align-items:center; padding:1rem">
                <span><strong>${w.name}</strong></span>
                <span>${w.weight}${w.unit} x ${w.reps}</span>
                <button onclick="deleteEx('${w.id}')" style="background:none; border:none; color:red; cursor:pointer">🗑️</button>
            </div>
        `).join('');

    // Tracker Tab
    document.getElementById('weight-history-list').innerHTML = store.weightLogs.slice().reverse().map(log => `
        <div class="glass-card" style="text-align:center"><h3>${log.value} kg</h3><small>${log.date}</small></div>
    `).join('');

    // Settings Tab
    document.getElementById('schedule-config-list').innerHTML = daysOfWeek.map(d => `
        <div style="display:flex; align-items:center; margin-bottom:10px">
            <label style="width:100px">${d}</label>
            <input type="text" data-day="${d}" value="${store.schedule[d]}" class="schedule-input">
        </div>
    `).join('');
};

// Event Listeners
document.getElementById('exercise-form').addEventListener('submit', (e) => {
    e.preventDefault();
    store.workouts.push({
        id: crypto.randomUUID(), day: store.activeDay,
        name: document.getElementById('ex-name').value,
        weight: document.getElementById('ex-weight').value,
        unit: document.getElementById('unit-select').value,
        reps: document.getElementById('ex-reps').value
    });
    e.target.reset(); store.save();
});

document.getElementById('day-dropdown').addEventListener('change', (e) => {
    store.activeDay = e.target.value; render();
});

document.getElementById('log-weight-btn').addEventListener('click', () => {
    const val = document.getElementById('body-weight-input').value;
    if(!val) return;
    store.weightLogs.push({ date: new Date().toLocaleDateString(), value: val });
    document.getElementById('body-weight-input').value = ''; store.save();
});

document.getElementById('save-schedule').addEventListener('click', () => {
    document.querySelectorAll('.schedule-input').forEach(input => {
        store.schedule[input.dataset.day] = input.value;
    });
    store.save(); alert("Split Updated!");
});

window.deleteEx = (id) => {
    store.workouts = store.workouts.filter(w => w.id !== id); store.save();
};

// ASYNC SERVICE WORKER REGISTRATION
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Error:', err));
    });
}

render();