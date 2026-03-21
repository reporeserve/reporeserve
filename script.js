const productionHosts = new Set(["reporeserve.com", "www.reporeserve.com"]);
const isProductionHost = productionHosts.has(window.location.hostname.toLowerCase());

if (isProductionHost && window.location.pathname.toLowerCase().endsWith("/index.html")) {
  const cleanPath = window.location.pathname.replace(/index\.html$/i, "");
  const targetUrl = `${window.location.origin}${cleanPath}${window.location.search}${window.location.hash}`;
  window.location.replace(targetUrl || `${window.location.origin}/`);
}

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav-links");
const backToTopBtn = document.querySelector(".back-to-top");
const inPageLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
const isMobileViewport = window.matchMedia("(max-width: 900px)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const enableRichMotion = !prefersReducedMotion && !isMobileViewport;
const revealTargets = enableRichMotion ? document.querySelectorAll("[data-reveal]") : [];
const sectionAnimatedTargets = enableRichMotion ? document.querySelectorAll("[data-section-animate]") : [];

if (isMobileViewport) {
  document.body.classList.add("perf-lite");
}

const runWhenIdle = (callback, timeout = 1200) => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }

  window.setTimeout(callback, timeout);
};

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
const recaptchaSiteKey = "6Ld5CYosAAAAAIFjOFyUUrQ7ysDR3h7i9A9ywjH4";
let demoRecaptchaWidgetId = null;
let demoRecaptchaContainer = null;

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
    behavior: "auto"
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

if (backToTopBtn) {
  const toggleBackToTop = () => {
    const shouldShow = window.scrollY > 420;
    backToTopBtn.classList.toggle("show", shouldShow);
    backToTopBtn.setAttribute("aria-hidden", String(!shouldShow));
  };

  toggleBackToTop();
  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) {
        return;
      }

      scrollTicking = true;
      window.requestAnimationFrame(() => {
        toggleBackToTop();
        scrollTicking = false;
      });
    },
    { passive: true }
  );

  backToTopBtn.addEventListener("click", () => {
    if (!prefersReducedMotion) {
      backToTopBtn.classList.add("is-animating");
      window.setTimeout(() => {
        backToTopBtn.classList.remove("is-animating");
      }, 460);
    }

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  });
}

if (!enableRichMotion) {
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
      threshold: 0.08,
      rootMargin: "0px 0px -2% 0px"
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
        threshold: 0.1,
        rootMargin: "0px 0px -6% 0px"
      }
    );

    sectionAnimatedTargets.forEach((section) => sectionObserver.observe(section));
  }
} else {
  revealTargets.forEach((el) => el.classList.add("visible"));
  sectionAnimatedTargets.forEach((section) => section.classList.add("section-live"));
}

