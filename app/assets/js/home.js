function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
}

const userId = getCookieValue("userId");

document.getElementById("newHabitForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const habitName = document.getElementById("habit-name").value.toLowerCase();
  const habitDescription = document.getElementById("habit-description").value.toLowerCase();
  const habitCategory = document.getElementById("habit-category").value.toLowerCase();
  const submitButton = document.getElementById("submit-btn");

  // Fonction pour ajouter un délai
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Afficher l'icône de chargement sur le bouton
  submitButton.innerHTML = '<i class="fa-solid fa-spinner loading-icon"></i> Chargement';

  // Attendre 1,5 secondes avant de mettre à jour le bouton avec l'icône de succès
  await delay(2000);

  // Mettre à jour le texte du bouton avec l'icône de validation
  submitButton.innerHTML = '<i class="fa-solid fa-check"></i> Terminé';
  submitButton.style.backgroundColor="green";

  // Attendre 1 seconde avant de revenir à l'état normal du bouton
  await delay(2000);

  // Réinitialiser l'état du bouton
  submitButton.innerHTML = 'Ajouter une nouvelle habitude';
  submitButton.style.backgroundColor="";

  // Envoyer la requête POST à l'API
  await fetch("http://localhost:5000/api/newHabit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      habitName,
      habitDescription,
      habitCategory,
    }),
  });
});

document.getElementById("open_add_page").addEventListener("click", function () {
  document.getElementById("add_page").classList.toggle("show_add_page");
});

document
  .getElementById("close_add_page")
  .addEventListener("click", function () {
    document.getElementById("add_page").classList.remove("show_add_page");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

document
  .getElementById("see_all_program")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Empêche le comportement par défaut du lien (rediriger)

    var programDay = document.getElementById("program_day");
    var button = document.getElementById("see_all_program");

    // Basculer la classe 'show_program_day' pour afficher/masquer le programme
    programDay.classList.toggle("show_program_day");

    // Ajouter ou retirer la rotation de 180° sur le bouton
    button.classList.toggle("rotated");
  });

