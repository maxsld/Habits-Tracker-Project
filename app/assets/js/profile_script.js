document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.profile__tab');
    const contents = document.querySelectorAll('.profile__tabs-content > div');

    function changeTab(event) {
        const target = event.target;

        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        target.classList.add('active');
        const index = Array.from(tabs).indexOf(target);
        contents[index].classList.add('active');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', changeTab);
    });
});
