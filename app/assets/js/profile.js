function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
}

const userId = getCookieValue("userId");

document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".profile__tab");
  const contents = document.querySelectorAll(".profile__tabs-content > div");

  const logoutButton = document.getElementById("logoutButon");

  logoutButton.addEventListener('click', () => {
    // Fonction pour supprimer tous les cookies
    const deleteAllCookies = () => {
      const cookies = document.cookie.split("; ");
      for (const cookie of cookies) {
        const cookieName = cookie.split("=")[0];
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      }
    };

    // Supprimer les cookies
    deleteAllCookies();

    // Rediriger l'utilisateur (facultatif)
    window.location.href = "/app/home.html"; // Par exemple, redirige vers la page de connexion
  });


  // Fonction pour changer d'onglet
  function changeTab(event) {
    const target = event.target;

    tabs.forEach((tab) => tab.classList.remove("active"));
    contents.forEach((content) => content.classList.remove("active"));

    target.classList.add("active");
    const index = Array.from(tabs).indexOf(target);
    contents[index].classList.add("active");
  }

  // Activer l'onglet spécifié dans localStorage
  const activeTabId = localStorage.getItem("activeTab");
  if (activeTabId) {
    const activeTab = document.getElementById(activeTabId);
    if (activeTab) {
      // Activer l'onglet
      tabs.forEach((tab) => tab.classList.remove("active"));
      contents.forEach((content) => content.classList.remove("active"));

      activeTab.classList.add("active");
      const index = Array.from(tabs).indexOf(activeTab);
      if (index >= 0) {
        contents[index].classList.add("active");
      }
    }
    localStorage.removeItem("activeTab"); // Nettoyer le stockage après utilisation
  }

  // Ajouter des écouteurs pour les clics sur les onglets
  tabs.forEach((tab) => {
    tab.addEventListener("click", changeTab);
  });
});

