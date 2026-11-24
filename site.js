"use strict";

(() => {
  const params = new URLSearchParams(location.search);
  if (params.get("config") === "1" && window.SITE_CONFIG) {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "rostislove-config", config: window.SITE_CONFIG }, location.protocol === "file:" ? "*" : location.origin);
    }
    return;
  }

  const copy = {
    ru: {
      skip: "К содержимому",
      language: "Язык",
      slogan: "Снимайте с любовью",
      intro: "Бесплатная запись экрана для Windows.",
      store: "Скачать в Microsoft Store",
      platform: "Для Windows 10 и 11",
      features: "Возможности записи",
      areaTitle: "Весь экран или любая область",
      areaBody: "Выделите нужную часть экрана или пишите весь монитор целиком.",
      soundTitle: "Камера, микрофон и звук сразу",
      soundBody: "Вместе с экраном пишите себя с камеры, голос с микрофона и звук компьютера.",
      pauseTitle: "Пауза, чтобы поправить кадр",
      pauseBody: "Передвиньте или растяните рамку и кружок камеры, потом продолжайте запись.",
      formatsTitle: "От MP4 до GIF",
      formatsBody: "Сохраняйте в MP4, MKV, MOV, WebM или GIF, как вам удобнее.",
      downloadTitle: "Скачайте Rostislove Recorder",
      downloadBody: "Бесплатно, для Windows 10 и 11.",
      installer: "Установщик для Windows 10 и 11",
      windowsNote: 'Если Windows покажет синее окно, нажмите "Подробнее", потом "Выполнить в любом случае".',
      supportTitle: "Поддержите автора",
      supportBody: "Программа бесплатная. Если нравится, можно поддержать автора.",
      supportButton: "Поддержать",
      privacy: "Политика конфиденциальности",
      ffmpeg: "Внутри работает FFmpeg по ",
      license: "лицензии GPL v3",
      back: "На главную",
      scene: "Рамка записи, силуэт в кружке камеры и панель управления",
      description: "Записывайте экран, камеру и звук с Rostislove Recorder. Бесплатно для Windows 10 и 11."
    },
    en: {
      skip: "Skip to content",
      language: "Language",
      slogan: "Record with love",
      intro: "Free screen recorder for Windows.",
      store: "Get it from Microsoft Store",
      platform: "For Windows 10 and 11",
      features: "What you can record",
      areaTitle: "The whole screen or any area",
      areaBody: "Pick the part of the screen you need or record the whole monitor.",
      soundTitle: "Camera, microphone and sound at once",
      soundBody: "Record yourself from the camera, your voice and the computer sound along with the screen.",
      pauseTitle: "Pause to fix the frame",
      pauseBody: "Move or resize the frame and the camera circle, then go on recording.",
      formatsTitle: "From MP4 to GIF",
      formatsBody: "Save as MP4, MKV, MOV, WebM or GIF, whichever suits you.",
      downloadTitle: "Download Rostislove Recorder",
      downloadBody: "Free, for Windows 10 and 11.",
      installer: "Installer for Windows 10 and 11",
      windowsNote: 'If Windows shows a blue window, choose "More info", then "Run anyway".',
      supportTitle: "Support the author",
      supportBody: "The program is free. If you enjoy it, you can support its author.",
      supportButton: "Support the author",
      privacy: "Privacy policy",
      ffmpeg: "Powered by FFmpeg under the ",
      license: "GPL v3 license",
      back: "Back to home",
      scene: "Recording frame, camera silhouette and controls",
      description: "Record your screen, camera and sound with Rostislove Recorder. Free for Windows 10 and 11."
    }
  };

  const storageKey = "rostislove-language";
  const isPrivacy = document.body.dataset.page === "privacy";
  let language;
  let configuration = {};

  function preferredLanguage() {
    let stored;
    try { stored = localStorage.getItem(storageKey); } catch {}
    const requested = params.get("lang");
    if (requested === "ru" || requested === "en") return requested;
    if (stored === "ru" || stored === "en") return stored;
    return (navigator.language || "en").toLowerCase().startsWith("ru") ? "ru" : "en";
  }

  function setLanguage(next, remember = false) {
    language = next === "ru" ? "ru" : "en";
    const text = copy[language];
    document.documentElement.lang = language;
    document.querySelectorAll("[data-text]").forEach(node => {
      if (text[node.dataset.text] !== undefined) node.textContent = text[node.dataset.text];
    });
    document.querySelectorAll("[data-label]").forEach(node => node.setAttribute("aria-label", text[node.dataset.label]));
    document.querySelectorAll("[data-language]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.language === language)));
    document.querySelectorAll("[data-policy]").forEach(article => { article.hidden = article.dataset.policy !== language; });
    document.querySelectorAll('a[href^="privacy.html"], a[href^="index.html"]').forEach(link => {
      link.href = `${link.getAttribute("href").split("?")[0]}?lang=${language}`;
    });
    const scene = document.getElementById("scene");
    if (scene) {
      scene.src = `images/scene-${language === "ru" ? "ru" : "en"}.png`;
      scene.alt = text.scene;
    }
    document.querySelectorAll("[data-store]").forEach(img => {
      img.closest(".store").classList.remove("loaded");
      img.src = `https://get.microsoft.com/images/${language === "ru" ? "ru-ru" : "en-us"}%20dark.svg`;
    });
    document.title = isPrivacy ? `${text.privacy} | Rostislove Recorder` : `Rostislove Recorder | ${text.slogan}`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = isPrivacy ? `${text.privacy}. Rostislove Recorder.` : text.description;
    if (remember) {
      try { localStorage.setItem(storageKey, language); } catch {}
      try {
        const address = new URL(location.href);
        address.searchParams.set("lang", language);
        history.replaceState(null, "", address);
      } catch {}
    }
  }

  function webAddress(value) {
    try {
      const url = new URL(String(value || "").trim());
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch { return ""; }
  }

  function applyConfiguration(config) {
    const email = String(config.CONTACT_EMAIL || "").trim();
    configuration = {
      SITE_URL: webAddress(config.SITE_URL),
      EXE_URL: webAddress(config.EXE_URL),
      GUMROAD_URL: webAddress(config.GUMROAD_URL),
      CONTACT_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ""
    };
    document.querySelectorAll("[data-optional]").forEach(node => { node.hidden = !configuration[node.dataset.optional]; });
    document.querySelectorAll("[data-link]").forEach(link => {
      const key = link.dataset.link;
      const value = configuration[key];
      if (!value) { link.removeAttribute("href"); return; }
      link.href = key === "CONTACT_EMAIL" ? `mailto:${value}` : value;
      if (key === "CONTACT_EMAIL") link.textContent = value;
    });
    if (configuration.SITE_URL) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
      const base = configuration.SITE_URL.replace(/index\.html$/, "").replace(/\/?$/, "/");
      canonical.href = isPrivacy ? new URL("privacy.html", base).href : base;
    }
    document.body.dataset.configReady = "true";
  }

  document.querySelectorAll("[data-store]").forEach(img => {
    img.addEventListener("load", () => img.closest(".store").classList.add("loaded"));
    img.addEventListener("error", () => img.closest(".store").classList.remove("loaded"));
  });
  document.querySelectorAll("[data-language]").forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.language, true)));
  setLanguage(preferredLanguage());
  window.addEventListener("storage", event => {
    if (event.key === storageKey && (event.newValue === "ru" || event.newValue === "en")) setLanguage(event.newValue);
  });

  if (window.SITE_CONFIG) {
    applyConfiguration(window.SITE_CONFIG);
  } else if (isPrivacy) {
    // Адреса читаются из главной страницы, в том числе при открытии файла с диска.
    const frame = document.createElement("iframe");
    frame.hidden = true;
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    const receive = event => {
      if (event.source !== frame.contentWindow || event.data?.type !== "rostislove-config") return;
      if (location.protocol !== "file:" && event.origin !== location.origin) return;
      applyConfiguration(event.data.config || {});
      window.removeEventListener("message", receive);
      frame.remove();
    };
    window.addEventListener("message", receive);
    frame.src = "index.html?config=1";
    document.body.append(frame);
  }
})();
