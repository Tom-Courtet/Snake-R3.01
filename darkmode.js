const switchBox = document.getElementById("switch");
const icone = document.querySelector("i");
const link = document.getElementById("css-link");
switchBox.addEventListener("click", change);

function change() {
    if (link.href.includes("CSS/light-mode.css")) {
        link.href = "CSS/dark-mode.css";
        icone.classList = "fas fa-sun";
        eColor = "#747d8c";
        hColor = "#dfe4ea";
        fColor = "#ff4757";
    } else {
        link.href = "CSS/light-mode.css";
        icone.classList = "fas fa-moon";
        eColor = "lightblue";
        hColor = "#004721";
        fColor = "red";
    }
}
