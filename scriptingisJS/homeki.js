// Scroll animation for the Home section
document.querySelector(".friend-posts").addEventListener("scroll", function () {
  let scrollPos = this.scrollTop / (this.scrollHeight - this.clientHeight);
  document
    .querySelector(".home-section")
    .style.setProperty("--scroll", scrollPos);
});