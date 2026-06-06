const productionHosts = new Set(["reporeserve.com", "www.reporeserve.com"]);
const isProductionHost = productionHosts.has(window.location.hostname.toLowerCase());

if (isProductionHost && window.location.pathname.toLowerCase().endsWith("/index.html")) {
  const cleanPath = window.location.pathname.replace(/index\.html$/i, "");
  const targetUrl = `${window.location.origin}${cleanPath}${window.location.search}${window.location.hash}`;
  window.location.replace(targetUrl || `${window.location.origin}/`);
}

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav-links");
const navDropdowns = document.querySelectorAll(".nav-dropdown");
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

const ensureCookieFab = () => {
  if (!document.body) {
    return null;
  }

  const existingFab = document.querySelector(".cookie-fab");
  if (existingFab) {
    return existingFab;
  }

  const cookieFab = document.createElement("button");
  cookieFab.type = "button";
  cookieFab.className = "cookie-fab footer-cookie-settings";
  cookieFab.setAttribute("aria-label", "Cookie Settings");
  cookieFab.setAttribute("title", "Cookie Settings");
  const cookieIconSources = ["images/cookie-icon.svg", "assets/cookie-icon.svg", "images/icon.svg"];
  cookieFab.innerHTML = `
    <span class="cookie-fab-shell" aria-hidden="true">
      <img
        class="cookie-fab-image"
        src="${cookieIconSources[0]}"
        alt=""
        width="20"
        height="20"
        decoding="async"
        fetchpriority="high"
      />
    </span>
  `;

  const cookieFabImage = cookieFab.querySelector(".cookie-fab-image");
  if (cookieFabImage instanceof HTMLImageElement) {
    let currentSourceIndex = 0;
    cookieFabImage.addEventListener(
      "error",
      () => {
        currentSourceIndex += 1;
        if (currentSourceIndex < cookieIconSources.length) {
          cookieFabImage.src = cookieIconSources[currentSourceIndex];
          return;
        }
        cookieFabImage.style.display = "none";
      },
      false
    );
  }

  document.body.append(cookieFab);
  return cookieFab;
};

ensureCookieFab();

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
const briefingTriggers = document.querySelectorAll("[data-open-briefing]");
const briefingModal = document.querySelector(".briefing-modal");
const briefingModalCloseBtn = document.querySelector(".briefing-modal-close");
const briefingForm = document.querySelector(".briefing-form");
const briefingSuccess = document.querySelector(".briefing-success");
const demoRecipientEmail = "ceo@reporeserve.com";
const demoSubmitEndpoint = `https://formsubmit.co/ajax/${demoRecipientEmail}`;
const demoSubmitButton = demoForm ? demoForm.querySelector('button[type="submit"]') : null;
const briefingSubmitButton = briefingForm ? briefingForm.querySelector('button[type="submit"]') : null;
const recaptchaSiteKey = "6Ld5CYosAAAAAIFjOFyUUrQ7ysDR3h7i9A9ywjH4";
let demoRecaptchaWidgetId = null;
let demoRecaptchaContainer = null;
let demoSubmissionInFlight = false;
let briefingRecaptchaWidgetId = null;
let briefingRecaptchaContainer = null;
let briefingSubmissionInFlight = false;
let recaptchaScriptRequested = false;
const recaptchaReadyCallbacks = [];
const recaptchaBaseWidth = 304;
const recaptchaBaseHeight = 78;

const cookieDecisionKey = "reporeserve_cookie_consent_v1";
const cookiePreferenceKey = "reporeserve_cookie_preferences_v1";
const validCookieDecisions = new Set(["accepted", "rejected", "customized"]);
const defaultCookiePreferences = {
  functional: true,
  analytics: true
};

const closeNavDropdowns = (except = null) => {
  navDropdowns.forEach((dropdown) => {
    if (dropdown === except) {
      return;
    }

    dropdown.classList.remove("open");
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });
};

if (navDropdowns.length) {
  navDropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      const willOpen = !dropdown.classList.contains("open");
      closeNavDropdowns(dropdown);
      dropdown.classList.toggle("open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  });
}

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) {
      closeNavDropdowns();
    }
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      closeNavDropdowns();
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
      closeNavDropdowns();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    closeNavDropdowns();
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

const trepsCalculatorSection = document.getElementById("treps-calculator");
const trepsCalculator = trepsCalculatorSection?.hidden
  ? null
  : document.querySelector("[data-treps-calculator]");

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
  document.body.classList.add("cookie-banner-visible");
};

