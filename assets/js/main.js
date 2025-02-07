document.addEventListener("DOMContentLoaded", function() {
    const toggle = document.getElementById("dark-mode-toggle");
    toggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
    });
});