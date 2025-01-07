function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return null;
  }

  const userId = getCookieValue("userId");

document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.profile__tab');
    const contents = document.querySelectorAll('.profile__tabs-content > div');

    // Fonction pour changer d'onglet
    function changeTab(event) {
        const target = event.target;

        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        target.classList.add('active');
        const index = Array.from(tabs).indexOf(target);
        contents[index].classList.add('active');
    }

    // Activer l'onglet spécifié dans localStorage
    const activeTabId = localStorage.getItem('activeTab');
    if (activeTabId) {
        const activeTab = document.getElementById(activeTabId);
        if (activeTab) {
            // Activer l'onglet
            tabs.forEach(tab => tab.classList.remove('active'));
            contents.forEach(content => content.classList.remove('active'));

            activeTab.classList.add('active');
            const index = Array.from(tabs).indexOf(activeTab);
            if (index >= 0) {
                contents[index].classList.add('active');
            }
        }
        localStorage.removeItem('activeTab'); // Nettoyer le stockage après utilisation
    }

    // Ajouter des écouteurs pour les clics sur les onglets
    tabs.forEach(tab => {
        tab.addEventListener('click', changeTab);
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

      const programDayContainer = document.getElementById("profile__friends");
      if (programDayContainer && data.friends) {
        data.friends.forEach((friend) => {
          const habitCard = document.createElement("div");
          habitCard.classList.add("program_card_container");

          habitCard.innerHTML = `
                  <div class="program_card">
                    <p class="title">${friend.firstName}</p>
                    <p class="subtitle">${friend.firstName}</p>
                  </div>
                  <div class="icon-container-main">
                    <div class="icon-container check">
                      <i class="fa-solid fa-check"></i>
                    </div>
                    <div class="icon-container cross">
                      <i class="fa-solid fa-times"></i>
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
                habitName: habit.habitName,
              }),
            });
          });
        });

        document.querySelectorAll(".program_card_container").forEach((card) => {
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
      }
    })
    .catch((error) => {
      console.error("Error fetching user info:", error);
    });
