document.getElementById('signinForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5000/api/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
        document.cookie = `token=${data.token}; path=/; secure; SameSite=Strict; max-age=3600`;
        window.location.href = '/app/home.html'; // Redirect to dashboard or home page
    } else {
        // Show error message
        alert(data.error);
    }
});
