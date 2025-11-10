 document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.signUpForm');
  if (!form) return;

  const pwd = document.getElementById('password');
  const pwd2 = document.getElementById('password2');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Create a small message element next to the confirm field if it doesn't exist
  let msgEl = document.getElementById('passwordMatchMsg');
  if (!msgEl) {
    msgEl = document.createElement('div');
    msgEl.id = 'passwordMatchMsg';
    msgEl.style.color = 'red';
    msgEl.style.fontSize = '0.9em';
    msgEl.style.marginTop = '6px';
    if (pwd2 && pwd2.parentNode) {
      pwd2.parentNode.insertBefore(msgEl, pwd2.nextSibling);
    }
  }

  // Create modal elements for account-created notice (hidden until needed)
  let modalOverlay = document.querySelector('.modal-overlay');
  let modalMsg = null;
  let prevActive = null;
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.display = 'none';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modalTitle');

    const title = document.createElement('h2');
    title.id = 'modalTitle';
    title.textContent = 'Notice';

    modalMsg = document.createElement('p');
    modalMsg.id = 'modalMessage';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'modalCloseButton';
    closeBtn.textContent = 'Close';

    // Close handler
    function hideModal() {
      modalOverlay.style.display = 'none';
      if (prevActive && typeof prevActive.focus === 'function') prevActive.focus();
    }

    closeBtn.addEventListener('click', function () {
      hideModal();
    });

    // Keyboard accessibility: ESC to close, basic Tab trap
    modalOverlay.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        hideModal();
      }
      if (ev.key === 'Tab') {
        // keep focus within the modal (only close button is focusable)
        ev.preventDefault();
        closeBtn.focus();
      }
    });

    modal.appendChild(title);
    modal.appendChild(modalMsg);
    modal.appendChild(closeBtn);
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
  } else {
    modalMsg = modalOverlay.querySelector('#modalMessage');
  }

  function showModal(message) {
    if (!modalOverlay) return;
    modalMsg.textContent = message;
    prevActive = document.activeElement;
    modalOverlay.style.display = 'flex';
    // focus the close button for keyboard users
    const close = modalOverlay.querySelector('.modalCloseButton');
    if (close) close.focus();
  }

  function validate() {
    // If either field is missing, nothing to validate here
    if (!pwd || !pwd2) return;

    // If both empty, clear state
    if (!pwd.value && !pwd2.value) {
      msgEl.textContent = '';
      pwd2.setCustomValidity('');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (pwd.value !== pwd2.value) {
      msgEl.textContent = 'Passwords do not match';
      pwd2.setCustomValidity('Passwords do not match');
      if (submitBtn) submitBtn.disabled = true;
    } else {
      msgEl.textContent = '';
      pwd2.setCustomValidity('');
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  // Wire up live validation
  if (pwd) pwd.addEventListener('input', validate);
  if (pwd2) pwd2.addEventListener('input', validate);

  // Prevent submit when invalid (extra safety)
  form.addEventListener('submit', function (e) {
    validate();

    // If passwords don't match, block submit and focus confirm field
    if (pwd && pwd2 && pwd.value !== pwd2.value) {
      e.preventDefault();
      pwd2.focus();
      return;
    }

    // No backend in this static repo — show a modal success dialog instead of submitting
    e.preventDefault();
    showModal('Account created! You can now log in.');
    // clear the form to indicate success
    try {
      form.reset();
    } catch (err) {
      // ignore reset failure
    }
    if (submitBtn) submitBtn.disabled = true;

    // Auto-close the modal after a short delay and re-enable submit
    setTimeout(function () {
      const close = modalOverlay.querySelector('.modalCloseButton');
      if (close) close.click();
      if (submitBtn) submitBtn.disabled = false;
    }, 3000);
  });
});
