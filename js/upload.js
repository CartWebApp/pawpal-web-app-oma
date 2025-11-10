// Handles showing an inline preview when a file is selected
function previewImage(event) {
    const preview = document.getElementById('profilePreview');
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        preview.src = reader.result;
        preview.style.display = 'block';
        // hide the upload icon so the preview replaces it
        const uploadIcon = document.querySelector('.uploadIcon');
        if (uploadIcon) uploadIcon.style.display = 'none';
        // ensure preview keeps the same visual size (CSS handles exact sizing)
    };

    if (file) reader.readAsDataURL(file);
}

// Additional behavior: handle form submit, persist the profile to localStorage,
// and show a modal confirmation (accessible) like the other pages.
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('createProfileForm');
        const fileInput = document.getElementById('profilePicture');
        const preview = document.getElementById('profilePreview');
        const uploadIcon = document.querySelector('.uploadIcon');

        if (!form) return;

        function readFileAsDataURL(file) {
            return new Promise(function (resolve, reject) {
                const reader = new FileReader();
                reader.onload = function () {
                    resolve(reader.result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        function ensureModal() {
            let overlay = document.querySelector('.modal-overlay');
            if (overlay) return overlay;

            overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.style.display = 'none';

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'modalTitle');

            const title = document.createElement('h2');
            title.id = 'modalTitle';
            title.textContent = 'Profile';

            const message = document.createElement('p');
            message.id = 'modalMessage';

            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'modalCloseButton';
            closeBtn.textContent = 'Close';

            closeBtn.addEventListener('click', function () {
                overlay.style.display = 'none';
                if (overlay._prevActive && overlay._prevActive.focus) overlay._prevActive.focus();
            });

            overlay.addEventListener('keydown', function (ev) {
                if (ev.key === 'Escape') {
                    overlay.style.display = 'none';
                    if (overlay._prevActive && overlay._prevActive.focus) overlay._prevActive.focus();
                }
                if (ev.key === 'Tab') {
                    ev.preventDefault();
                    closeBtn.focus();
                }
            });

            modal.appendChild(title);
            modal.appendChild(message);
            modal.appendChild(closeBtn);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            return overlay;
        }

        function showModal(text) {
            const overlay = ensureModal();
            const msg = overlay.querySelector('#modalMessage');
            msg.textContent = text;
            overlay._prevActive = document.activeElement;
            overlay.style.display = 'flex';
            const close = overlay.querySelector('.modalCloseButton');
            if (close) close.focus();
        }

        // --- Profiles storage helpers ---
        const PROFILES_KEY = 'pawpal_profiles';
        const SELECTED_KEY = 'pawpal_selected_profile';

        function getProfiles() {
            try {
                return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
            } catch (e) {
                console.warn('Failed to parse profiles from storage', e);
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

        function saveProfile(profile) {
            const profiles = getProfiles();
            // assign simple id
            profile.id = profile.id || Date.now().toString();
            profiles.push(profile);
            saveProfiles(profiles);
            // set this as selected by default
            try { localStorage.setItem(SELECTED_KEY, profile.id); } catch (e) {}
            return profile.id;
        }

        function migrateOldProfileIfNeeded() {
            const OLD_KEY = 'pawpal_profile';
            try {
                const old = localStorage.getItem(OLD_KEY);
                if (!old) return;
                const parsed = JSON.parse(old);
                // give it an id if missing
                parsed.id = parsed.id || Date.now().toString();
                const profiles = getProfiles();
                profiles.push(parsed);
                saveProfiles(profiles);
                localStorage.removeItem(OLD_KEY);
            } catch (e) {
                // ignore migration errors
                console.warn('Migration failed', e);
            }
        }

        // run migration on load
        migrateOldProfileIfNeeded();

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const profile = {
                name: (document.getElementById('name') || {}).value || '',
                species: (document.getElementById('species') || {}).value || '',
                breed: (document.getElementById('breed') || {}).value || '',
                age: (document.getElementById('age') || {}).value || '',
                weight: (document.getElementById('weight') || {}).value || '',
                image: ''
            };

            const file = fileInput && fileInput.files && fileInput.files[0];
            const hasPreview = preview && preview.src && preview.style.display !== 'none';

            function saveAndFinish() {
                try {
                    saveProfile(profile);
                } catch (err) {
                    console.warn('Unable to save profile', err);
                }

                showModal('Profile successfully created');

                try { form.reset(); } catch (_) {}
                if (preview) { preview.style.display = 'none'; preview.src = ''; }
                if (uploadIcon) uploadIcon.style.display = '';

                setTimeout(function () {
                    const overlay = document.querySelector('.modal-overlay');
                    if (overlay) {
                        const close = overlay.querySelector('.modalCloseButton');
                        if (close) close.click();
                    }
                }, 3000);
            }

            if (file) {
                readFileAsDataURL(file).then(function (dataUrl) {
                    profile.image = dataUrl;
                    saveAndFinish();
                }).catch(function () {
                    saveAndFinish();
                });
            } else if (hasPreview) {
                profile.image = preview.src;
                saveAndFinish();
            } else {
                saveAndFinish();
            }
        });
    });
})();