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
    });
})();
