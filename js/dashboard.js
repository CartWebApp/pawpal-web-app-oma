(function () {
    document.addEventListener('DOMContentLoaded', function() {
    const PROFILES_KEY = 'pawpal_profiles';
    const DEFAULT_IMG = '/images/default-pet.png';

        // Load profiles from localStorage
    function loadProfiles() {
        try {
            return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function deleteProfile(profileId) {
        const profiles = loadProfiles();
        const updatedProfiles = profiles.filter(p => p.id !== profileId);
        localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
        render();
    }

    function createCard(profile) {
        const card = document.createElement('div');
        card.className = 'petCard';
        if (profile.id) card.dataset.profileId = profile.id;
        
    const imgSrc = profile.image || DEFAULT_IMG;
        card.innerHTML = `
            <button class="profileIcon deleteIcon" aria-label="Delete profile">
                <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            </button>
            <a href="/html/editProfile.html?id=${profile.id}" class="profileIcon editIcon" aria-label="Edit profile">
                <svg viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            </a>
            <img class="petAvatar" src="${imgSrc}" alt="${profile.name ? profile.name + '\'s avatar' : 'Default avatar'}">
            <h3 class="petName">${escapeHtml(profile.name || 'Unnamed Pet')}</h3>
        `;

        // Add event handlers
        const deleteBtn = card.querySelector('.deleteIcon');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            if (confirm('Are you sure you want to delete this profile?')) {
                deleteProfile(profile.id);
            }
        });

        // Add click handler for the main card area
        card.addEventListener('click', function(e) {
            // Only navigate if the click wasn't on a button or link
            if (!e.target.closest('.profileIcon')) {
                localStorage.setItem('pawpal_selected_profile', profile.id);
                window.location.href = '/html/profile.html';
            }
        });

        return card;
    }

    function createAddCard() {
        const a = document.createElement('a');
        a.className = 'petCard addCard';
        a.href = '/html/createProfile.html';
        a.innerHTML = `
            <div class="plus">+</div>
            <div class="addText">Add profile</div>
        `;
        return a;
    }

    function render() {
        const container = document.getElementById('profilesList');
        if (!container) return;
        
        container.innerHTML = '';
        const profiles = loadProfiles();

        // Add existing profiles as clickable cards
        profiles.forEach(profile => container.appendChild(createCard(profile)));

        // Add the "+" card at the end
        container.appendChild(createAddCard());

        // Render reminders (first two)
        renderReminders();
    }

    // --- Reminders ---
    function loadReminders() {
        try {
            return JSON.parse(localStorage.getItem('pawpal_reminders') || '[]');
        } catch {
            return [];
        }
    }

    function formatDateTime(value) {
        if (!value) return '';
        try {
            const d = new Date(value);
            if (isNaN(d)) return value;
            return d.toLocaleString();
        } catch {
            return value;
        }
    }

    function renderReminders() {
        const list = document.getElementById('remindersList');
        if (!list) return;
        list.innerHTML = '';
        const reminders = loadReminders();
        if (!reminders || reminders.length === 0) {
            const none = document.createElement('div');
            none.className = 'reminderCard';
            none.textContent = 'No reminders';
            list.appendChild(none);
            return;
        }

        // only consider upcoming reminders (filter out past dates)
        const now = Date.now();
        const upcoming = reminders.filter(r => {
            const t = Date.parse(r.date);
            return !isNaN(t) && t >= now;
        });

        if (upcoming.length === 0) {
            const none = document.createElement('div');
            none.className = 'reminderCard';
            none.textContent = 'No reminders';
            list.appendChild(none);
            return;
        }

        // sort upcoming reminders by soonest first
        upcoming.sort((a, b) => {
            const aTime = Date.parse(a.date);
            const bTime = Date.parse(b.date);
            return (aTime || 0) - (bTime || 0);
        });

        // show up to first two upcoming reminders
        upcoming.slice(0,2).forEach(r => {
            const card = document.createElement('div');
            card.className = 'reminderCard';

            const title = document.createElement('h3');
            title.className = 'reminderTitle';
            title.textContent = r.title || 'Untitled reminder';

            const meta = document.createElement('div');
            meta.className = 'reminderMeta';
            const dateText = formatDateTime(r.date);
            // Resolve pet id to name when possible
            let petLabel = '';
            if (r.pet) {
                const profiles = loadProfiles();
                const found = profiles.find(p => p.id === r.pet || p.name === r.pet);
                petLabel = found ? found.name : r.pet;
            }
            meta.textContent = (dateText ? dateText + ' — ' : '') + (petLabel ? ('Pet: ' + petLabel) : '');

            const details = document.createElement('p');
            details.className = 'reminderDetails';
            details.textContent = r.details || '';

            card.appendChild(title);
            card.appendChild(meta);
            if (details.textContent) card.appendChild(details);

            list.appendChild(card);
        });
    }

    // Basic HTML-escaping for inserted content
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Initial render
    render();

    // Re-render if storage changes in another tab
    window.addEventListener('storage', function(e) {
        if (e.key === PROFILES_KEY) render();
        if (e.key === 'pawpal_reminders') renderReminders();
    });
    });
})();