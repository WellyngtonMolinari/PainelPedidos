document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const content = document.querySelector(".content");

    menuToggle.addEventListener("click", () => {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // No mobile, alterna apenas a sidebar
            sidebar.classList.toggle("open");
        } else {
            // No desktop, alterna sidebar e conteúdo
            sidebar.classList.toggle("closed");
            content.classList.toggle("shifted");
        }
    });
});
