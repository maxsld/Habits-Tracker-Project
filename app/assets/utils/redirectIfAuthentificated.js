window.onload = function () {
  // Fonction pour récupérer le token depuis les cookies
  function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return null;
  }

  // Récupérer le token et l'userId depuis les cookies
  const token = getCookieValue("token");
  const userId = getCookieValue("userId");

  // Si un token est trouvé, envoyer une requête à l'API pour vérifier sa validité
  if (token && userId) {
    fetch("http://localhost:5000/api/verifyToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.valid) {
          // Si le token est valide, rediriger vers /app/home.html
          window.location.href = "/app/home.html";
        } else {
          console.log("Token invalide");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la vérification du token", error);
      });
  }
};
