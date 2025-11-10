document.addEventListener('DOMContentLoaded', function () {
  const LIST_ID = 'allRemindersList';
  const STORAGE_KEY = 'pawpal_reminders';

  function loadReminders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function formatDateTime(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleString();
  }

  function render() {
    const container = document.getElementById(LIST_ID);
    if (!container) return;
    container.innerHTML = '';

    const reminders = loadReminders();
    if (!reminders || reminders.length === 0) {
      const none = document.createElement('div');
      none.className = 'reminderCard';
      none.textContent = 'No reminders';
      container.appendChild(none);
      return;
    }

    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Keep reminders that are in the future OR within the last 24 hours
    const filtered = reminders.filter(r => {
      const t = Date.parse(r.date);
      if (isNaN(t)) return false; // skip invalid dates
      return t >= now || t >= (now - ONE_DAY_MS);
    });

    if (filtered.length === 0) {
      const none = document.createElement('div');
      none.className = 'reminderCard';
      none.textContent = 'No reminders';
      container.appendChild(none);
      return;
    }

    // sort by date ascending
    filtered.sort((a, b) => {
      return Date.parse(a.date) - Date.parse(b.date);
    });

    // Helper to resolve pet id to name (reuse same logic as dashboard)
    function resolvePetLabel(petValue) {
      if (!petValue) return '';
      try {
        const profiles = JSON.parse(localStorage.getItem('pawpal_profiles') || '[]');
        const found = profiles.find(p => p.id === petValue || p.name === petValue);
        return found ? found.name : petValue;
      } catch {
        return petValue;
      }
    }

    filtered.forEach(r => {
      const card = document.createElement('div');
      card.className = 'reminderCard';

      const title = document.createElement('h3');
      title.className = 'reminderTitle';
      title.textContent = r.title || 'Untitled reminder';

      const meta = document.createElement('div');
      meta.className = 'reminderMeta';
      const dateText = formatDateTime(r.date);
      const petLabel = resolvePetLabel(r.pet);

      // show "Late" badge if within past 24h
      const t = Date.parse(r.date);
      let status = '';
      if (!isNaN(t) && t < now) {
        const overdueMs = now - t;
        if (overdueMs <= ONE_DAY_MS) status = 'Late';
      }

      meta.textContent = (dateText ? dateText + (status ? (' — ' + status) : '') : '') + (petLabel ? (' — Pet: ' + petLabel) : '');

      const details = document.createElement('p');
      details.className = 'reminderDetails';
      details.textContent = r.details || '';

      card.appendChild(title);
      card.appendChild(meta);
      if (details.textContent) card.appendChild(details);

      container.appendChild(card);
    });
  }

  render();

  // Re-render when storage changes (reminders or profiles)
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY || e.key === 'pawpal_profiles') render();
  });
});
