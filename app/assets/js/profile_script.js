document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.profile__tab');
    const contents = document.querySelectorAll('.profile__tabs-content > div');

    // Fonction pour changer d'onglet
    function changeTab(event) {
        const target = event.target;

        // Retirer la classe active de tous les onglets et contenus
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        // Ajouter la classe active à l'onglet sélectionné et au contenu associé
        target.classList.add('active');
        const index = Array.from(tabs).indexOf(target);
        contents[index].classList.add('active');
    }

    // Ajouter un écouteur d'événements pour chaque onglet
    tabs.forEach(tab => {
        tab.addEventListener('click', changeTab);
    });
});
