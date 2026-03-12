const menuBtn = document.querySelector(".menu-btn");
    const nav = document.querySelector(".nav-links");
    const revealTargets = document.querySelectorAll("[data-reveal]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (menuBtn && nav) {
      menuBtn.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", String(isOpen));
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("open");
          menuBtn.setAttribute("aria-expanded", "false");
        });
      });

      document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Node)) {
          return;
        }
        if (!nav.contains(target) && !menuBtn.contains(target)) {
          nav.classList.remove("open");
          menuBtn.setAttribute("aria-expanded", "false");
        }
      });
    }

    if (prefersReducedMotion) {
      revealTargets.forEach((el) => el.classList.add("visible"));
    } else if ("IntersectionObserver" in window) {
      document.body.classList.add("motion-ok");
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.16,
          rootMargin: "0px 0px -8% 0px"
        }
      );

      revealTargets.forEach((el) => revealObserver.observe(el));
    } else {
      revealTargets.forEach((el) => el.classList.add("visible"));
    }
