function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
}

const userId = getCookieValue("userId");

function addDigit(nbr) {
  const input = document.getElementById("inputAddFriends");
  if (input.value.length < 6) {
    input.value += nbr;
  }
}

function removeLastDigit() {
  const input = document.getElementById("inputAddFriends");
  input.value = input.value.slice(0, -1);
}

function clearDigits() {
  const input = document.getElementById("inputAddFriends");
  input.value = input.value = "";
}

const addFriendButton = document.querySelector(".add-friends__button a");
const inputField = document.getElementById("inputAddFriends");

addFriendButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const friendCode = inputField.value.trim();

  // Ensure friendCode is not empty and meets the length requirement (for example, 6 characters minimum)
  if (friendCode === "" || friendCode.length < 6) {
    alert("Veuillez entrer un CodAmi valide.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/addFriends", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        friendCode, // sending the friendCode in the request body
      }),
    });

    if (response.ok) {
      alert("Ami ajouté avec succès !");
    } else {
      const errorData = await response.json();
      alert(`Erreur : ${errorData.error}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'ami :", error);
    alert("Une erreur est survenue. Veuillez réessayer.");
  }
});
