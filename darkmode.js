const switchBox = document.getElementById("switch");
const icone = document.querySelector("i");
const link = document.getElementById("css-link");
switchBox.addEventListener("click", change);
console.log(localStorage.getItem("mode"));
if (localStorage.getItem("mode") === null) {
    localStorage.setItem("mode", "light-mode");
} else if (localStorage.getItem("mode") === "light-mode") {
    link.href = "CSS/light-mode.css";
} else if (localStorage.getItem("mode") === "dark-mode") {
    link.href = "CSS/dark-mode.css";
}

function change() {
    console.log(localStorage.getItem("mode"));
    if (localStorage.getItem("mode") === "light-mode") {
        localStorage.setItem("mode", "dark-mode");
        link.href = "CSS/dark-mode.css";
        icone.classList = "fas fa-sun";
        eColor = "#747d8c";
        hColor = "#dfe4ea";
        fColor = "#ff4757";
    } else {
        localStorage.setItem("mode", "light-mode");
        link.href = "CSS/light-mode.css";
        icone.classList = "fas fa-moon";
        eColor = "lightblue";
        hColor = "#004721";
        fColor = "red";
    }
    console.log(localStorage.getItem("mode"));
}
