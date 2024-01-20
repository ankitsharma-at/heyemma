const themeForm = document.getElementById("theme-form");
let currentTheme = localStorage.getItem("theme") || "light";

// Set the initial theme based on the currentTheme variable
document.documentElement.setAttribute("data-theme", currentTheme);

themeForm.addEventListener("change", (event) => {
  const theme = event.target.value;

  if (theme === currentTheme) {
    return; // No need to change the theme if the current value is already selected
  }

  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // Update the current theme variable and save it to localStorage
  currentTheme = theme;
  localStorage.setItem("theme", theme);
});