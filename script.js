const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav-links");
const revealTargets = document.querySelectorAll("[data-reveal]");
const sectionAnimatedTargets = document.querySelectorAll("[data-section-animate]");
const inPageLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cookieBanner = document.querySelector(".cookie-banner");
const cookieAcceptBtn = document.querySelector(".cookie-accept");
const cookieRejectBtn = document.querySelector(".cookie-reject");
const cookieSettingsBtns = document.querySelectorAll(".cookie-settings, .footer-cookie-settings");

const cookieModal = document.querySelector(".cookie-modal");
const cookieModalCloseBtn = document.querySelector(".cookie-modal-close");
const cookieModalAcceptBtn = document.querySelector(".cookie-modal-accept");
const cookieModalRejectBtn = document.querySelector(".cookie-modal-reject");
const cookieModalSaveBtn = document.querySelector(".cookie-modal-save");
const cookieSwitches = document.querySelectorAll(".cookie-switch[data-cookie-key]");

const demoTriggers = document.querySelectorAll("[data-open-demo]");
const demoModal = document.querySelector(".demo-modal");
const demoModalCloseBtn = document.querySelector(".demo-modal-close");
const demoForm = document.querySelector(".demo-form");
const demoSuccess = document.querySelector(".demo-success");
const demoRecipientEmail = "ceo@reporeserve.com";

const cookieDecisionKey = "reporeserve_cookie_consent_v1";
const cookiePreferenceKey = "reporeserve_cookie_preferences_v1";
const validCookieDecisions = new Set(["accepted", "rejected", "customized"]);
const defaultCookiePreferences = {
  functional: true,
  analytics: true
};

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

const scrollToHashWithOffset = (hash, updateUrl = false) => {
  const target = document.querySelector(hash);
  if (!target) {
    return;
  }

  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth"
  });

  if (updateUrl) {
    history.pushState(null, "", hash);
  }
};

if (inPageLinks.length) {
  inPageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") {
        return;
      }

      if (!document.querySelector(href)) {
        return;
      }

      event.preventDefault();
      scrollToHashWithOffset(href, true);
    });
  });
}

if (window.location.hash) {
  window.setTimeout(() => {
    scrollToHashWithOffset(window.location.hash, false);
  }, 10);
}

if (prefersReducedMotion) {
  revealTargets.forEach((el) => el.classList.add("visible"));
  sectionAnimatedTargets.forEach((section) => section.classList.add("section-live"));
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

  if (sectionAnimatedTargets.length) {
    const sectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-live");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.22,
        rootMargin: "0px 0px -12% 0px"
      }
    );

    sectionAnimatedTargets.forEach((section) => sectionObserver.observe(section));
  }
} else {
  revealTargets.forEach((el) => el.classList.add("visible"));
  sectionAnimatedTargets.forEach((section) => section.classList.add("section-live"));
}

const getCookieDecision = () => {
  try {
    const decision = window.localStorage.getItem(cookieDecisionKey);
    if (decision && validCookieDecisions.has(decision)) {
      return decision;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const persistCookieDecision = (decision) => {
  try {
    window.localStorage.setItem(cookieDecisionKey, decision);
  } catch (error) {
    // no-op when storage is unavailable
  }
};

const getCookiePreferences = () => {
  try {
    const stored = window.localStorage.getItem(cookiePreferenceKey);
    if (!stored) {
      return { ...defaultCookiePreferences };
    }

    const parsed = JSON.parse(stored);
    return {
      ...defaultCookiePreferences,
      ...(typeof parsed === "object" && parsed !== null ? parsed : {})
    };
  } catch (error) {
    return { ...defaultCookiePreferences };
  }
};

const persistCookiePreferences = (preferences) => {
  try {
    window.localStorage.setItem(cookiePreferenceKey, JSON.stringify(preferences));
  } catch (error) {
    // no-op when storage is unavailable
  }
};

const showCookieBanner = () => {
  if (!cookieBanner) {
    return;
  }
  cookieBanner.classList.add("show");
  cookieBanner.setAttribute("aria-hidden", "false");
};

const hideCookieBanner = () => {
  if (!cookieBanner) {
    return;
  }
  cookieBanner.classList.remove("show");
  cookieBanner.setAttribute("aria-hidden", "true");
};

const openCookieModal = () => {
  if (!cookieModal) {
    return;
  }
  cookieModal.classList.add("show");
  cookieModal.setAttribute("aria-hidden", "false");
  syncModalLock();
};

const closeCookieModal = () => {
  if (!cookieModal) {
    return;
  }
  cookieModal.classList.remove("show");
  cookieModal.setAttribute("aria-hidden", "true");
  syncModalLock();
  if (!getCookieDecision()) {
    showCookieBanner();
  }
};

const openDemoModal = () => {
  if (!demoModal) {
    return;
  }
  demoModal.classList.add("show");
  demoModal.setAttribute("aria-hidden", "false");
  syncModalLock();
};

const closeDemoModal = () => {
  if (!demoModal) {
    return;
  }
  demoModal.classList.remove("show");
  demoModal.setAttribute("aria-hidden", "true");
  syncModalLock();
};

function syncModalLock() {
  const hasOpenModal =
    (cookieModal && cookieModal.classList.contains("show")) ||
    (demoModal && demoModal.classList.contains("show"));

  if (hasOpenModal) {
    document.body.classList.add("modal-open");
  } else {
    document.body.classList.remove("modal-open");
  }
}

const setSwitchState = (switchButton, isOn) => {
  switchButton.setAttribute("aria-checked", String(Boolean(isOn)));
};

const readSwitches = () => {
  const result = {};
  cookieSwitches.forEach((switchButton) => {
    const preferenceKey = switchButton.getAttribute("data-cookie-key");
    if (!preferenceKey) {
      return;
    }
    result[preferenceKey] = switchButton.getAttribute("aria-checked") === "true";
  });
  return result;
};

const syncSwitchesFromPreferences = (preferences) => {
  cookieSwitches.forEach((switchButton) => {
    const preferenceKey = switchButton.getAttribute("data-cookie-key");
    if (!preferenceKey) {
      return;
    }
    const value = preferences[preferenceKey];
    setSwitchState(switchButton, Boolean(value));
  });
};

const applyCookieChoice = (decision, preferences) => {
  persistCookieDecision(decision);
  persistCookiePreferences(preferences);
  hideCookieBanner();
  closeCookieModal();
};

if (cookieSwitches.length) {
  const initialPreferences = getCookiePreferences();
  syncSwitchesFromPreferences(initialPreferences);

  cookieSwitches.forEach((switchButton) => {
    switchButton.addEventListener("click", () => {
      const isOn = switchButton.getAttribute("aria-checked") === "true";
      setSwitchState(switchButton, !isOn);
    });
  });
}

if (cookieBanner) {
  hideCookieBanner();
  if (!getCookieDecision()) {
    window.setTimeout(showCookieBanner, 420);
  }
}

if (cookieAcceptBtn) {
  cookieAcceptBtn.addEventListener("click", () => {
    applyCookieChoice("accepted", {
      functional: true,
      analytics: true
    });
  });
}

if (cookieRejectBtn) {
  cookieRejectBtn.addEventListener("click", () => {
    applyCookieChoice("rejected", {
      functional: false,
      analytics: false
    });
  });
}

if (cookieSettingsBtns.length) {
  cookieSettingsBtns.forEach((button) => {
    button.addEventListener("click", () => {
      hideCookieBanner();
      syncSwitchesFromPreferences(getCookiePreferences());
      openCookieModal();
    });
  });
}

if (demoTriggers.length) {
  demoTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openDemoModal();
    });
  });
}

