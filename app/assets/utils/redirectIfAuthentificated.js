window.onload = function () {
  // Fonction pour récupérer le token depuis les cookies
  function getTokenFromCookie() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return null;
  }

  // Vérifier si un token est présent
  const token = getTokenFromCookie();

  // Si un token est trouvé, envoyer une requête à l'API pour vérifier sa validité
  if (token) {
    fetch("http://localhost:5000/api/verifyToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.valid) {
          // Si le token est valide, rediriger vers /app/home.html
          window.location.href = "/app/home.html";
        } else {
          console.log("Token invalide");
          // Vous pouvez gérer le cas d'un token invalide, comme rediriger vers une page de connexion
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la vérification du token", error);
      });
  }
};
