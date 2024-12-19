const nextButton = document.getElementById("nextButton");
const backButton = document.getElementById("backButton");
const submitButton = document.getElementById("submitButton");
const signupContainer1 = document.querySelector(".signup_container1");
const signupContainer2 = document.querySelector(".signup_container2");
const signupContainer3 = document.querySelector(".signup_container3");
const errorMessage1 = document.getElementById("errorMessage1");
const errorMessage2 = document.getElementById("errorMessage2");
let onSignupContainer2 = false;
let userFirstName = "";

// Affiche un message d'erreur
function showErrorMessage(element, message) {
  element.textContent = message;
  element.style.display = "block";
}

// Cache le message d'erreur
function hideErrorMessage(element) {
  element.style.display = "none";
}

// Bouton "Suivant" : vers signup_container2
nextButton.addEventListener("click", () => {
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  userFirstName = prenom;
  const genre = document.getElementById("genre").value;

  if (nom === "" || prenom === "" || !genre) {
    showErrorMessage(
      errorMessage1,
      "Veuillez remplir tous les champs avant de continuer."
    );
    return; // Ne continue pas si un champ est vide
  }

  hideErrorMessage(errorMessage1); // Cache le message d'erreur
  signupContainer1.style.left = "-150vw";
  signupContainer2.style.left = "2.3rem";
  onSignupContainer2 = true;
});

// Bouton "Retour"
backButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (onSignupContainer2) {
    signupContainer1.style.left = "2.3rem";
    signupContainer2.style.left = "150vw";
    onSignupContainer2 = false;
  } else {
    window.location.href = "index.html"; // Redirige vers l'accueil
  }
});

// Vérifie si une chaîne est une adresse email valide
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Vérifie si une chaîne est une adresse email valide
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Vérifie si un mot de passe respecte les règles de sécurité
function isValidPassword(password) {
  // Vérifie un mot de passe avec majuscule, chiffre, caractère spécial, et longueur >= 8
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/;
  return passwordRegex.test(password);
}

// Bouton "Terminer" avec validation
submitButton.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm_password").value;
  const lastName = document.getElementById("nom").value.trim().toLowerCase();
  const firstName = document.getElementById("prenom").value.trim().toLowerCase();
  const rawGender = document.getElementById("genre").value;
  let gender;
  if (rawGender === "homme") {
    gender = "male";
  } else if (rawGender === "femme") {
    gender = "female";
  } else {
    gender = "other";
  }

  // Vérifie que l'email est valide
  if (!isValidEmail(email)) {
    showErrorMessage(
      errorMessage2,
      "Veuillez entrer une adresse email valide."
    );
    return;
  }

  // Vérifie que le mot de passe respecte les règles
  if (!isValidPassword(password)) {
    showErrorMessage(
      errorMessage2,
      "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial."
    );
    return;
  }

  // Vérifie que les mots de passe correspondent
  if (password !== confirmPassword) {
    showErrorMessage(
      errorMessage2,
      "Les mots de passe ne correspondent pas. Veuillez réessayer."
    );
    return;
  }

  try {
    // Envoyer les données à l'API
    const response = await fetch("http://localhost:5000/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lastName, firstName, gender, email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      // Succès
      signupContainer2.style.left = "-150vw";
      signupContainer3.style.left = "2.3rem";
      backButton.style.display = "none";
      submitButton.innerHTML = 'Terminer <i class="fa-solid fa-check"></i>';
      const formattedFirstName = userFirstName.charAt(0).toUpperCase() + userFirstName.slice(1).toLowerCase();
      signupContainer3.querySelector(".confirm_name").textContent = `Bonjour ${formattedFirstName}`;
      document.cookie = `token=${result.token}; path=/; secure; SameSite=Strict; max-age=3600`;
      document.cookie = `userId=${result.userId}; path=/; secure; SameSite=Strict; max-age=3600`;
    } else {
      // Erreur renvoyée par l'API
      showErrorMessage(errorMessage2, result.error);
      submitButton.innerHTML = 'Terminer <i class="fa-solid fa-check"></i>';
    }
  } catch (error) {
    // Erreur réseau ou autre
    console.error("Erreur lors de l'appel API :", error);
    showErrorMessage(
      errorMessage2,
      "Une erreur est survenue. Veuillez réessayer plus tard."
    );
    submitButton.innerHTML = 'Terminer <i class="fa-solid fa-check"></i>';
  }
});
