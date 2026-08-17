document.addEventListener('DOMContentLoaded', () => {
    // Set max birth year to current year
    const birthYearInput = document.getElementById('birthYear');
    if (birthYearInput) {
        birthYearInput.max = new Date().getFullYear();
    }

    // Nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinksList = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinksList.classList.toggle('active');
    });

    // Close nav on click
    navLinksList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            navLinksList.classList.remove('active');
        }
    });

    // Handle registration form
    const form = document.getElementById('registration-form');
    const msgDiv = document.getElementById('registration-message');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.termsAccepted = form.termsAccepted.checked;

            fetch('/api/public/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json().then(body => ({ status: res.status, body })))
            .then(({ status, body }) => {
                if (status === 200) {
                    msgDiv.textContent = `Registrace úspěšná! Vaše startovní číslo je: ${body.bibNumber}`;
                    if (body.emailSent === false) {
                        msgDiv.textContent += ' Potvrzovací e-mail se nepodařilo odeslat.';
                    }
                    msgDiv.style.color = '#2e7d32'; // success green
                    msgDiv.style.display = 'block';
                    form.reset();
                } else {
                    msgDiv.textContent = `Chyba: ${body.error || 'Něco se pokazilo'}`;
                    msgDiv.style.color = '#d32f2f'; // error red
                    msgDiv.style.display = 'block';
                }
            })
            .catch(err => {
                msgDiv.textContent = 'Došlo k chybě při komunikaci se serverem.';
                msgDiv.style.color = '#d32f2f';
                msgDiv.style.display = 'block';
            });
        });
    }
});
