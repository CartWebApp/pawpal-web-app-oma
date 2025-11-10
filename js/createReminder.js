document.addEventListener('DOMContentLoaded', function () {
    // Populate pet dropdown
    const select = document.getElementById('pet');
    if (select) {
        let profiles = [];
        try {
            profiles = JSON.parse(localStorage.getItem('pawpal_profiles') || '[]');
        } catch {}
        profiles.forEach(profile => {
            if (profile.name) {
                const opt = document.createElement('option');
                opt.value = profile.id || profile.name;
                opt.textContent = profile.name;
                select.appendChild(opt);
            }
        });
    }

    // Save reminders to localStorage when the form is submitted
    const form = document.querySelector('.createReminderForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const reminder = {
                title: document.getElementById('title')?.value || '',
                pet: document.getElementById('pet')?.value || '',
                date: document.getElementById('reminderDate')?.value || '',
                details: document.getElementById('details')?.value || ''
            };
            let reminders = [];
            try {
                reminders = JSON.parse(localStorage.getItem('pawpal_reminders') || '[]');
            } catch {}
            reminders.push(reminder);
            localStorage.setItem('pawpal_reminders', JSON.stringify(reminders));
            alert('Reminder saved!');
            form.reset();
        });
    }
});