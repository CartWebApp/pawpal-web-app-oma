// Simple client-side login redirect: submit -> dashboard
// Moved out of HTML into its own file for better organization
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.signUpForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // In the future you can validate credentials here.
        window.location.href = '/html/dashboard.html';
    });
});
