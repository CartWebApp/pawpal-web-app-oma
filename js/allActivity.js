(function () {
  const ACTIVITIES_KEY = 'pawpal_activities';
  const PROFILES_KEY = 'pawpal_profiles';
  const SELECTED_KEY = 'pawpal_selected_profile';

  function loadActivities() {
    try { return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]'); } catch { return []; }
  }
  function loadProfiles() {
    try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]'); } catch { return []; }
  }
  function getSelectedProfileId() {
    try { return localStorage.getItem(SELECTED_KEY); } catch { return null; }
  }

  function formatDateTime(value) {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (isNaN(d)) return value;
      return d.toLocaleString();
    } catch { return value; }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const list = document.getElementById('allActivityLogsList');
    if (!list) return;
    list.innerHTML = '';

    const selectedId = getSelectedProfileId();
    const profiles = loadProfiles();
    const selProfile = profiles.find(p => p.id === selectedId) || { id: selectedId };

    let activities = loadActivities();
    // If a selected profile exists, filter to that pet; otherwise show all activities
    if (selProfile && selProfile.id) {
      activities = activities.filter(a => a && a.pet && (a.pet === selProfile.id || a.pet === selProfile.name));
    }

    if (!activities || activities.length === 0) {
      const none = document.createElement('div'); none.className = 'reminderCard'; none.textContent = 'No logged activities'; list.appendChild(none); return;
    }

    // Sort newest first (so oldest ends up at the bottom)
    activities.sort((a,b) => {
      const at = Date.parse(a.date) || 0;
      const bt = Date.parse(b.date) || 0;
      return bt - at;
    });

    activities.forEach(a => {
      const card = document.createElement('div'); card.className = 'reminderCard';
      const title = document.createElement('h3'); title.className = 'reminderTitle'; title.textContent = a.type || 'Activity';
      const meta = document.createElement('div'); meta.className = 'reminderMeta'; meta.textContent = formatDateTime(a.date) + (a.type ? (' — ' + a.type) : '');
      const details = document.createElement('p'); details.className = 'reminderDetails'; details.textContent = a.details || '';
      card.appendChild(title); card.appendChild(meta); if (details.textContent) card.appendChild(details);
      list.appendChild(card);
    });

    // preserve selected profile on back button
    const back = document.getElementById('backToProfile');
    if (back) {
      back.addEventListener('click', function () { try { localStorage.setItem(SELECTED_KEY, selProfile.id); } catch {} });
    }

    window.addEventListener('storage', function (e) {
      if (e.key === ACTIVITIES_KEY || e.key === PROFILES_KEY || e.key === SELECTED_KEY) {
        list.innerHTML = '';
        document.location.reload();
      }
    });
  });
})();
