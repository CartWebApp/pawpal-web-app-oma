// Edit profile page script
(function () {
    const PROFILES_KEY = 'pawpal_profiles';
    const DEFAULT_IMG = '/images/default-pet.png';

    function getQueryParam(name) {
        try {
            const p = new URLSearchParams(location.search);
            return p.get(name);
        } catch {
            return null;
        }
    }

    function loadProfiles() {
        try {
            return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveProfiles(arr) {
        try {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(arr));
        } catch (e) {
            console.warn('Failed to save profiles', e);
        }
    }

    // Preview helper used by the file input onchange attribute
    window.previewImage = function (event) {
        const preview = document.getElementById('profilePreview');
        const uploadIcon = document.querySelector('.uploadIcon');
        const file = event.target.files && event.target.files[0];
        if (!preview) return;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
            preview.src = reader.result;
            preview.style.display = 'block';
            if (uploadIcon) uploadIcon.style.display = 'none';
        };
        reader.readAsDataURL(file);
    };

    function readFileAsDataURL(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const profileId = getQueryParam('id');
        const form = document.getElementById('createProfileForm');
        const fileInput = document.getElementById('profilePicture');
        const preview = document.getElementById('profilePreview');
        const uploadIcon = document.querySelector('.uploadIcon');

        if (!form) return;

        const profiles = loadProfiles();
        const profileIndex = profiles.findIndex(p => p.id === profileId);
        if (profileIndex === -1) {
            // No profile found - redirect back to dashboard
            console.warn('Profile not found for id', profileId);
            // Optionally show a message to the user
            // redirect after short delay
            setTimeout(function () { window.location.href = '/dashboard.html'; }, 800);
            return;
        }

        const profile = profiles[profileIndex];

        // Populate fields
        (document.getElementById('name') || {}).value = profile.name || '';
        (document.getElementById('species') || {}).value = profile.species || '';
        (document.getElementById('breed') || {}).value = profile.breed || '';
        (document.getElementById('age') || {}).value = profile.age || '';
        (document.getElementById('weight') || {}).value = profile.weight || '';

        // Populate preview
        if (profile.image) {
            if (preview) { preview.src = profile.image; preview.style.display = 'block'; }
            if (uploadIcon) uploadIcon.style.display = 'none';
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const updated = {
                id: profile.id,
                name: (document.getElementById('name') || {}).value || '',
                species: (document.getElementById('species') || {}).value || '',
                breed: (document.getElementById('breed') || {}).value || '',
                age: (document.getElementById('age') || {}).value || '',
                weight: (document.getElementById('weight') || {}).value || '',
                image: profile.image || DEFAULT_IMG
            };

            const file = fileInput && fileInput.files && fileInput.files[0];
            const hasPreview = preview && preview.src && preview.style.display !== 'none';

            function finishSave() {
                // replace in profiles array and save
                profiles[profileIndex] = updated;
                saveProfiles(profiles);
                alert('Profile updated');
                // go back to dashboard after a short delay
                setTimeout(function () { window.location.href = '/dashboard.html'; }, 600);
            }

            if (file) {
                readFileAsDataURL(file).then(function (dataUrl) {
                    updated.image = dataUrl;
                    finishSave();
                }).catch(function () {
                    finishSave();
                });
            } else if (hasPreview) {
                updated.image = preview.src;
                finishSave();
            } else {
                updated.image = DEFAULT_IMG;
                finishSave();
            }
        });
    });
})();
