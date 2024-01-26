function showSection(section) {
  const postsSection = document.querySelector(".posts");
  const reelsSection = document.querySelector(".reels");
  const postsTab = document.querySelector('.tab[data-section="posts"]');
  const reelsTab = document.querySelector('.tab[data-section="reels"]');

  if (section === "posts") {
    postsSection.classList.add("show");
    reelsSection.classList.remove("show");
    postsTab.classList.add("active");
    reelsTab.classList.remove("active");
  } else if (section === "reels") {
    postsSection.classList.remove("show");
    reelsSection.classList.add("show");
    postsTab.classList.remove("active");
    reelsTab.classList.add("active");
  }
}
function toggleSection(section) {
  const postsTab = document.querySelector('.nav-item[data-section="posts"]');
  const reelsTab = document.querySelector('.nav-item[data-section="reels"]');

  if (section === "posts") {
    showSection("posts");
    postsTab.classList.add("active");
    reelsTab.classList.remove("active");
  } else if (section === "reels") {
    showSection("reels");
    postsTab.classList.remove("active");
    reelsTab.classList.add("active");
  }
}
