(function () {
    const PROFILES_KEY = 'pawpal_profiles';
    const SELECTED_KEY = 'pawpal_selected_profile';
    const DEFAULT_IMG = '/images/default-pet.png';

    function loadProfiles() {
        try {
            return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function getSelectedProfileId() {
        try { return localStorage.getItem(SELECTED_KEY); } catch { return null; }
    }

    function formatValue(v) { return (v === null || v === undefined || v === '') ? '—' : String(v); }

    document.addEventListener('DOMContentLoaded', function () {
        const id = getSelectedProfileId();
        if (!id) {
            // nothing selected; redirect to dashboard
            console.warn('No selected profile id');
            return;
        }
        const profiles = loadProfiles();
        const p = profiles.find(x => x.id === id);
        if (!p) {
            console.warn('Selected profile not found', id);
            return;
        }
        // populate fields
        const nameEl = document.getElementById('nameDisplay');
        const speciesEl = document.getElementById('speciesDisplay');
        const breedEl = document.getElementById('breedDisplay');
        const ageEl = document.getElementById('ageDisplay');
        const weightEl = document.getElementById('weightDisplay');
        const imgEl = document.getElementById('profileImage');

        if (nameEl) nameEl.textContent = formatValue(p.name);
        if (speciesEl) speciesEl.textContent = formatValue(p.species);
        if (breedEl) breedEl.textContent = formatValue(p.breed);
        if (ageEl) ageEl.textContent = formatValue(p.age);
        if (weightEl) weightEl.textContent = formatValue(p.weight);
        if (imgEl) imgEl.src = p.image || DEFAULT_IMG;

        // Render up to 6 upcoming reminders for this profile
        function loadReminders() {
            try { return JSON.parse(localStorage.getItem('pawpal_reminders') || '[]'); } catch { return []; }
        }

        // --- Render recent activity logs for this profile (up to 6, newest first) ---
        (function renderActivities(){
            const recentContainer = document.querySelector('.recentActivity');
            if (!recentContainer) return;
            recentContainer.innerHTML = '';
            let activities = [];
            try { activities = JSON.parse(localStorage.getItem('pawpal_activities') || '[]'); } catch {}
            // Filter activities for this pet
            const forThis = activities.filter(a => a && a.pet && (a.pet === p.id || a.pet === p.name));
            if (!forThis || forThis.length === 0) {
                const none = document.createElement('div');
                none.className = 'reminderCard';
                none.textContent = 'No logged activities';
                recentContainer.appendChild(none);
                return;
            }
            // sort newest first
            forThis.sort((a,b) => {
                const at = Date.parse(a.date) || 0;
                const bt = Date.parse(b.date) || 0;
                return bt - at;
            });
            const slice = forThis.slice(0,6);
            slice.forEach(a => {
                const card = document.createElement('div');
                card.className = 'reminderCard';
                const title = document.createElement('h3');
                title.className = 'reminderTitle';
                title.textContent = a.type || 'Activity';
                const meta = document.createElement('div');
                meta.className = 'reminderMeta';
                meta.textContent = formatDateTime(a.date) + (a.type ? (' — ' + a.type) : '');
                const details = document.createElement('p');
                details.className = 'reminderDetails';
                details.textContent = a.details || '';
                card.appendChild(title);
                card.appendChild(meta);
                if (details.textContent) card.appendChild(details);
                recentContainer.appendChild(card);
            });
        })();

        function formatDateTime(value) {
            if (!value) return '';
            try {
                const d = new Date(value);
                if (isNaN(d)) return value;
                return d.toLocaleString();
            } catch { return value; }
        }

        const remindersList = document.getElementById('profileRemindersList');
        if (remindersList) {
            const all = loadReminders();
            const now = Date.now();
            // Keep upcoming only (future dates)
            const upcomingForThis = all.filter(r => {
                const t = Date.parse(r.date);
                if (isNaN(t)) return false;
                if (t < now) return false; // filter past
                // match by pet id or pet name
                return (!r.pet && !p.id) || (r.pet && (r.pet === p.id || r.pet === p.name));
            });

            // sort soonest first
            upcomingForThis.sort((a,b) => Date.parse(a.date) - Date.parse(b.date));

            const slice = upcomingForThis.slice(0,6);
            if (slice.length === 0) {
                const none = document.createElement('div');
                none.className = 'reminderCard';
                none.textContent = 'No reminders';
                remindersList.appendChild(none);
            } else {
                slice.forEach(r => {
                    const card = document.createElement('div');
                    card.className = 'reminderCard';
                    const title = document.createElement('h3');
                    title.className = 'reminderTitle';
                    title.textContent = r.title || 'Untitled reminder';
                    const meta = document.createElement('div');
                    meta.className = 'reminderMeta';
                    meta.textContent = formatDateTime(r.date);
                    const details = document.createElement('p');
                    details.className = 'reminderDetails';
                    details.textContent = r.details || '';
                    card.appendChild(title);
                    card.appendChild(meta);
                    if (details.textContent) card.appendChild(details);
                    remindersList.appendChild(card);
                });
            }
        }

        // --- Draw static weekly walk chart for this pet ---
        (function drawWeeklyChart() {
            const canvas = document.getElementById('walkChart');
            if (!canvas || !canvas.getContext) return;
            const ctx = canvas.getContext('2d');
            // Generate deterministic data for this profile so chart varies per-pet
            function seededRandomGenerator(seedStr) {
                let seed = 0;
                for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
                return function () {
                    seed = (seed * 1664525 + 1013904223) >>> 0;
                    return seed / 4294967296;
                };
            }

            const rng = seededRandomGenerator(p.id || (p.name || 'anon'));
            // miles for 7 days (0 - 5 miles with one decimal)
            const data = new Array(7).fill(0).map(() => Math.round((rng() * 5) * 10) / 10);
            const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

            // clear canvas
            ctx.clearRect(0,0,canvas.width,canvas.height);
            const padding = 40;
            const w = canvas.width;
            const h = canvas.height;
            // find max for y-axis, round up to next whole mile
            const maxVal = Math.max(1, Math.ceil(Math.max(...data)));
            const chartHeight = h - padding * 2;

            // draw y axis ticks and labels
            ctx.fillStyle = '#002070';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const ticks = maxVal + 1;
            for (let i = 0; i <= ticks; i++) {
                const yVal = (i / ticks) * maxVal;
                const y = padding + chartHeight - (yVal / maxVal) * chartHeight;
                ctx.fillText(yVal.toFixed(0), padding - 8, y);
                // grid line
                ctx.strokeStyle = 'rgba(0,0,0,0.05)';
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(w - padding, y);
                ctx.stroke();
            }

            // draw bars
            const plotWidth = w - padding * 2;
            const barWidth = plotWidth / data.length * 0.6;
            const gap = (plotWidth / data.length) - barWidth;
            data.forEach((val, i) => {
                const x = padding + i * (barWidth + gap) + gap / 2;
                const barH = (val / maxVal) * chartHeight;
                const y = padding + chartHeight - barH;
                // bar background
                ctx.fillStyle = '#6cd87a';
                ctx.fillRect(x, y, barWidth, barH);
                // label
                ctx.fillStyle = '#002070';
                ctx.textAlign = 'center';
                ctx.fillText(labels[i], x + barWidth / 2, padding + chartHeight + 16);
                // value above bar
                ctx.fillText(val.toFixed(1), x + barWidth / 2, y - 10);
            });

            // axis labels
            ctx.textAlign = 'center';
            ctx.fillText('Miles', padding / 2, padding - 12);
            ctx.fillText('Day', w / 2, h - 4);
        })();
    });
})();