if (cookieModalAcceptBtn) {
  cookieModalAcceptBtn.addEventListener("click", () => {
    applyCookieChoice("accepted", {
      functional: true,
      analytics: true
    });
  });
}

if (cookieModalRejectBtn) {
  cookieModalRejectBtn.addEventListener("click", () => {
    applyCookieChoice("rejected", {
      functional: false,
      analytics: false
    });
  });
}

if (cookieModalSaveBtn) {
  cookieModalSaveBtn.addEventListener("click", () => {
    const preferences = {
      ...defaultCookiePreferences,
      ...readSwitches()
    };
    applyCookieChoice("customized", preferences);
  });
}

if (cookieModalCloseBtn) {
  cookieModalCloseBtn.addEventListener("click", () => {
    closeCookieModal();
  });
}

if (cookieModal) {
  cookieModal.addEventListener("click", (event) => {
    if (event.target === cookieModal) {
      closeCookieModal();
    }
  });
}

if (demoModalCloseBtn) {
  demoModalCloseBtn.addEventListener("click", () => {
    closeDemoModal();
  });
}

if (demoModal) {
  demoModal.addEventListener("click", (event) => {
    if (event.target === demoModal) {
      closeDemoModal();
    }
  });
}

if (demoForm) {
  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!demoForm.checkValidity()) {
      demoForm.reportValidity();
      return;
    }

    const formData = new FormData(demoForm);
    const businessEmail = String(formData.get("business_email") || "").trim();
    const firstName = String(formData.get("first_name") || "").trim();
    const lastName = String(formData.get("last_name") || "").trim();
    const companyName = String(formData.get("company_name") || "").trim();
    const jobTitle = String(formData.get("job_title") || "").trim();
    const phoneNumber = String(formData.get("phone_number") || "").trim();
    const serviceRegion = String(formData.get("service_region") || "India").trim();
    const solutionInterest = String(formData.get("solution_interest") || "Not specified").trim();

    const subject = encodeURIComponent(
      `RepoReserve Demo Request - ${companyName || `${firstName} ${lastName}`.trim() || "Institution"}`
    );
    const body = encodeURIComponent(
      [
        "New demo request submitted from reporeserve website.",
        "",
        `Business Email: ${businessEmail}`,
        `First Name: ${firstName}`,
        `Last Name: ${lastName}`,
        `Company Name: ${companyName}`,
        `Job Title: ${jobTitle}`,
        `Phone Number: ${phoneNumber}`,
        `Service Region: ${serviceRegion}`,
        `Solution Interest: ${solutionInterest}`
      ].join("\n")
    );

    if (demoSuccess) {
      demoSuccess.textContent = "Opening your email client with your request details...";
    }

    window.location.href = `mailto:${demoRecipientEmail}?subject=${subject}&body=${body}`;

    window.setTimeout(() => {
      demoForm.reset();
      if (demoSuccess) {
        demoSuccess.textContent = "";
      }
      closeDemoModal();
    }, 900);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (demoModal && demoModal.classList.contains("show")) {
    closeDemoModal();
    return;
  }

  if (cookieModal && cookieModal.classList.contains("show")) {
    closeCookieModal();
  }
});
