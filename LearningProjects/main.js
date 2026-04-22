const revealElements = [...document.querySelectorAll("[data-reveal]")];
const progressBar = document.getElementById("scroll-progress");
const backToTopButton = document.getElementById("back-to-top");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion;

const sectionLinks = navLinks
  .map((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    return target ? { link, target } : null;
  })
  .filter(Boolean);

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const updateScrollUI = () => {
  const scrollTop = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? scrollTop / scrollRange : 0;

  if (progressBar) {
    progressBar.style.transform = `scaleX(${progress})`;
  }

  if (backToTopButton) {
    backToTopButton.classList.toggle("is-visible", scrollTop > 400);
  }

  const checkpoint = scrollTop + window.innerHeight * 0.35;
  let activeLink = sectionLinks[0]?.link ?? null;

  sectionLinks.forEach((item) => {
    if (item.target.offsetTop <= checkpoint) {
      activeLink = item.link;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link === activeLink);
  });
};

updateScrollUI();

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI);

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
}

if (supportsTilt) {
  const tiltCards = document.querySelectorAll("[data-tilt]");

  tiltCards.forEach((card) => {
    let frameId = 0;

    const resetTransform = () => {
      cancelAnimationFrame(frameId);
      card.style.transform = "";
    };

    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const rotateY = (x - 0.5) * 10;
      const rotateX = (0.5 - y) * 10;

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });
    });

    card.addEventListener("mouseleave", resetTransform);
    card.addEventListener("blur", resetTransform);
  });
}