document.addEventListener("DOMContentLoaded", () => {
  const emojis = document.querySelectorAll(".emoji");
  const totalEmojis = emojis.length;
  const arcRadius = 150; // Rayon ajusté pour 6 emojis
  const step = 180 / (totalEmojis - 1); // Angle entre les emojis
  let currentIndex = Math.floor(totalEmojis / 2); // Positionner sur l'emoji du milieu
  let startX = 0;

  const updateCarousel = () => {
    emojis.forEach((emoji, index) => {
      const angle = (index - currentIndex) * step - 90; // Centrer sur l'arc
      const radian = (Math.PI / 180) * angle;
      const x = arcRadius * Math.cos(radian) + window.innerWidth / 2; // Centre horizontal
      const y = arcRadius * Math.sin(radian) + window.innerHeight / 2; // Centre vertical

      emoji.style.left = `${x}px`;
      emoji.style.top = `${y}px`;
      emoji.style.transform = `translate(-50%, -50%) scale(${
        1 - Math.abs(index - currentIndex) * 0.1
      })`;
      emoji.style.opacity = 1 - Math.abs(index - currentIndex) * 0.3;

      if (index === currentIndex) {
        emoji.classList.add("active");
      } else {
        emoji.classList.remove("active");
      }
    });
  };

  // Fonction pour passer au prochain emoji
  const slideTo = (newIndex) => {
    currentIndex = (newIndex + totalEmojis) % totalEmojis;
    updateCarousel();
  };

  // Gestion du glissement tactile et souris
  const startSwipe = (e) => {
    startX = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const moveSwipe = (e) => {
    if (!startX) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX;

    if (diff > 50) {
      slideTo(currentIndex - 1); // Glisser vers la gauche
      startX = null;
    } else if (diff < -50) {
      slideTo(currentIndex + 1); // Glisser vers la droite
      startX = null;
    }
  };

  const endSwipe = () => {
    startX = null;
  };

  // Ajout des écouteurs d'événements
  document.addEventListener("mousedown", startSwipe);
  document.addEventListener("mousemove", moveSwipe);
  document.addEventListener("mouseup", endSwipe);
  document.addEventListener("touchstart", startSwipe);
  document.addEventListener("touchmove", moveSwipe);
  document.addEventListener("touchend", endSwipe);

  // Initialiser le carousel
  updateCarousel();

  // Ajouter l'événement de clic pour le bouton de validation
 // Ajouter l'événement de clic pour le bouton de validation
const validateBtn = document.getElementById("validate-btn-emoji");
const feeling_today_page = document.getElementById("feeling_today_page");

validateBtn.addEventListener("click", async () => {
  const selectedEmoji = emojis[currentIndex].textContent;

  // Envoi de la requête POST pour sauvegarder l'emoji sélectionné
  await fetch("http://localhost:5000/api/saveEmoji", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      emojiDay: selectedEmoji,
    }),
  });

  // Masquer la page de sélection des émotions
  feeling_today_page.style.display = "none";

  // Recharger la page après l'envoi de la requête
  window.location.reload();
})
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
    const feeling_today_page = document.getElementById("feeling_today_page");
    if (data.emojiChecked) {
      feeling_today_page.style.display = "none";
    }

    const emojiDayP = document.getElementById("emojiDay");
    emojiDayP.innerHTML = data.emojiDay ?? "?";

    const nameElement = document.querySelector(".title");
    if (nameElement) {
      const capitalize = (str) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      nameElement.innerHTML = `Bonjour, ${capitalize(data.firstName)}`;
    }

    const programDayContainer = document.getElementById("program_day");
    if (programDayContainer && data.habits) {
      data.habits.forEach((habit) => {
        const habitCard = document.createElement("div");
        habitCard.classList.add("program_card_container");

        let habitStatusClass = ""; // On initialise une classe vide
        if (habit.habitStatus === true) {
          habitStatusClass = "status-true"; // Green
        } else if (habit.habitStatus === false) {
          habitStatusClass = "status-false"; // Red
        } // Si status === null, on laisse la couleur par défaut

        habitCard.innerHTML = `
                <div class="program_card ${habitStatusClass}">
                  <p class="title">${habit.habitName}</p>
                  <p class="subtitle">${habit.habitDescription}</p>
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
          await fetch("http://localhost:5000/api/deleteHabit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              habitName: habit.habitName,
            }),
          });

          await fetch("http://localhost:5000/api/saveHistory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
            }),
          });
        });

        const checkButton = habitCard.querySelector(".check");
        checkButton.addEventListener("click", async () => {
          try {
            // Requête pour mettre le statut de l'habitude en "check"
            const response = await fetch("http://localhost:5000/api/updateHabit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId,
                habitName: habit.habitName,
                status: true,
              }),
            });

            // Vérification que la requête a réussi
            if (response.ok) {
              // Rechargement de la page après mise à jour réussie
              window.location.reload();
            } else {
              console.error("Erreur lors de la mise à jour de l'habitude");
            }
          } catch (error) {
            console.error("Erreur réseau :", error);
          }
          await fetch("http://localhost:5000/api/saveHistory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
            }),
          });
        });

        const crossButton = habitCard.querySelector(".cross");
        crossButton.addEventListener("click", async () => {
          try {
            // Requête pour mettre le statut de l'habitude en "check"
            const response = await fetch("http://localhost:5000/api/updateHabit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId,
                habitName: habit.habitName,
                status: false,
              }),
            });

            // Vérification que la requête a réussi
            if (response.ok) {
              // Rechargement de la page après mise à jour réussie
              window.location.reload();
            } else {
              console.error("Erreur lors de la mise à jour de l'habitude");
            }
          } catch (error) {
            console.error("Erreur réseau :", error);
          }
          await fetch("http://localhost:5000/api/saveHistory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
            }),
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
    })}
  })
  .catch((error) => {
    console.error("Error fetching user info:", error);
  });


  document.getElementById('link_friends_tab').addEventListener('click', function (event) {
    event.preventDefault(); // Empêcher la redirection par défaut
    localStorage.setItem('activeTab', 'friends-tab'); // Stocker l'ID de l'onglet à activer
    window.location.href = 'profile.html'; // Rediriger vers profile.html
});

// Simulate page load
window.addEventListener('load', function () {
  // Keep the loader visible for 1 second
  setTimeout(function () {
      // Hide the loader
      document.body.classList.add('loaded');

      // Show the content
      document.getElementById('content').style.display = 'block';
  }, 750); // 1 second delay
});
