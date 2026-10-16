/*
 * Utilidades compartidas por las tres propuestas: avisos (toast), contador de
 * secretos, código Konami, título de pestaña y pequeños sonidos con WebAudio.
 * Cada propuesta les da su propio estilo desde su CSS (.toast, .eggs-*).
 */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function storage(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      return null;
    }
  }

  // ---------- Toast ----------
  let toastEl, toastTimer;
  function toast(html, ms = 3600) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = html;
    toastEl.classList.remove("is-on");
    void toastEl.offsetWidth;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), ms);
  }

  // ---------- Contador de secretos ----------
  // defs: [{ id, pista }]. Devuelve { found(id, mensaje) }.
  function secrets(defs, { key, label = "secretos", onAll } = {}) {
    const found = new Set(storage(key) || []);
    const btn = document.createElement("button");
    btn.className = "eggs-btn";
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    const panel = document.createElement("div");
    panel.className = "eggs-panel";
    panel.hidden = true;
    document.body.append(btn, panel);

    function render() {
      btn.innerHTML = `<span class="eggs-ico" aria-hidden="true">✦</span> <b>${found.size}/${defs.length}</b> <span class="eggs-label">${label}</span>`;
      btn.setAttribute("aria-label", `${found.size} de ${defs.length} ${label} encontrados`);
      panel.innerHTML =
        `<p class="eggs-title">Secretos de esta página</p><ol>` +
        defs
          .map((d) =>
            found.has(d.id)
              ? `<li class="is-found"><span>✓</span> ${d.nombre}</li>`
              : `<li><span>?</span> ${d.pista}</li>`
          )
          .join("") +
        `</ol><button type="button" class="eggs-reset">Reiniciar contador</button>`;
      btn.classList.toggle("is-complete", found.size === defs.length);
    }
    btn.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      btn.setAttribute("aria-expanded", String(!panel.hidden));
    });
    panel.addEventListener("click", (e) => {
      if (e.target.closest(".eggs-reset")) {
        found.clear();
        storage(key, []);
        render();
      }
    });
    document.addEventListener("click", (e) => {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        panel.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
    });
    render();

    return {
      found(id, mensaje) {
        const isNew = !found.has(id);
        if (isNew) {
          found.add(id);
          storage(key, [...found]);
          render();
          btn.classList.remove("is-bump");
          void btn.offsetWidth;
          btn.classList.add("is-bump");
        }
        if (mensaje) toast(mensaje + (isNew ? ` <small>· secreto ${found.size}/${defs.length}</small>` : ""));
        if (isNew && found.size === defs.length && onAll) setTimeout(onAll, 1600);
        return isNew;
      },
    };
  }

  // ---------- Konami (↑↑↓↓←→←→BA) ----------
  function konami(cb) {
    const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let i = 0;
    document.addEventListener("keydown", (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === seq[i] ? i + 1 : k === seq[0] ? 1 : 0;
      if (i === seq.length) {
        i = 0;
        cb();
      }
    });
  }

  // Toques rápidos repetidos sobre un elemento (alternativa táctil al Konami).
  function taps(el, n, cb) {
    let count = 0, timer;
    el.addEventListener("click", () => {
      count++;
      clearTimeout(timer);
      timer = setTimeout(() => (count = 0), 600);
      if (count >= n) {
        count = 0;
        cb();
      }
    });
  }

  // ---------- Título de la pestaña ----------
  function tabTitle(away, back) {
    const original = document.title;
    let t;
    document.addEventListener("visibilitychange", () => {
      clearTimeout(t);
      if (document.hidden) document.title = away;
      else {
        document.title = back;
        t = setTimeout(() => (document.title = original), 2200);
      }
    });
  }

  // ---------- Sonidos (solo tras una interacción del usuario) ----------
  let ctx;
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  const audio = {
    muted: storage("kit-muted") === true,
    // Contexto de audio para sonidos propios de cada propuesta (null si está silenciado).
    ctx() {
      return this.muted ? null : ac();
    },
    click(vol = 0.18) {
      const c = !this.muted && ac();
      if (!c) return;
      const len = 0.035, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
      const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      f.type = "bandpass";
      f.frequency.value = 1800 + Math.random() * 900;
      g.gain.value = vol;
      src.buffer = buf;
      src.connect(f).connect(g).connect(c.destination);
      src.start();
    },
    tone(freq = 1760, dur = 0.9, vol = 0.12, type = "sine") {
      const c = !this.muted && ac();
      if (!c) return;
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur);
    },
    boom() {
      const c = !this.muted && ac();
      if (!c) return;
      const len = 1.2, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5);
      const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      f.type = "lowpass";
      f.frequency.value = 420;
      g.gain.value = 0.9;
      src.buffer = buf;
      src.connect(f).connect(g).connect(c.destination);
      src.start();
    },
    setMuted(m) {
      this.muted = m;
      storage("kit-muted", m);
    },
  };

  // ---------- Formulario de contacto (Web3Forms) ----------
  // El correo de destino vive en la cuenta de Web3Forms: nunca aparece en el código de la web.
  const esc = (t) => String(t == null ? "" : t).replace(/[&"<>]/g, (c) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[c]);

  function contactForm(form, { subject = "Nuevo mensaje desde tu web" } = {}) {
    const M = window.MARIANA || {};
    const status = $("[data-status]", form), btn = $('[type="submit"]', form), select = form.elements.servicio;
    const alt = $("[data-email-alt]", form), mail = ((M.contacto || {}).emailPublico || "").trim();
    if (alt && mail) {
      alt.innerHTML = `¿Prefieres el correo? <a href="mailto:${esc(mail)}">${esc(mail)}</a>`;
      alt.hidden = false;
    }
    if (select && select.options.length <= 1) {
      (M.servicios || []).forEach((s) => select.add(new Option(s.nombre, s.nombre)));
      select.add(new Option("Otra cosa", "Otra cosa"));
    }
    function show(state, msg) {
      if (!status) return;
      status.dataset.state = state;
      status.textContent = msg;
    }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form));
      if (data.botcheck) return; // relleno por un bot
      delete data.botcheck;
      const key = ((M.contacto || {}).web3formsKey || "").trim();
      if (!/^[0-9a-f-]{36}$/i.test(key)) return show("error", "El formulario aún no está conectado: falta la clave de Web3Forms en assets/data.js.");
      btn.disabled = true;
      show("sending", "Enviando…");
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: key, subject: subject + (data.servicio ? " · " + data.servicio : ""), from_name: "Web de Mariana Díaz", ...data }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.message || "HTTP " + res.status);
        form.reset();
        show("ok", "¡Mensaje enviado! Te responderé muy pronto.");
      } catch (err) {
        show("error", "No se pudo enviar. Inténtalo de nuevo en un momento.");
      } finally {
        btn.disabled = false;
      }
    });

    // Rellena el formulario, cierra cualquier ventana abierta, lo muestra y enfoca el primer campo vacío.
    function fill({ servicio, mensaje } = {}) {
      document.querySelectorAll("dialog[open]").forEach((d) => d.close());
      if (servicio && select) select.value = servicio;
      if (mensaje) form.elements.message.value = mensaje;
      show("", "");
      form.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      const empty = $$("input:not([type=checkbox]), textarea", form).find((el) => !el.value.trim());
      setTimeout(() => (empty || form.elements.message).focus({ preventScroll: true }), reduced ? 0 : 600);
    }
    // Cualquier enlace o botón con data-fill-serv / data-fill-msg lleva aquí ya rellenado.
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest("[data-fill-serv], [data-fill-msg]");
      if (!a) return;
      e.preventDefault();
      fill({ servicio: a.dataset.fillServ, mensaje: a.dataset.fillMsg });
    });
    return { fill };
  }

  // Mensaje para quien abra la consola.
  function consoleHello(lines, css) {
    try {
      console.log("%c" + lines[0], css);
      lines.slice(1).forEach((l) => console.log(l));
    } catch (e) {}
  }

  window.Kit = { $, $$, reduced, storage, toast, secrets, konami, taps, tabTitle, audio, consoleHello, esc, contactForm };
})();
