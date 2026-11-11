const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("active");
  menuToggle.setAttribute("aria-expanded", open);
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Highlight the current section in the menu
const links = [...navMenu.querySelectorAll("a")];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((l) => l.classList.toggle("current", l.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => observer.observe(s));

// Copy buttons (prompt text and email)
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copyText || document.querySelector(btn.dataset.copy).textContent;
    const label = btn.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copied";
    } catch (e) {
      btn.textContent = "Copy failed";
    }
    setTimeout(() => (btn.textContent = label), 1800);
  });
});

// Prompt lab: tabs
const tabs = [...document.querySelectorAll(".tab")];
function showTab(tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute("aria-controls"));
    panel.hidden = !on;
    panel.classList.toggle("active", on);
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => showTab(tab));
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    showTab(next);
    next.focus();
  });
});

// Prompt lab: basic vs my prompt
document.querySelectorAll(".compare").forEach((box) => {
  const pre = box.querySelector("pre");
  box.querySelectorAll(".sw").forEach((sw) => {
    sw.addEventListener("click", () => {
      box.querySelectorAll(".sw").forEach((b) => b.classList.toggle("active", b === sw));
      pre.classList.add("swap");
      setTimeout(() => {
        pre.textContent = pre.dataset[sw.dataset.v];
        pre.classList.toggle("is-mine", sw.dataset.v === "mine");
        pre.classList.remove("swap");
      }, 180);
    });
  });
});

// Scroll progress bar
const bar = document.querySelector(".progress");
function updateBar() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
}
addEventListener("scroll", updateBar, { passive: true });
updateBar();

// Reveal on scroll (staggered inside grids)
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const targets = document.querySelectorAll(
  ".section-head, .split > *, .about-text, .facts div, .skills-grid article, .tools, .project, .prompt-lab, .edu-card, .journey li, .contact > *"
);
if (reduce || !("IntersectionObserver" in window)) {
  targets.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        el.classList.add("in");
        io.unobserve(el);
        // free the element afterwards so hover effects can use transform
        if (!el.classList.contains("section-head")) {
          el.addEventListener("transitionend", function done(ev) {
            if (ev.target !== el || ev.propertyName !== "transform") return;
            el.classList.remove("reveal", "in");
            el.style.removeProperty("--d");
            el.removeEventListener("transitionend", done);
          });
        }
      }
    });
  }, { threshold: 0.15 });
  targets.forEach((el) => {
    el.classList.add("reveal");
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal") || c === el);
    el.style.setProperty("--d", Math.min(sibs.indexOf(el), 5) * 0.08 + "s");
    io.observe(el);
  });
}

// Count-up numbers in the hero
document.querySelectorAll("[data-count]").forEach((el) => {
  const end = +el.dataset.count, suffix = el.dataset.suffix || "";
  if (reduce) return;
  const start = performance.now();
  (function tick(now) {
    const t = Math.min((now - start - 700) / 1200, 1);
    el.textContent = Math.round(end * Math.max(t, 0)) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  })(start);
});

// Cursor spotlight on skill cards
document.querySelectorAll(".skills-grid article").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - r.left + "px");
    card.style.setProperty("--my", e.clientY - r.top + "px");
  });
});

// YouTube: load the player only when the visitor taps play
document.querySelectorAll(".yt").forEach((box) => {
  box.querySelector(".yt-play").addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = "https://www.youtube.com/embed/" + box.dataset.id + "?autoplay=1&rel=0&playsinline=1";
    f.title = box.dataset.title;
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    f.referrerPolicy = "strict-origin-when-cross-origin";
    f.allowFullscreen = true;
    box.replaceChildren(f);
  });
});
