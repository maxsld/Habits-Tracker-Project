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
