(function () {
  "use strict";

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initMenu();
    initReveal();
    initCounters();
    initScrollspy();
    initLightbox();
    initSlider();
    initForm();
    initBackToTop();
    initParallax();
  });

  /* ---------- Hero parallax ---------- */
  function initParallax() {
    var art = $(".hero-art");
    if (!art || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var ticking = false;
    var update = function () {
      var y = Math.min(window.scrollY, window.innerHeight);
      art.style.transform = "translateY(" + y * 0.22 + "px) scale(1.08)";
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Header scroll state ---------- */
  function initHeader() {
    var header = $(".site-header");
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var toggle = $("#menuToggle");
    var nav = $("#mainNav");
    if (!toggle || !nav) return;

    var setState = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", function () {
      setState(!nav.classList.contains("is-open"));
    });

    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        setState(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setState(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window) || els.length === 0) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    var counters = $$(".count");
    if (counters.length === 0 || !("IntersectionObserver" in window)) return;

    var format = function (n) {
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    var animate = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;
      var duration = 1400;
      var start;

      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = format(Math.round(target * eased));
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = format(target);
        }
      };

      requestAnimationFrame(step);
    };

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Scrollspy ---------- */
  function initScrollspy() {
    var links = $$(".nav-link");
    var sections = links
      .map(function (link) {
        var id = link.getAttribute("href");
        return id && id.charAt(0) === "#" ? $(id) : null;
      })
      .filter(Boolean);

    if (sections.length === 0 || !("IntersectionObserver" in window)) return;

    var setActive = function (id) {
      links.forEach(function (link) {
        var active = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      io.observe(section);
    });
  }

  /* ---------- Gallery lightbox ---------- */
  function initLightbox() {
    var items = $$(".gallery-item");
    var lightbox = $("#lightbox");
    if (items.length === 0 || !lightbox) return;

    var img = $("#lightboxImg");
    var caption = $("#lightboxCaption");
    var current = 0;

    var open = function (index) {
      current = index;
      render();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      $(".lightbox__close", lightbox).focus();
    };

    var close = function () {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    var render = function () {
      var item = items[current];
      img.src = item.getAttribute("data-img");
      img.alt = item.querySelector("img").alt;
      caption.textContent = item.getAttribute("data-caption") || "";
    };

    items.forEach(function (item, index) {
      item.addEventListener("click", function () {
        open(index);
      });
    });

    $(".lightbox__close", lightbox).addEventListener("click", close);
    $(".lightbox__prev", lightbox).addEventListener("click", function () {
      current = (current - 1 + items.length) % items.length;
      render();
    });
    $(".lightbox__next", lightbox).addEventListener("click", function () {
      current = (current + 1) % items.length;
      render();
    });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowLeft") {
        $(".lightbox__prev", lightbox).click();
      } else if (e.key === "ArrowRight") {
        $(".lightbox__next", lightbox).click();
      }
    });
  }

  /* ---------- Testimonials slider ---------- */
  function initSlider() {
    var track = $("#sliderTrack");
    if (!track) return;

    var slides = $$(".slide", track);
    var dotsWrap = $("#sliderDots");
    var prev = $("#prevSlide");
    var next = $("#nextSlide");
    var index = 0;
    var timer = null;
    var AUTOPLAY = 7000;

    var show = function (i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, k) {
        slide.classList.toggle("is-active", k === index);
        slide.setAttribute("aria-hidden", k === index ? "false" : "true");
      });
      $$(".slider__dot", dotsWrap).forEach(function (dot, k) {
        dot.classList.toggle("is-active", k === index);
        dot.setAttribute("aria-selected", k === index ? "true" : "false");
      });
    };

    var start = function () {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, AUTOPLAY);
    };

    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider__dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Testimonial " + (i + 1) + " of " + slides.length);
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
      dotsWrap.appendChild(dot);
    });

    prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });
    next.addEventListener("click", function () {
      show(index + 1);
      start();
    });

    var slider = $("#slider");
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);

    show(0);
    start();
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    var form = $("#contactForm");
    if (!form) return;

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var firstInvalid = null;

      $$("[required]", form).forEach(function (field) {
        var row = field.closest(".form-row");
        var error = row ? $(".form-error", row) : null;
        var message = "";

        if (!field.value.trim()) {
          message = "This field is required.";
        } else if (field.type === "email" && !EMAIL_RE.test(field.value.trim())) {
          message = "Please enter a valid email.";
        }

        row.classList.toggle("is-invalid", !!message);
        if (error) error.setAttribute("data-error", message);

        if (message && !firstInvalid) firstInvalid = field;
        if (message) valid = false;
      });

      var status = $("#formStatus");
      if (!valid) {
        status.textContent = "Please review the highlighted fields.";
        status.className = "form-status is-error";
        firstInvalid.focus();
        return;
      }

      var btn = $("#submitBtn");
      var original = btn.textContent;
      btn.disabled = true;
      btn.classList.add("is-loading");
      btn.textContent = "Sending…";

      window.setTimeout(function () {
        status.textContent =
          "Message sent successfully! Our team will contact you within 1 business day.";
        status.className = "form-status is-success";
        btn.disabled = false;
        btn.classList.remove("is-loading");
        btn.textContent = original;
        form.reset();
        $$(".form-row.is-invalid", form).forEach(function (row) {
          row.classList.remove("is-invalid");
        });
      }, 900);
    });

    $$("input, select, textarea", form).forEach(function (field) {
      field.addEventListener("input", function () {
        field.closest(".form-row").classList.remove("is-invalid");
      });
      field.addEventListener("change", function () {
        field.closest(".form-row").classList.remove("is-invalid");
      });
    });
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = $("#backToTop");
    if (!btn) return;

    var onScroll = function () {
      btn.classList.toggle("is-visible", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();