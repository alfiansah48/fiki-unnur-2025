// AOS Init
AOS.init({
  duration: 1000,
  once: true,
});

// Navbar Active
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((sec) => {
    if (scrollY >= sec.offsetTop - 100) {
      current = sec.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("font-bold", "text-cyber");
    if (link.getAttribute("href").includes(current)) {
      link.classList.add("font-bold", "text-cyber");
    }
  });
});

// Dark Mode Toggle
const darkToggle = document.getElementById("darkToggle");
darkToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});