const hideCookieBanner = () => {
  if (!cookieBanner) {
    return;
  }
  cookieBanner.classList.remove("show");
  cookieBanner.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cookie-banner-visible");
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
  if (briefingModal && briefingModal.classList.contains("show")) {
    closeBriefingModal();
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

const openBriefingModal = () => {
  if (!briefingModal) {
    return;
  }
  if (demoModal && demoModal.classList.contains("show")) {
    closeDemoModal();
  }
  briefingModal.classList.add("show");
  briefingModal.setAttribute("aria-hidden", "false");
  syncModalLock();
};

const closeBriefingModal = () => {
  if (!briefingModal) {
    return;
  }
  briefingModal.classList.remove("show");
  briefingModal.setAttribute("aria-hidden", "true");
  syncModalLock();
};

const setDemoStatus = (message, isError = false) => {
  if (!demoSuccess) {
    return;
  }
  demoSuccess.textContent = message;
  demoSuccess.classList.toggle("is-error", Boolean(isError));
};

const setDemoSubmitState = (isSubmitting) => {
  demoSubmissionInFlight = isSubmitting;
  if (!demoSubmitButton) {
    return;
  }

  demoSubmitButton.disabled = isSubmitting;
  demoSubmitButton.setAttribute("aria-busy", String(isSubmitting));
  demoSubmitButton.textContent = isSubmitting ? "Submitting..." : "Submit";
};

const setBriefingStatus = (message, isError = false) => {
  if (!briefingSuccess) {
    return;
  }
  briefingSuccess.textContent = message;
  briefingSuccess.classList.toggle("is-error", Boolean(isError));
};

const setBriefingSubmitState = (isSubmitting) => {
  briefingSubmissionInFlight = isSubmitting;
  if (!briefingSubmitButton) {
    return;
  }

  briefingSubmitButton.disabled = isSubmitting;
  briefingSubmitButton.setAttribute("aria-busy", String(isSubmitting));
  briefingSubmitButton.textContent = isSubmitting ? "Submitting..." : "Submit Request";
};

const ensureDemoRecaptchaMarkup = () => {
  if (!demoForm) {
    return;
  }

  // Native formsubmit.co forms (with an action) don't use reCAPTCHA.
  if (demoForm.getAttribute("action")) {
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

const ensureBriefingRecaptchaMarkup = () => {
  if (!briefingForm) {
    return;
  }

  if (briefingRecaptchaContainer) {
    return;
  }

  const existingContainer = briefingForm.querySelector(".demo-recaptcha");
  if (existingContainer) {
    briefingRecaptchaContainer = existingContainer;
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
  note.textContent = "Complete this verification before submitting your briefing request.";

  wrap.append(title, container, note);
  const privacyText = briefingForm.querySelector(".demo-privacy-text");
  if (privacyText) {
    briefingForm.insertBefore(wrap, privacyText);
  } else {
    briefingForm.append(wrap);
  }

  briefingRecaptchaContainer = container;
};

const fitRecaptchaContainer = (container) => {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  const wrapper = container.closest(".demo-recaptcha-wrap");
  const widthSource =
    (wrapper instanceof HTMLElement ? wrapper.clientWidth : 0) ||
    container.clientWidth ||
    recaptchaBaseWidth;

  const usableWidth = Math.max(0, widthSource - 24);
  const scale = Math.min(1, usableWidth / recaptchaBaseWidth);
  const visualScale = scale < 1 ? scale : 1;

  container.style.width = `${recaptchaBaseWidth}px`;
  container.style.maxWidth = "none";
  container.style.transformOrigin = "left top";
  container.style.transform = scale < 1 ? `scale(${scale})` : "none";
  container.style.minHeight = `${Math.ceil(recaptchaBaseHeight * visualScale)}px`;

  if (wrapper instanceof HTMLElement) {
    wrapper.style.minHeight = `${Math.ceil(recaptchaBaseHeight * visualScale) + 52}px`;
  }
};

const renderDemoRecaptchaWidget = () => {
  if (!demoRecaptchaContainer || !window.grecaptcha || demoRecaptchaWidgetId !== null) {
    return;
  }

  demoRecaptchaWidgetId = window.grecaptcha.render(demoRecaptchaContainer, {
    sitekey: recaptchaSiteKey,
    theme: "dark"
  });
  window.requestAnimationFrame(() => {
    fitRecaptchaContainer(demoRecaptchaContainer);
  });
};

const renderBriefingRecaptchaWidget = () => {
  if (!briefingRecaptchaContainer || !window.grecaptcha || briefingRecaptchaWidgetId !== null) {
    return;
  }

  briefingRecaptchaWidgetId = window.grecaptcha.render(briefingRecaptchaContainer, {
    sitekey: recaptchaSiteKey,
    theme: "dark"
  });
  window.requestAnimationFrame(() => {
    fitRecaptchaContainer(briefingRecaptchaContainer);
  });
};

const ensureRecaptchaScript = (onReady) => {
  if (typeof onReady !== "function") {
    return;
  }

  if (window.grecaptcha) {
    onReady();
    return;
  }

  recaptchaReadyCallbacks.push(onReady);

  if (recaptchaScriptRequested || document.querySelector('script[data-recaptcha-loader="reporeserve"]')) {
    return;
  }

  recaptchaScriptRequested = true;

  window.reporeserveRecaptchaOnload = () => {
    recaptchaScriptRequested = false;
    while (recaptchaReadyCallbacks.length) {
      const callback = recaptchaReadyCallbacks.shift();
      if (typeof callback === "function") {
        callback();
      }
    }
  };

  const script = document.createElement("script");
  script.src = "https://www.google.com/recaptcha/api.js?onload=reporeserveRecaptchaOnload&render=explicit";
  script.async = true;
  script.defer = true;
  script.setAttribute("data-recaptcha-loader", "reporeserve");
  document.head.append(script);
};

const loadDemoRecaptchaScript = () => {
  if (!demoForm) {
    return;
  }

  ensureDemoRecaptchaMarkup();
  ensureRecaptchaScript(renderDemoRecaptchaWidget);
};

const loadBriefingRecaptchaScript = () => {
  if (!briefingForm) {
    return;
  }

  ensureBriefingRecaptchaMarkup();
  ensureRecaptchaScript(renderBriefingRecaptchaWidget);
};

function syncModalLock() {
  const hasOpenModal =
    (cookieModal && cookieModal.classList.contains("show")) ||
    (demoModal && demoModal.classList.contains("show")) ||
    (briefingModal && briefingModal.classList.contains("show"));

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

if (briefingTriggers.length) {
  briefingTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openBriefingModal();
      loadBriefingRecaptchaScript();
      renderBriefingRecaptchaWidget();
    });
  });
}

window.addEventListener(
  "resize",
  () => {
    if (demoRecaptchaContainer) {
      fitRecaptchaContainer(demoRecaptchaContainer);
    }
    if (briefingRecaptchaContainer) {
      fitRecaptchaContainer(briefingRecaptchaContainer);
    }
  },
  { passive: true }
);

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

if (briefingModalCloseBtn) {
  briefingModalCloseBtn.addEventListener("click", () => {
    closeBriefingModal();
  });
}

if (briefingModal) {
  briefingModal.addEventListener("click", (event) => {
    if (event.target === briefingModal) {
      closeBriefingModal();
    }
  });
}

if (demoForm) {
  demoForm.addEventListener("submit", async (event) => {
    // Native submission path: when the form has an action (formsubmit.co),
    // let the browser submit it directly so file attachments are delivered by email.
    if (demoForm.getAttribute("action")) {
      if (!demoForm.checkValidity()) {
        event.preventDefault();
        demoForm.reportValidity();
        return;
      }
      setDemoStatus("Uploading your transaction…");
      return; // allow native submit (no preventDefault)
    }

    event.preventDefault();

    if (demoSubmissionInFlight) {
      return;
    }

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
    const contactName = `${firstName} ${lastName}`.trim();
    const subject = `RepoReserve Demo Request - ${companyName || contactName || "Institution"}`;
    const submissionData = new FormData();

    submissionData.append("_subject", subject);
    submissionData.append("_replyto", businessEmail);
    submissionData.append("_template", "table");
    submissionData.append("Business Email", businessEmail);
    submissionData.append("First Name", firstName);
    submissionData.append("Last Name", lastName);
    submissionData.append("Company Name", companyName);
    submissionData.append("Job Title", jobTitle);
    submissionData.append("Phone Number", phoneNumber);
    submissionData.append("Service Region", serviceRegion);
    submissionData.append("Solution Interest", solutionInterest);
    submissionData.append("Source Page", window.location.href);

    setDemoSubmitState(true);
    setDemoStatus("Submitting your request...");

    try {
      const response = await fetch(demoSubmitEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: submissionData
      });

      const result = await response.json().catch(() => null);
      const requestFailed =
        !response.ok ||
        (result && (result.success === false || result.success === "false"));

      if (requestFailed) {
        throw new Error("Automatic delivery failed.");
      }

      setDemoStatus("Request submitted successfully. The details will be sent to ceo@reporeserve.com.");

      window.setTimeout(() => {
        demoForm.reset();
        setDemoStatus("");
        if (window.grecaptcha && demoRecaptchaWidgetId !== null) {
          window.grecaptcha.reset(demoRecaptchaWidgetId);
        }
        closeDemoModal();
      }, 1200);
    } catch (error) {
      setDemoStatus(
        "Automatic submission could not be completed. Please verify the form endpoint activation for ceo@reporeserve.com.",
        true
      );
    } finally {
      setDemoSubmitState(false);
    }
  });
}

if (briefingForm) {
  briefingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (briefingSubmissionInFlight) {
      return;
    }

    if (!briefingForm.checkValidity()) {
      briefingForm.reportValidity();
      return;
    }

    if (!window.grecaptcha || briefingRecaptchaWidgetId === null) {
      setBriefingStatus("Security verification is still loading. Please try again in a moment.", true);
      return;
    }

    const recaptchaToken = window.grecaptcha.getResponse(briefingRecaptchaWidgetId);
    if (!recaptchaToken) {
      setBriefingStatus("Please complete the security verification before submitting.", true);
      return;
    }

    const formData = new FormData(briefingForm);
    const businessEmail = String(formData.get("business_email") || "").trim();
    const contactName = String(formData.get("contact_name") || "").trim();
    const institutionName = String(formData.get("institution_name") || "").trim();
    const roleFunction = String(formData.get("role_function") || "").trim();
    const institutionType = String(formData.get("institution_type") || "Not specified").trim();
    const phoneNumber = String(formData.get("phone_number") || "").trim();
    const serviceRegion = String(formData.get("service_region") || "India").trim();
    const briefingPurpose = String(formData.get("briefing_purpose") || "Not specified").trim();
    const briefingTimeline = String(formData.get("briefing_timeline") || "Not specified").trim();
    const briefingNotes = String(formData.get("briefing_notes") || "").trim();
    const subject = `RepoReserve Institutional Briefing Request - ${institutionName || contactName || "Institution"}`;
    const submissionData = new FormData();

    submissionData.append("_subject", subject);
    submissionData.append("_replyto", businessEmail);
    submissionData.append("_template", "table");
    submissionData.append("Request Type", "Institutional Briefing");
    submissionData.append("Business Email", businessEmail);
    submissionData.append("Primary Contact", contactName);
    submissionData.append("Institution Name", institutionName);
    submissionData.append("Role / Function", roleFunction);
    submissionData.append("Institution Type", institutionType);
    submissionData.append("Phone Number", phoneNumber);
    submissionData.append("Service Region", serviceRegion);
    submissionData.append("Briefing Purpose", briefingPurpose);
    submissionData.append("Expected Timeline", briefingTimeline);
    submissionData.append("Briefing Context", briefingNotes || "Not provided");
    submissionData.append("Source Page", window.location.href);

    setBriefingSubmitState(true);
    setBriefingStatus("Submitting your request...");

    try {
      const response = await fetch(demoSubmitEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: submissionData
      });

      const result = await response.json().catch(() => null);
      const requestFailed =
        !response.ok ||
        (result && (result.success === false || result.success === "false"));

      if (requestFailed) {
        throw new Error("Automatic delivery failed.");
      }

      setBriefingStatus("Briefing request submitted successfully. The details will be sent to ceo@reporeserve.com.");

      window.setTimeout(() => {
        briefingForm.reset();
        setBriefingStatus("");
        if (window.grecaptcha && briefingRecaptchaWidgetId !== null) {
          window.grecaptcha.reset(briefingRecaptchaWidgetId);
        }
        closeBriefingModal();
      }, 1200);
    } catch (error) {
      setBriefingStatus(
        "Automatic submission could not be completed. Please verify the form endpoint activation for ceo@reporeserve.com.",
        true
      );
    } finally {
      setBriefingSubmitState(false);
    }
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

  if (briefingModal && briefingModal.classList.contains("show")) {
    closeBriefingModal();
    return;
  }

  if (cookieModal && cookieModal.classList.contains("show")) {
    closeCookieModal();
  }
});

