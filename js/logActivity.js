(function () {
    const ACTIVITIES_KEY = 'pawpal_activities';
    const SELECTED_KEY = 'pawpal_selected_profile';

    function loadActivities() {
        try { return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]'); } catch { return []; }
    }
    function saveActivities(arr) {
        try { localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(arr)); } catch (e) { console.warn('Save failed', e); }
    }

    function getSelectedProfileId() {
        try { return localStorage.getItem(SELECTED_KEY); } catch { return null; }
    }

    document.addEventListener('DOMContentLoaded', function () {
        // populate activity dropdown
        const select = document.getElementById('activity');
        if (select) {
            const options = ['Walk/Exercise', 'Medication', 'Feeding', 'Other'];
            // clear existing (keep first None if present)
            select.innerHTML = '';
            const none = document.createElement('option'); none.value = ''; none.textContent = 'None'; select.appendChild(none);
            options.forEach(opt => {
                const o = document.createElement('option'); o.value = opt; o.textContent = opt; select.appendChild(o);
            });
        }

        const form = document.querySelector('.logActivityForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const profileId = getSelectedProfileId();
            if (!profileId) {
                alert('No profile selected. Please open a profile and log activity from there.');
                window.location.href = '/html/dashboard.html';
                return;
            }

            const activity = (document.getElementById('activity') || {}).value || '';
            const date = (document.getElementById('activityDate') || {}).value || '';
            const details = (document.getElementById('details') || {}).value || '';

            const item = {
                id: Date.now().toString(),
                pet: profileId,
                type: activity,
                date: date,
                details: details
            };

            const activities = loadActivities();
            activities.push(item);
            saveActivities(activities);

            alert('Activity logged');
            form.reset();
            // go back to profile page for the current pet
            window.location.href = '/html/profile.html';
        });
    });
})();