fetch("http://localhost:5000/api/getUserInfo", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ userId }), // Passer l'userId dans le body
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }
    return response.json();
  })
  .then((data) => {
    const codamiDiv = document.getElementById("codami");
    const codami = data.codami;
    codamiDiv.textContent = codami;

    const profileStreakP = document.getElementById("profileStreak");
    profileStreakP.textContent = data.streak + "J";

    const progressRank = document.getElementById("progressRank");
    const progressPourcent = (data.streak * 100) / 90; // Calculate the percentage

    let progressColor;

    if (data.streak <= 30) {
      progressColor = "#FF7F00"; // Orange
    } else if (data.streak <= 60) {
      progressColor = "#FFBB00"; // Jaune
    } else if (data.streak <= 90) {
      progressColor = "#3AC20D"; // Vert
    } else {
      progressColor = "#AF2BDF"; // Violet
    }

    progressRank.style.setProperty("--progress-width", `${progressPourcent}%`);
    progressRank.style.setProperty("--progress-color", progressColor);

    const friendsList = [];

    friendsList.push({
      name: `${data.firstName}`,
      streak: data.streak,
    });

    const programDayContainer = document.getElementById("profile__friends");
    if (programDayContainer && data.friends) {
      data.friends.forEach((friend) => {
        fetch("http://localhost:5000/api/getUserInfo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: friend }), // Passer le freindId dans le body
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch user info");
            }
            return response.json();
          })
          .then((data) => {
            const habitCard = document.createElement("div");
            habitCard.classList.add("program_card_container");

            friendsList.push({
              name: `${data.firstName}`,
              streak: data.streak,
            });

            friendsList.sort((a, b) => b.streak - a.streak);

            // Afficher les 3 premiers dans le podium
            const podiumContainer = document.querySelector(".podium_container");

            // Vérifier qu'il y a bien au moins 3 amis
            const topThreeFriends = friendsList.slice(0, 3);

            // Mettre à jour les trois positions du podium
            topThreeFriends.forEach((friend, index) => {
              const podiumPos = index + 1;
              const podiumElement = document.querySelector(
                `.podium${podiumPos}`
              );

              if (podiumElement) {
                const nameElement = podiumElement.querySelector(".name");
                const scoreElement = podiumElement.querySelector(".score");
                const rangElement = podiumElement.querySelector(".rang");

                nameElement.textContent = friend.name;
                scoreElement.textContent = `${friend.streak}J`;
                rangElement.textContent = podiumPos;
              }
            });

            const underPodiumContainer =
              document.querySelector(".under_podium");
            const nextTwoFriends = friendsList.slice(3, 5); // Sélectionner les 4ème et 5ème

            nextTwoFriends.forEach((friend, index) => {
              const rank = index + 4; // 4 pour le premier ami ici, 5 pour le suivant
              const card = document.createElement("div");
              card.classList.add("under_podium_card");

              card.innerHTML = `
          <div class="under_podium_card_name">
            <p class="under_podium_card_rank">${rank}</p>
            <img src="assets/img/profile.png" alt="">
            <p>${friend.name}</p>
          </div>
          <p class="under_podium_card_stat">${friend.streak}J</p>
        `;

              underPodiumContainer.appendChild(card);
            });

            habitCard.innerHTML = `
                  <div class="program_card">
                    <img src="assets/img/profile.png" alt="">
                    <p class="p1">${data.lastName}</p>
                    <p>${data.firstName}</p>
                  </div>
                  <div class="icon-container-main">
                    <div class="icon-container lock">
                      <i class="fa-solid fa-lock"></i>
                    </div>
                    <div class="icon-container lock">
                      <i class="fa-solid fa-lock"></i>
                    </div>
                    <div class="icon-container delete">
                      <i class="fa-solid fa-trash"></i>
                    </div>
                  </div>
                `;

            programDayContainer.appendChild(habitCard);

            // Ajout de l'événement de suppression pour chaque carte
            const deleteButton = habitCard.querySelector(".delete");
            deleteButton.addEventListener("click", async () => {
              habitCard.remove();
              // Requête pour supprimer l'habitude du serveur
              await fetch("http://localhost:5000/api/deleteFriend", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId,
                  friendId: friend,
                }),
              });
            });

            document
              .querySelectorAll(".program_card_container")
              .forEach((card) => {
                let startX = 0,
                  currentX = 0;

                // Événements tactiles
                card.addEventListener("touchstart", (e) => {
                  startX = e.touches[0].clientX;
                });

                card.addEventListener("touchmove", (e) => {
                  currentX = e.touches[0].clientX;
                  const deltaX = currentX - startX;

                  if (deltaX < -30) {
                    // Si glissement vers la gauche dépasse 30px
                    card.classList.add("swiped");
                    card.classList.remove("swiped-back");
                  } else if (deltaX > 30) {
                    // Si glissement vers la droite dépasse 30px
                    card.classList.add("swiped-back");
                    card.classList.remove("swiped");
                  }

                  e.preventDefault();
                });

                card.addEventListener("touchend", () => {
                  // Rien à faire ici pour l'instant
                });

                // Événements souris
                card.addEventListener("mousedown", (e) => {
                  startX = e.clientX;
                  e.preventDefault();
                });

                card.addEventListener("mousemove", (e) => {
                  if (startX === 0) return;

                  currentX = e.clientX;
                  const deltaX = currentX - startX;

                  if (deltaX < -30) {
                    card.classList.add("swiped");
                    card.classList.remove("swiped-back");
                  } else if (deltaX > 30) {
                    card.classList.add("swiped-back");
                    card.classList.remove("swiped");
                  }

                  e.preventDefault();
                });

                card.addEventListener("mouseup", () => {
                  startX = 0;
                });
              });
          });
      });
    }
  })
  .catch((error) => {
    console.error("Error fetching user info:", error);
  });

document
  .getElementById("link_rang")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Empêcher la redirection par défaut
    localStorage.setItem("activeTab", "rang-tab"); // Stocker l'ID de l'onglet à activer
    window.location.href = "profile.html"; // Rediriger vers profile.html ou la page que vous souhaitez
  });

document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".profile__tab");
  const contents = document.querySelectorAll(".profile__tabs-content > div");

  // Fonction pour changer d'onglet
  function changeTab(event) {
    const target = event.target;

    tabs.forEach((tab) => tab.classList.remove("active"));
    contents.forEach((content) => content.classList.remove("active"));

    target.classList.add("active");
    const index = Array.from(tabs).indexOf(target);
    contents[index].classList.add("active");
  }

  // Activer l'onglet spécifié dans localStorage
  const activeTabId = localStorage.getItem("activeTab");
  if (activeTabId) {
    const activeTab = document.getElementById(activeTabId);
    if (activeTab) {
      // Activer l'onglet
      tabs.forEach((tab) => tab.classList.remove("active"));
      contents.forEach((content) => content.classList.remove("active"));

      activeTab.classList.add("active");
      const index = Array.from(tabs).indexOf(activeTab);
      if (index >= 0) {
        contents[index].classList.add("active");
      }
    }
    localStorage.removeItem("activeTab"); // Nettoyer le stockage après utilisation
  }

  // Ajouter des écouteurs pour les clics sur les onglets
  tabs.forEach((tab) => {
    tab.addEventListener("click", changeTab);
  });
});