document.querySelectorAll(".sol-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--sol-mx", x + "%");
    card.style.setProperty("--sol-my", y + "%");
  });
});

/* ── Post-submit confirmation toast (after formsubmit.co redirect) ── */
(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("submitted") !== "1") {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "fx-submit-toast";
  toast.setAttribute("role", "status");
  toast.innerHTML =
    '<span class="fx-submit-toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9" opacity="0.4"/><path d="M8 12l3 3 5-6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
    '<span class="fx-submit-toast-text"><strong>Thank you — your transaction has been submitted.</strong>Our team will review it and get back to you within 24–48 hours.</span>' +
    '<button type="button" class="fx-submit-toast-close" aria-label="Dismiss">&times;</button>';
  document.body.appendChild(toast);

  window.requestAnimationFrame(() => toast.classList.add("show"));

  const dismiss = () => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 400);
  };
  toast.querySelector(".fx-submit-toast-close").addEventListener("click", dismiss);
  window.setTimeout(dismiss, 9000);

  // clean the ?submitted=1 from the URL without reloading
  const cleanUrl = window.location.pathname + window.location.hash;
  window.history.replaceState({}, document.title, cleanUrl);
})();

/* ── Hero dropzone: accept file first, then "Send" opens the form ── */
(function () {
  const dz = document.getElementById("fxh-dropzone");
  const input = document.getElementById("fxh-file-input");
  const modalFileInput = document.getElementById("fx-file");
  if (!dz || !input) {
    return;
  }

  const defaultView = dz.querySelector(".fxh-dropzone-default");
  const selectedView = dz.querySelector(".fxh-dropzone-selected");
  const filesLabel = dz.querySelector(".fxh-dropzone-files");
  const sendBtn = dz.querySelector(".fxh-dropzone-send");
  const clearBtn = dz.querySelector(".fxh-dropzone-clear");
  let chosen = null;

  const showSelected = (files) => {
    if (!files || !files.length) {
      return;
    }
    chosen = files;
    const names = Array.from(files).map((f) => f.name);
    filesLabel.textContent =
      names.length === 1 ? names[0] : names.length + " files ready to send";
    defaultView.hidden = true;
    selectedView.hidden = false;
  };

  const reset = () => {
    chosen = null;
    input.value = "";
    defaultView.hidden = false;
    selectedView.hidden = true;
  };

  defaultView.addEventListener("click", () => input.click());
  dz.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && selectedView.hidden) {
      e.preventDefault();
      input.click();
    }
  });
  input.addEventListener("change", () => showSelected(input.files));

  ["dragenter", "dragover"].forEach((ev) =>
    dz.addEventListener(ev, (e) => {
      e.preventDefault();
      dz.classList.add("is-dragover");
    })
  );
  ["dragleave", "dragend"].forEach((ev) =>
    dz.addEventListener(ev, () => dz.classList.remove("is-dragover"))
  );
  dz.addEventListener("drop", (e) => {
    e.preventDefault();
    dz.classList.remove("is-dragover");
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      showSelected(e.dataTransfer.files);
    }
  });

  clearBtn.addEventListener("click", reset);

  sendBtn.addEventListener("click", () => {
    // move the chosen files into the form's file input so they submit together
    if (chosen && modalFileInput) {
      try {
        const dt = new DataTransfer();
        Array.from(chosen).forEach((f) => dt.items.add(f));
        modalFileInput.files = dt.files;
        modalFileInput.dispatchEvent(new Event("change"));
      } catch (err) {
        /* DataTransfer unsupported — form still lets the user attach */
      }
    }
    if (typeof openDemoModal === "function") {
      openDemoModal();
    }
  });
})();

