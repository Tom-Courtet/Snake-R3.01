console.log("ca marche");

const switchBox = document.getElementById("switch");
console.log(switchBox);
const btn = document.querySelector(".btn");
const icone = document.querySelector("i");
const container = document.querySelector(".container");
const titre = document.getElementsByTagName("h1")[0];

switchBox.addEventListener("click", change);

function change() {
  btn.classList.toggle("btn-change");
  icone.classList.toggle("icone-change");
  icone.classList.toggle("fa-sun");
  switchBox.classList.toggle("switch-change");
  container.classList.toggle("container-change");
  if (titre.textContent === "LIGTH MODE") {
    titre.textContent = "DARK MODE";
  } else {
    titre.innerText = "LIGHT MODE";
  }
}
