const switchBox = document.getElementById("switch");
const icone = document.querySelector("i");
const link = document.getElementById("css-link");

switchBox.addEventListener("click", change);

function change() {
  if (link.href === "http://127.0.0.1:5500/snake-js-s3/CSS/light-mode.css") {
    link.href = "CSS/dark-mode.css";
    icone.classList = "fas fa-sun";
  } else {
    link.href = "CSS/light-mode.css";
    icone.classList = "fas fa-moon";
  }
}