/* ── Show selected file count on the upload field ── */
(function () {
  const fileInput = document.getElementById("fx-file");
  const field = document.querySelector(".demo-file-field");
  if (!fileInput || !field) {
    return;
  }

  fileInput.addEventListener("change", () => {
    const existing = field.querySelector(".demo-file-count");
    if (existing) {
      existing.remove();
    }
    const count = fileInput.files ? fileInput.files.length : 0;
    if (count > 0) {
      const span = document.createElement("span");
      span.className = "demo-file-count";
      span.textContent =
        count === 1
          ? "1 file selected: " + fileInput.files[0].name
          : count + " files selected";
      field.appendChild(span);
    }
  });
})();

/* ── FAQ accordion ── */
document.querySelectorAll(".fxfaq-item").forEach((item) => {
  const btn = item.querySelector(".fxfaq-q");
  const panel = item.querySelector(".fxfaq-a");
  if (!btn || !panel) {
    return;
  }

  btn.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    if (isOpen) {
      // collapse: lock current height, then animate to 0
      panel.style.maxHeight = panel.scrollHeight + "px";
      window.requestAnimationFrame(() => {
        panel.style.maxHeight = "0px";
      });
      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    } else {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });

  // once open, release the fixed height so content can reflow responsively
  panel.addEventListener("transitionend", () => {
    if (item.classList.contains("is-open")) {
      panel.style.maxHeight = "none";
    }
  });
});