const trepsCalculator = document.querySelector("[data-treps-calculator]");
if (trepsCalculator) {
  const dailyVolumeInput = document.getElementById("treps-daily-volume");
  const inefficiencyInput = document.getElementById("treps-inefficiency-bps");
  const activeDaysInput = document.getElementById("treps-active-days");
  const scenarioButtons = trepsCalculator.querySelectorAll(".treps-scenario");
  const adjustedBpsLabel = document.getElementById("treps-adjusted-bps");
  const annualImpactOutput = document.getElementById("treps-annual-impact");
  const savingsOutput = document.getElementById("treps-savings");
  const chartLine = document.getElementById("treps-chart-line");
  const chartArea = document.getElementById("treps-chart-area");
  const chartPoints = document.getElementById("treps-chart-points");
  const currentGuide = document.getElementById("treps-current-guide");
  const currentPoint = document.getElementById("treps-current-point");
  const bpsTicks = document.getElementById("treps-bps-ticks");
  const chartYMax = document.getElementById("treps-chart-y-max");

  const defaults = {
    dailyVolume: 500,
    inefficiencyBps: 3,
    activeDays: 250
  };

  const scenarioMultipliers = {
    conservative: 0.5,
    realistic: 1,
    aggressive: 1.5
  };

  let activeScenario = "realistic";

  const readNonNegative = (input, fallback, min = 0) => {
    const rawValue = Number.parseFloat(input?.value || "");
    if (!Number.isFinite(rawValue) || rawValue < min) {
      return fallback;
    }
    return rawValue;
  };

  const formatCrCurrency = (value) => {
    const absolute = Math.abs(value);
    const digits = absolute >= 100 ? 1 : 2;
    const formatted = Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
    return `\u20B9 ${formatted} Cr`;
  };

  const formatBpsTick = (value) => {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  };

  const setScenarioState = (scenario) => {
    activeScenario = scenarioMultipliers[scenario] ? scenario : "realistic";
    scenarioButtons.forEach((button) => {
      const isActive = button.getAttribute("data-scenario") === activeScenario;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const updateTrepsOutputs = () => {
    const dailyVolume = readNonNegative(dailyVolumeInput, defaults.dailyVolume);
    const inefficiencyBps = readNonNegative(inefficiencyInput, defaults.inefficiencyBps);
    const activeDays = readNonNegative(activeDaysInput, defaults.activeDays, 1);
    const scenarioMultiplier = scenarioMultipliers[activeScenario] || scenarioMultipliers.realistic;
    const adjustedBps = inefficiencyBps * scenarioMultiplier;

    const annualImpact = dailyVolume * (adjustedBps / 10000) * activeDays;
    const optimizedImpact = dailyVolume * (1 / 10000) * activeDays;
    const potentialSavings = Math.max(annualImpact - optimizedImpact, 0);

    if (adjustedBpsLabel) {
      adjustedBpsLabel.textContent = `Scenario-adjusted inefficiency: ${adjustedBps.toFixed(2)} bps`;
    }
    if (annualImpactOutput) {
      annualImpactOutput.textContent = formatCrCurrency(annualImpact);
    }
    if (savingsOutput) {
      savingsOutput.textContent = formatCrCurrency(potentialSavings);
    }

    const maxBps = Math.max(6, Math.ceil(Math.max(adjustedBps, inefficiencyBps, 1) * 1.6));
    const bpsSeries = Array.from({ length: 6 }, (_, index) => (maxBps / 5) * index);
    const costSeries = bpsSeries.map((bps) => dailyVolume * (bps / 10000) * activeDays);
    const maxCost = Math.max(...costSeries, annualImpact, 0.01);

    const chartLeft = 54;
    const chartRight = 540;
    const chartTop = 18;
    const chartBottom = 212;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;

    const xFromBps = (bps) => chartLeft + (bps / maxBps) * chartWidth;
    const yFromCost = (cost) => chartBottom - (cost / maxCost) * chartHeight;

    const pointCoords = bpsSeries.map((bps, index) => ({
      x: xFromBps(bps),
      y: yFromCost(costSeries[index])
    }));

    const linePoints = pointCoords.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
    const areaPoints = `${chartLeft},${chartBottom} ${linePoints} ${chartRight},${chartBottom}`;

    if (chartLine) {
      chartLine.setAttribute("points", linePoints);
    }
    if (chartArea) {
      chartArea.setAttribute("points", areaPoints);
    }
    if (chartPoints) {
      chartPoints.innerHTML = pointCoords
        .map(
          (point) =>
            `<circle class="treps-chart-point" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="3.2"></circle>`
        )
        .join("");
    }

    const currentX = xFromBps(Math.min(adjustedBps, maxBps));
    const currentY = yFromCost(annualImpact);

    if (currentGuide) {
      currentGuide.setAttribute("x1", currentX.toFixed(2));
      currentGuide.setAttribute("x2", currentX.toFixed(2));
      currentGuide.setAttribute("y1", chartBottom.toFixed(2));
      currentGuide.setAttribute("y2", currentY.toFixed(2));
    }
    if (currentPoint) {
      currentPoint.setAttribute("cx", currentX.toFixed(2));
      currentPoint.setAttribute("cy", currentY.toFixed(2));
    }
    if (bpsTicks) {
      bpsTicks.innerHTML = bpsSeries.map((bps) => `<span>${formatBpsTick(bps)}</span>`).join("");
    }
    if (chartYMax) {
      chartYMax.textContent = formatCrCurrency(maxCost);
    }
  };

  if (dailyVolumeInput && inefficiencyInput && activeDaysInput) {
    if (!dailyVolumeInput.value) dailyVolumeInput.value = String(defaults.dailyVolume);
    if (!inefficiencyInput.value) inefficiencyInput.value = String(defaults.inefficiencyBps);
    if (!activeDaysInput.value) activeDaysInput.value = String(defaults.activeDays);

    scenarioButtons.forEach((button) => {
      if (button.classList.contains("is-active")) {
        activeScenario = button.getAttribute("data-scenario") || "realistic";
      }

      button.addEventListener("click", () => {
        const selectedScenario = button.getAttribute("data-scenario") || "realistic";
        setScenarioState(selectedScenario);
        updateTrepsOutputs();
      });
    });

    [dailyVolumeInput, inefficiencyInput, activeDaysInput].forEach((input) => {
      input.addEventListener("input", updateTrepsOutputs);
      input.addEventListener("blur", updateTrepsOutputs);
    });

    setScenarioState(activeScenario);
    updateTrepsOutputs();
  }
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

const setDemoStatus = (message, isError = false) => {
  if (!demoSuccess) {
    return;
  }
  demoSuccess.textContent = message;
  demoSuccess.classList.toggle("is-error", Boolean(isError));
};

const ensureDemoRecaptchaMarkup = () => {
  if (!demoForm) {
    return;
  }

  if (demoRecaptchaContainer) {
    return;
  }

  const existingContainer = demoForm.querySelector(".demo-recaptcha");
  if (existingContainer) {
    demoRecaptchaContainer = existingContainer;
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "demo-recaptcha-wrap";

  const title = document.createElement("div");
  title.className = "demo-recaptcha-title";
  title.textContent = "Security Verification";

  const container = document.createElement("div");
  container.className = "demo-recaptcha";
  container.setAttribute("data-recaptcha-widget", "true");

  const note = document.createElement("p");
  note.className = "demo-recaptcha-note";
  note.textContent = "Complete this verification before submitting your request.";

  wrap.append(title, container, note);
  const privacyText = demoForm.querySelector(".demo-privacy-text");
  if (privacyText) {
    demoForm.insertBefore(wrap, privacyText);
  } else {
    demoForm.append(wrap);
  }

  demoRecaptchaContainer = container;
};

const renderDemoRecaptchaWidget = () => {
  if (!demoRecaptchaContainer || !window.grecaptcha || demoRecaptchaWidgetId !== null) {
    return;
  }

  demoRecaptchaWidgetId = window.grecaptcha.render(demoRecaptchaContainer, {
    sitekey: recaptchaSiteKey,
    theme: "dark"
  });
};

const loadDemoRecaptchaScript = () => {
  if (!demoForm) {
    return;
  }

  ensureDemoRecaptchaMarkup();

  if (window.grecaptcha) {
    renderDemoRecaptchaWidget();
    return;
  }

  if (document.querySelector('script[data-recaptcha-loader="reporeserve"]')) {
    return;
  }

  window.reporeserveRecaptchaOnload = () => {
    renderDemoRecaptchaWidget();
  };

  const script = document.createElement("script");
  script.src = "https://www.google.com/recaptcha/api.js?onload=reporeserveRecaptchaOnload&render=explicit";
  script.async = true;
  script.defer = true;
  script.setAttribute("data-recaptcha-loader", "reporeserve");
  document.head.append(script);
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
    runWhenIdle(showCookieBanner, isMobileViewport ? 1800 : 900);
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
      loadDemoRecaptchaScript();
      renderDemoRecaptchaWidget();
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

    if (!window.grecaptcha || demoRecaptchaWidgetId === null) {
      setDemoStatus("Security verification is still loading. Please try again in a moment.", true);
      return;
    }

    const recaptchaToken = window.grecaptcha.getResponse(demoRecaptchaWidgetId);
    if (!recaptchaToken) {
      setDemoStatus("Please complete the security verification before submitting.", true);
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

    setDemoStatus("Opening your email client with your request details...");

    window.location.href = `mailto:${demoRecipientEmail}?subject=${subject}&body=${body}`;

    window.setTimeout(() => {
      demoForm.reset();
      setDemoStatus("");
      if (window.grecaptcha && demoRecaptchaWidgetId !== null) {
        window.grecaptcha.reset(demoRecaptchaWidgetId);
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
