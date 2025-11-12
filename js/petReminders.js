(function () {
  const REMINDERS_KEY = 'pawpal_reminders';
  const PROFILES_KEY = 'pawpal_profiles';
  const SELECTED_KEY = 'pawpal_selected_profile';

  function loadReminders() {
    try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]'); } catch { return []; }
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
    const list = document.getElementById('allPetRemindersList');
    if (!list) return;
    list.innerHTML = '';

    const selectedId = getSelectedProfileId();
    if (!selectedId) {
      const none = document.createElement('div'); none.className = 'reminderCard'; none.textContent = 'No reminders'; list.appendChild(none); return;
    }

    const profiles = loadProfiles();
    const selProfile = profiles.find(p => p.id === selectedId) || { id: selectedId };

    const reminders = loadReminders();
    // filter for this pet by id or name and only keep upcoming or within last 24 hours
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const forThisPet = reminders.filter(r => {
      if (!r || !r.pet) return false;
      if (!(r.pet === selProfile.id || r.pet === selProfile.name)) return false;
      const t = Date.parse(r.date);
      if (isNaN(t)) return false;
      // include if in future or within last 24 hours
      return t >= (now - ONE_DAY_MS);
    });

    if (!forThisPet || forThisPet.length === 0) {
      const none = document.createElement('div'); none.className = 'reminderCard'; none.textContent = 'No reminders'; list.appendChild(none); return;
    }

    // sort by date ascending
    forThisPet.sort((a,b) => {
      const at = Date.parse(a.date) || 0;
      const bt = Date.parse(b.date) || 0;
      return at - bt;
    });

    forThisPet.forEach(r => {
      const card = document.createElement('div'); card.className = 'reminderCard';
      const title = document.createElement('h3'); title.className = 'reminderTitle'; title.textContent = r.title || 'Untitled reminder';
      const meta = document.createElement('div'); meta.className = 'reminderMeta';
      const t = Date.parse(r.date);
      const late = !isNaN(t) && t < now && (now - t) <= ONE_DAY_MS;
      meta.textContent = formatDateTime(r.date) + (late ? ' — Late' : '') + (r.pet ? (' — Pet: ' + (r.pet === selProfile.id ? (selProfile.name || r.pet) : r.pet)) : '');
      const details = document.createElement('p'); details.className = 'reminderDetails'; details.textContent = r.details || '';
      card.appendChild(title); card.appendChild(meta); if (details.textContent) card.appendChild(details);
      list.appendChild(card);
    });

    // wire up back button to ensure selection persists and go back to profile page
    const back = document.getElementById('backToProfile');
    if (back) {
      back.addEventListener('click', function (ev) {
        // ensure selected id is set (it should be already)
        try { localStorage.setItem(SELECTED_KEY, selProfile.id); } catch {}
        // allow normal navigation to /profile.html
      });
    }

    // Re-render on storage change
    window.addEventListener('storage', function (e) {
      if (e.key === REMINDERS_KEY || e.key === PROFILES_KEY || e.key === SELECTED_KEY) {
        // simple approach: reload page fragment
        list.innerHTML = '';
        document.location.reload();
      }
    });
  });
})();
