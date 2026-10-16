/* Propuesta 1 · "Un pedacito de mí" */
(function () {
  const M = window.MARIANA;
  const { $, $$, reduced, toast, audio, esc } = window.Kit;
  const IMG = "../assets/img/";
  const fine = window.matchMedia("(pointer: fine)").matches;

  // Generador pseudoaleatorio con semilla: el tablero se ve igual en cada visita.
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Estallido irregular como los de su portafolio.
  function burstPoints(spikes, outer, inner, seed) {
    const r = rng(seed), pts = [];
    for (let i = 0; i < spikes * 2; i++) {
      const a = (Math.PI * i) / spikes - Math.PI / 2 + (r() - 0.5) * 0.25;
      const rad = i % 2 ? inner * (0.85 + r() * 0.3) : outer * (0.78 + r() * 0.3);
      pts.push((Math.cos(a) * rad).toFixed(1) + "," + (Math.sin(a) * rad).toFixed(1));
    }
    return pts.join(" ");
  }
  function burstSVG(color, seed) {
    return `<svg viewBox="-100 -100 200 200" width="100%" height="100%"><polygon fill="${color}" points="${burstPoints(11, 98, 52, seed)}"/></svg>`;
  }

  // ---------------- Secretos ----------------
  const eggs = window.Kit.secrets(
    [
      { id: "badge", nombre: "Pase VIP", pista: "Mi credencial tiene otra cara…" },
      { id: "ai", nombre: "Hecho por una humana", pista: "Hay stickers en el tablero que se dejan tocar." },
      { id: "ideas", nombre: "Una chica con ideas", pista: "¿Y si le das a las ideas?" },
      { id: "bandera", nombre: "Hecho en Venezuela", pista: "Una banderita ondea en una esquina." },
      { id: "maquina", nombre: "La máquina funciona", pista: "La máquina de escribir no es de adorno." },
      { id: "cafe", nombre: "Café desde 1940", pista: "Marca el año en que nació un café que diseñé." },
      { id: "y2k", nombre: "Modo 2001", pista: "Marca el primer año del siglo XXI." },
      { id: "boom", nombre: "¡Big bang!", pista: "Alguien explosivo se asoma por abajo… (o marca a emergencias)." },
      { id: "creativa", nombre: "Modo creativa", pista: "↑ ↑ ↓ ↓ ← → ← → B A  (o toca mi nombre 5 veces)." },
    ],
    { key: "md-p1-secretos", onAll: celebrate }
  );

  // Formulario de contacto (Web3Forms): todos los "Lo quiero" de la página llevan aquí.
  const contact = window.Kit.contactForm($("#contact-form"), { subject: "Nueva postal desde tu web" });

  // ---------------- Hero ----------------
  $$(".sticker-burst").forEach((el, i) => {
    const pts = burstPoints(13, 98, 64, 11 + i);
    el.querySelector(".burst").setAttribute("points", pts);
    el.querySelector(".burst-shadow").setAttribute("points", pts);
  });
  $("#agenda").addEventListener("click", () => $("#contacto").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }));

  // ---------------- Credencial con péndulo ----------------
  (function badge() {
    const rig = $("#badge"), card = $(".badge", rig);
    let th = 0, w = 0, raf = null, last = 0, dragging = false;
    let prevTh = 0, prevT = 0;

    function step(t) {
      const dt = Math.min(0.032, (t - last) / 1000 || 0.016);
      last = t;
      if (!dragging) {
        w += (-26 * Math.sin(th) - 1.6 * w) * dt;
        th += w * dt;
      }
      rig.style.transform = `rotate(${th}rad)`;
      if (dragging || Math.abs(w) > 0.002 || Math.abs(th) > 0.002) raf = requestAnimationFrame(step);
      else { raf = null; th = w = 0; rig.style.transform = ""; }
    }
    function run() { if (!raf && !reduced) { last = performance.now(); raf = requestAnimationFrame(step); } }
    function kick(v) { w = Math.max(-4, Math.min(4, w + v)); run(); }

    function pivot() {
      const r = rig.parentElement.getBoundingClientRect();
      return { x: r.left + rig.offsetLeft + rig.offsetWidth / 2, y: r.top + rig.offsetTop };
    }

    let downX = 0, downY = 0, downT = 0, moved = false, lastTap = 0;
    card.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      try { card.setPointerCapture(e.pointerId); } catch (err) {}
      downX = e.clientX; downY = e.clientY; downT = performance.now(); moved = false;
      prevTh = th; prevT = downT;
    });
    card.addEventListener("pointermove", (e) => {
      if (!card.hasPointerCapture(e.pointerId)) return;
      if (!moved && Math.hypot(e.clientX - downX, e.clientY - downY) > 6) { moved = true; dragging = true; run(); }
      if (!moved) return;
      const p = pivot();
      const target = Math.max(-1.1, Math.min(1.1, Math.atan2(-(e.clientX - p.x), e.clientY - p.y)));
      const now = performance.now();
      w = ((target - prevTh) / Math.max(1, now - prevT)) * 1000;
      prevTh = th = target; prevT = now;
    });
    function release(e) {
      if (card.hasPointerCapture(e.pointerId)) card.releasePointerCapture(e.pointerId);
      if (dragging) { dragging = false; w = Math.max(-5, Math.min(5, w)); run(); return; }
      if (!moved && performance.now() - downT < 400) {
        const now = performance.now();
        if (now - lastTap < 380) { flip(); lastTap = 0; } else { lastTap = now; kick((Math.random() > 0.5 ? 1 : -1) * 1.4); }
      }
    }
    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });

    function flip() {
      card.classList.toggle("is-flipped");
      kick(1.2);
      if (card.classList.contains("is-flipped")) eggs.found("badge", "🎟️ ¡Tienes <b>pase VIP</b> al lugar donde nacen las ideas!");
    }

    // Se balancea un poco al hacer scroll.
    let lastY = window.scrollY;
    window.addEventListener("scroll", () => {
      const d = window.scrollY - lastY;
      lastY = window.scrollY;
      if (window.scrollY < window.innerHeight) kick(Math.max(-0.6, Math.min(0.6, d * 0.012)));
    }, { passive: true });
    setTimeout(() => kick(1.6), 500);
  })();

  // ---------------- Sobre mí: máquina de escribir ----------------
  const paperAbout = $("#paper-about");
  paperAbout.innerHTML =
    `<h3>sobre mí</h3><p>${M.bio}</p>` +
    `<h4>Experiencia laboral</h4>` +
    M.experiencia.map((e) => `<p>${e.empresa} – ${e.anios.replace(" – ", "/")}<br>${e.rol}</p>`).join("") +
    `<h4>Estudios</h4><p>${M.estudios.carrera} – ${M.estudios.anio}<br>${M.estudios.universidad}</p>` +
    `<h4>Hoy</h4><p>Freelance, con agenda abierta para marcas que quieren verse como se sienten.</p>`;

  // Teclado de la máquina: cada tecla es un botón y también se hunde con el teclado físico.
  const ROWS = [[..."1234567890", "Backspace"], [..."QWERTYUIOP"], [..."ASDFGHJKLÑ", "Enter"], [..."ZXCVBNM,.-"]];
  const LABEL = { Backspace: "⌫", Enter: "↵" };
  $("#keys").innerHTML = ROWS.map((row) =>
    `<div class="key-row">${row.map((k) => `<button type="button" tabindex="-1" class="key${LABEL[k] ? " key-wide" : ""}" data-k="${k}">${LABEL[k] || k}</button>`).join("")}</div>`
  ).join("");
  const keyEls = {};
  $$("#keys [data-k], .spacebar").forEach((el) => (keyEls[el.dataset.k] = el));
  // Tecla física (e.code) → tecla de la máquina. Así Shift+1 hunde el "1" y la ñ del teclado español hunde la Ñ.
  const CODE = { Space: " ", Backspace: "Backspace", Enter: "Enter", NumpadEnter: "Enter", Semicolon: "Ñ", Comma: ",", Period: ".", Slash: "-", Minus: "-" };
  function keyFor(key, code) {
    let k = CODE[code] || (/^Key[A-Z]$/.test(code) && code.slice(3)) || (/^(Digit|Numpad)\d$/.test(code) && code.slice(-1));
    if (!k && key && key.length === 1) {
      const up = key.toUpperCase();
      k = keyEls[up] ? up : up.normalize("NFD").replace(/[̀-ͯ]/g, "");
    }
    return (k && keyEls[k]) || null;
  }
  // Toque rápido: lo usan la escritura automática del "sobre mí" y los teclados táctiles.
  function press(ch) {
    const el = keyFor(ch, "") || (ch && ch.trim() ? keyEls[ROWS[1][Math.floor(Math.random() * 10)]] : null);
    if (!el) return;
    el.classList.add("is-down");
    setTimeout(() => el.classList.remove("is-down"), 90);
  }

  // Escribe el texto de la hoja letra a letra. La hoja tiene su altura final desde el principio
  // (el texto existe pero es transparente hasta que empieza), así la máquina no se mueve.
  function typeInto(root, msPerStep) {
    root.classList.add("is-pending");
    let nodes = [], texts = [], i = 0, j = 0, cur = null, timer = null, done = false;
    return {
      start() {
        if (done) return;
        root.style.minHeight = root.offsetHeight + "px";
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
        texts = nodes.map((n) => n.nodeValue);
        nodes.forEach((n) => (n.nodeValue = ""));
        root.classList.remove("is-pending");
        (function tick() {
          if (cur) cur.classList.remove("cur");
          if (i >= nodes.length) return;
          const t = texts[i];
          j = Math.min(t.length, j + 2);
          nodes[i].nodeValue = t.slice(0, j);
          press(t[j - 1]);
          cur = nodes[i].parentElement;
          cur.classList.add("cur");
          if (j >= t.length) { i++; j = 0; }
          timer = setTimeout(tick, msPerStep);
        })();
      },
      // Termina de golpe (por ejemplo, si piden una hoja nueva antes de que acabe).
      finish() {
        done = true;
        clearTimeout(timer);
        root.classList.remove("is-pending");
        nodes.forEach((n, k) => (n.nodeValue = texts[k]));
        if (cur) cur.classList.remove("cur");
        i = nodes.length;
      },
    };
  }
  const typer = reduced ? null : typeInto(paperAbout, 22);
  if (typer) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); typer.start(); }
    }, { threshold: 0.35 });
    io.observe(paperAbout);
  }

  // Software con palomitas que se dibujan.
  const sw = $("#software");
  sw.innerHTML = M.software
    .map((s, i) => `<li><svg viewBox="0 0 20 20" aria-hidden="true"><path style="transition-delay:${i * 0.18}s" d="M3 11 l4.5 4.5 L17 4"/></svg>${s}</li>`)
    .join("");
  new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { sw.classList.add("is-on"); o.disconnect(); } }, { threshold: 0.6 }).observe(sw);

  // Sonidos de máquina de escribir, sintetizados con WebAudio (solo suenan tras una interacción).
  const TW = (function () {
    let buf = null, out = null;
    function ctx() {
      const c = audio.ctx();
      if (c && !buf) {
        buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        out = c.createGain();
        out.gain.value = 0.8;
        out.connect(c.createDynamicsCompressor()).connect(c.destination);
      }
      return c;
    }
    function noise(c, t, dur, type, freq, vol, q = 1, sweepTo) {
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf;
      f.type = type;
      f.Q.value = q;
      f.frequency.setValueAtTime(freq, t);
      if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(out);
      s.start(t, Math.random() * 0.8, dur + 0.05);
    }
    function thump(c, t, f0, f1, dur, vol) {
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + dur + 0.02);
    }
    return {
      // Golpe de tecla: clic de la palanca y, un instante después, el tipo contra el rodillo.
      key() {
        const c = ctx(); if (!c) return;
        const t = c.currentTime, r = Math.random(), hit = t + 0.012 + r * 0.008;
        noise(c, t, 0.02, "highpass", 3000 + r * 1200, 0.25);
        thump(c, t, 240 + r * 50, 110, 0.05, 0.18);
        noise(c, hit, 0.045, "bandpass", 1500 + r * 700, 0.9, 1.4);
        thump(c, hit, 170, 65, 0.07, 0.35);
      },
      space() {
        const c = ctx(); if (!c) return;
        const t = c.currentTime;
        noise(c, t, 0.015, "highpass", 2500, 0.12);
        noise(c, t, 0.07, "lowpass", 900, 0.5);
        thump(c, t, 130, 55, 0.1, 0.45);
      },
      back() {
        const c = ctx(); if (!c) return;
        const t = c.currentTime;
        noise(c, t, 0.015, "highpass", 3500, 0.2);
        noise(c, t + 0.02, 0.04, "bandpass", 1100, 0.45);
        thump(c, t, 260, 120, 0.05, 0.2);
      },
      // Retorno de carro: barrido del carro, trinquete y golpe final.
      ret() {
        const c = ctx(); if (!c) return;
        const t = c.currentTime;
        noise(c, t, 0.34, "bandpass", 600, 0.35, 2, 3200);
        for (let i = 0; i < 7; i++) noise(c, t + 0.03 + i * 0.042, 0.012, "highpass", 2500, 0.18);
        thump(c, t + 0.36, 150, 55, 0.12, 0.55);
        noise(c, t + 0.36, 0.05, "bandpass", 900, 0.6);
      },
      // Timbre que avisa del final de la línea.
      bell() {
        const c = ctx(); if (!c) return;
        const t = c.currentTime;
        [[1, 0.22], [2.76, 0.08], [5.4, 0.04]].forEach(([m, v]) => {
          const o = c.createOscillator(), g = c.createGain();
          o.frequency.value = 2093 * m;
          g.gain.setValueAtTime(v, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 / m);
          o.connect(g).connect(out);
          o.start(t);
          o.stop(t + 1.7);
        });
      },
      // Hoja nueva: el papel se desliza y la perilla del rodillo hace clic-clic.
      feed() {
        const c = ctx(); if (!c) return;
        const t = c.currentTime + 0.2;
        noise(c, t, 0.8, "bandpass", 1800, 0.12, 0.8, 900);
        for (let i = 0; i < 12; i++) noise(c, t + i * 0.06, 0.012, "highpass", 2800 + (i % 2) * 600, 0.14);
      },
    };
  })();

  // Escribirle una nota: cada vez entra una hoja nueva en blanco.
  (function note() {
    const tw = $("#typewriter"), stack = $("#paper-stack"), sheet = $("#paper-note"), input = $("#note-input"), body = $("#note-body");
    const startBtn = $("#note-start"), send = $(".note-send"), soundBtn = $("#sound-toggle");
    let inView = false, writing = false, cpl = 40, lastCol = 0, lastSound = 0;
    const down = {};
    new IntersectionObserver((en) => (inView = en[0].isIntersecting), { threshold: 0.4 }).observe(tw);

    // Cuántos caracteres caben en una línea de la hoja (Courier: todos miden lo mismo).
    function measure() {
      const probe = document.createElement("span");
      probe.textContent = "M".repeat(20);
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
      body.appendChild(probe);
      const cw = probe.getBoundingClientRect().width / 20;
      probe.remove();
      if (cw) cpl = Math.max(12, Math.floor(body.clientWidth / cw));
    }
    // El carro se mueve a la izquierda con cada letra y vuelve con el retorno.
    function carriage(fromUser) {
      const v = input.value, line = v.slice(v.lastIndexOf("\n") + 1), col = line.length % cpl;
      const S = Math.min(26, tw.clientWidth * 0.045);
      tw.classList.toggle("is-returning", col < lastCol - 1);
      tw.style.setProperty("--carriage", (writing ? S - (col / cpl) * 2 * S : 0).toFixed(1) + "px");
      if (fromUser) {
        if (col === cpl - 6 && lastCol === cpl - 7) TW.bell();
        if (col === 0 && lastCol === cpl - 1 && line.length) TW.ret();
      }
      lastCol = col;
    }
    function sync() {
      const v = input.value;
      body.textContent = v;
      if (v.trim()) eggs.found("maquina", "⌨️ ¡La máquina funciona! Escríbele lo que quieras y envíala.");
    }
    // Saca la hoja escrita por arriba y mete una en blanco desde el rodillo.
    function freshSheet(ejectOld) {
      if (ejectOld) {
        const old = sheet.cloneNode(true);
        old.removeAttribute("id");
        old.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        old.classList.add("is-ejected");
        old.setAttribute("aria-hidden", "true");
        stack.appendChild(old);
        old.addEventListener("animationend", () => old.remove());
        sheet.classList.add("is-feeding");
      }
      input.value = "";
      lastCol = 0;
      sync();
      void sheet.offsetWidth;
      sheet.classList.remove("is-feeding");
      TW.feed();
      carriage(false);
    }
    // Deja a la vista el rodillo (donde se escribe) y el teclado.
    function bringIntoView() {
      const top = $(".roller", tw).getBoundingClientRect().top, target = window.innerHeight - 320;
      if (top < 180 || top > target + 40) window.scrollBy({ top: top - Math.max(180, target), behavior: reduced ? "auto" : "smooth" });
    }
    function enter(focus) {
      if (!writing) {
        if (typer) typer.finish();
        writing = true;
        tw.classList.add("is-writing");
        sheet.setAttribute("aria-hidden", "false");
        startBtn.hidden = true;
        send.hidden = false;
        measure();
        freshSheet(false);
      }
      if (focus) input.focus({ preventScroll: true });
    }
    function exit() {
      writing = false;
      tw.classList.remove("is-writing", "is-returning");
      tw.style.setProperty("--carriage", "0px");
      sheet.setAttribute("aria-hidden", "true");
      startBtn.hidden = false;
      send.hidden = true;
      input.blur();
    }
    function soundFor(key) {
      if (key === "Enter") TW.ret();
      else if (key === "Backspace") TW.back();
      else if (key === " ") TW.space();
      else if (key.length === 1 || key === "Dead") TW.key();
      else return;
      lastSound = performance.now();
    }
    // Golpe con el ratón o el dedo sobre una tecla de la máquina.
    function strike(k) {
      enter(fine);
      const v = input.value;
      if (k === "Backspace") { input.value = v.slice(0, -1); TW.back(); }
      else if (v.length >= input.maxLength) return;
      else if (k === "Enter") { input.value = v + "\n"; TW.ret(); }
      else if (k === " ") { input.value = v + " "; TW.space(); }
      else { input.value = v + k.toLowerCase(); TW.key(); }
      lastSound = performance.now();
      sync();
      carriage(true);
    }

    $("#machine").addEventListener("pointerdown", (e) => {
      const k = e.target.closest("[data-k]");
      if (!k || e.button > 0) return;
      e.preventDefault(); // que el foco siga en la hoja
      k.classList.add("is-down");
      strike(k.dataset.k);
      const up = () => {
        k.classList.remove("is-down");
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
      };
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    });

    // Teclado físico: la tecla se hunde mientras la mantienes y suena al pulsarla.
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target !== input) {
        if (!inView || (e.target.closest && e.target.closest("input,textarea,select,button,a,[contenteditable],dialog"))) return;
        if (!(e.key.length === 1 || (writing && (e.key === "Backspace" || e.key === "Enter")))) return;
        enter(true);
      } else if (e.key === "Escape") {
        return exit();
      }
      const el = keyFor(e.key, e.code);
      if (el) { el.classList.add("is-down"); down[e.code || e.key] = el; }
      soundFor(e.key);
    });
    document.addEventListener("keyup", (e) => {
      const el = down[e.code || e.key];
      if (el) { el.classList.remove("is-down"); delete down[e.code || e.key]; }
    });
    window.addEventListener("blur", () => {
      Object.keys(down).forEach((c) => { down[c].classList.remove("is-down"); delete down[c]; });
    });

    input.addEventListener("input", (e) => {
      sync();
      carriage(true);
      // Teclados táctiles: no mandan un keydown útil, así que el sonido y la tecla salen de aquí.
      if (performance.now() - lastSound > 80) {
        const t = e.inputType || "";
        if (t === "insertLineBreak") TW.ret();
        else if (t.startsWith("delete")) TW.back();
        else if (e.data === " ") TW.space();
        else TW.key();
        press(e.data ? e.data.slice(-1) : "");
      }
    });

    startBtn.addEventListener("click", () => { enter(true); bringIntoView(); });
    $("#note-new").addEventListener("click", () => { freshSheet(true); bringIntoView(); if (fine) input.focus({ preventScroll: true }); });
    $("#note-cancel").addEventListener("click", exit);
    $("#note-send").addEventListener("click", () => contact.fill({ mensaje: input.value.trim() }));
    tw.addEventListener("click", (e) => { if (writing && fine && !e.target.closest("a,button")) input.focus({ preventScroll: true }); });
    window.addEventListener("resize", () => { if (writing) { measure(); carriage(false); } });

    function paintSound() {
      soundBtn.textContent = audio.muted ? "🔇 Sin sonido" : "🔊 Sonido";
      soundBtn.setAttribute("aria-pressed", String(!audio.muted));
    }
    soundBtn.addEventListener("click", () => { audio.setMuted(!audio.muted); paintSound(); TW.key(); });
    paintSound();
    sync();
  })();

  // ---------------- Tablero de corcho ----------------
  const board = $("#board");
  const cards = M.proyectos.map((p, i) => {
    const r = rng(i * 31 + 7);
    const fig = document.createElement("figure");
    fig.className = "pin-card";
    fig.tabIndex = 0;
    fig.setAttribute("role", "button");
    fig.setAttribute("aria-label", `Abrir proyecto ${p.titulo}`);
    fig.dataset.id = p.id;
    fig.dataset.pin = i % 4;
    fig.dataset.cats = p.categorias.join("|");
    fig.innerHTML = `<span class="tack" aria-hidden="true"></span><img src="${IMG + p.portada}" alt="" loading="lazy" draggable="false"><figcaption><b>${p.titulo}</b><span>${p.cliente}</span></figcaption>`;
    fig._j = { r: r() * 8 - 4, x: r() * 18 - 9, y: r() * 16 - 8 };
    fig.style.setProperty("--r", fig._j.r.toFixed(2) + "deg");
    board.appendChild(fig);
    return fig;
  });

  function layout() {
    const W = board.clientWidth;
    const cols = W < 560 ? 2 : W < 900 ? 3 : 4;
    const pad = W < 560 ? 14 : 36, gx = W < 560 ? 12 : 30, gy = W < 560 ? 30 : 46;
    const cw = (W - pad * 2 - gx * (cols - 1)) / cols;
    const vis = cards.filter((c) => !c.classList.contains("is-out"));
    cards.forEach((c) => c.style.setProperty("--w", cw + "px"));
    let y = pad + 6;
    for (let row = 0; row * cols < vis.length; row++) {
      const items = vis.slice(row * cols, row * cols + cols);
      const h = Math.max(...items.map((c) => c.offsetHeight));
      items.forEach((c, k) => {
        const jx = W < 560 ? c._j.x / 3 : c._j.x, jy = W < 560 ? c._j.y / 3 : c._j.y;
        c.style.setProperty("--x", (pad + k * (cw + gx) + jx).toFixed(1) + "px");
        c.style.setProperty("--y", (y + jy).toFixed(1) + "px");
      });
      y += h + gy;
    }
    board.style.height = Math.max(400, y - gy + pad + 10) + "px";
  }
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
  window.addEventListener("load", layout);
  document.fonts && document.fonts.ready.then(layout);
  layout();

  // Filtros
  const filters = $("#filters");
  filters.innerHTML = ["Todo", ...M.categorias].map((c, i) => `<button type="button" data-cat="${c}" class="${i ? "" : "is-active"}" aria-pressed="${!i}">${c}</button>`).join("");
  filters.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("button", filters).forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", String(x === b)); });
    const cat = b.dataset.cat;
    cards.forEach((c) => c.classList.toggle("is-out", cat !== "Todo" && !c.dataset.cats.split("|").includes(cat)));
    layout();
  });

  // Abrir o arrastrar fotos
  let zTop = 10;
  board.addEventListener("pointerdown", (e) => {
    const card = e.target.closest(".pin-card");
    if (!card || e.button !== 0) return;
    const sx = e.clientX, sy = e.clientY;
    const cx = parseFloat(card.style.getPropertyValue("--x")) || 0, cy = parseFloat(card.style.getPropertyValue("--y")) || 0;
    let moved = false;
    if (fine) try { card.setPointerCapture(e.pointerId); } catch (err) {}
    function move(ev) {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && fine && Math.hypot(dx, dy) > 6) { moved = true; card.classList.add("is-dragging"); card.style.zIndex = ++zTop; }
      if (!moved) return;
      const maxX = board.clientWidth - card.offsetWidth + 20, maxY = board.clientHeight - card.offsetHeight + 20;
      card.style.setProperty("--x", Math.max(-20, Math.min(maxX, cx + dx)) + "px");
      card.style.setProperty("--y", Math.max(-20, Math.min(maxY, cy + dy)) + "px");
    }
    function up(ev) {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerup", up);
      card.removeEventListener("pointercancel", up);
      card.classList.remove("is-dragging");
      if (ev.type === "pointerup" && !moved) openFolder(card.dataset.id);
    }
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", up);
    card.addEventListener("pointercancel", up);
  });
  board.addEventListener("keydown", (e) => {
    const card = e.target.closest(".pin-card");
    if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openFolder(card.dataset.id); }
  });

  // Stickers
  $("#sticker-ai").addEventListener("click", (e) => {
    e.currentTarget.classList.add("is-verified");
    audio.tone(180, 0.25, 0.25, "triangle");
    eggs.found("ai", "✋ Diseños 100% hechos por una humana. <b>THIS IS NOT AI.</b>");
  });
  const BULB = `<svg viewBox="0 0 34 46"><path d="M17 2a14 14 0 0 0-8 25c2 2 3 4 3 7h10c0-3 1-5 3-7A14 14 0 0 0 17 2z" fill="#FFE45C" stroke="#16131A" stroke-width="2.5"/><rect x="11" y="36" width="12" height="7" rx="2" fill="#9ea2aa" stroke="#16131A" stroke-width="2"/><path d="M13 22l4-6 4 6" fill="none" stroke="#16131A" stroke-width="2"/></svg>`;
  $("#sticker-idea").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect(), br = board.getBoundingClientRect();
    for (let i = 0; i < 7; i++) {
      const b = document.createElement("span");
      b.className = "bulb";
      b.innerHTML = BULB;
      b.style.left = r.left - br.left + r.width / 2 - 17 + (Math.random() * 60 - 30) + "px";
      b.style.top = r.top - br.top - 10 + "px";
      b.style.setProperty("--dx", Math.random() * 160 - 80 + "px");
      b.style.setProperty("--rot", Math.random() * 60 - 30 + "deg");
      b.style.animationDelay = i * 0.08 + "s";
      board.appendChild(b);
      setTimeout(() => b.remove(), 2400);
    }
    audio.tone(1320, 0.3, 0.06);
    eggs.found("ideas", "💡 Just a girl with ideas… y muchas más esperando tu proyecto.");
  });
  $("#flag").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("span");
      s.className = "ve-star";
      s.innerHTML = `<svg viewBox="-10 -10 20 20"><polygon fill="currentColor" points="${burstPoints(5, 10, 4, 1)}"/></svg>`;
      s.style.left = cx - 11 + "px";
      s.style.top = cy - 11 + "px";
      document.body.appendChild(s);
      const a = Math.PI * (1.12 + (i / 7) * 0.76);
      s.animate(
        [{ transform: "translate(0,0) scale(.3)", opacity: 1 }, { transform: `translate(${Math.cos(a) * 170}px, ${Math.sin(a) * 170}px) scale(1.4) rotate(140deg)`, opacity: 1, offset: 0.7 }, { transform: `translate(${Math.cos(a) * 190}px, ${Math.sin(a) * 190 + 40}px) scale(.8) rotate(200deg)`, opacity: 0 }],
        { duration: reduced ? 1 : 1700, delay: i * 60, easing: "cubic-bezier(.15,.8,.3,1)", fill: "forwards" }
      ).finished.then(() => s.remove());
    }
    eggs.found("bandera", "🇻🇪 Ocho estrellas, hecho en Venezuela, con cariño y café.");
  });

  // ---------------- Carpeta del proyecto ----------------
  const folder = $("#folder"), folderInner = $("#folder-inner");
  const TOOLS = {
    Illustrator: ["Ai", "#FF9A00", "#330000"], Photoshop: ["Ps", "#31A8FF", "#001E36"], InDesign: ["Id", "#FF3366", "#49021F"],
    "After Effects": ["Ae", "#9999FF", "#00005B"], Blender: ["Blender", "#fff", "#E87D0D"], "Corel Draw": ["Corel", "#fff", "#2b8a3e"],
  };
  let current = 0;
  function isLight(hex) {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return 0.299 * r + 0.587 * g + 0.114 * b > 150;
  }
  function openFolder(id) {
    current = Math.max(0, M.proyectos.findIndex((p) => p.id === id));
    renderFolder();
    if (!folder.open) folder.showModal();
  }
  function renderFolder() {
    const p = M.proyectos[current], imgs = [p.portada, ...p.imagenes];
    const tools = p.herramientas.map((t) => { const [a, c, b] = TOOLS[t] || [t, "#fff", "#333"]; return `<span class="tool" title="${t}" style="color:${c};background:${b}">${a}</span>`; }).join("");
    folderInner.innerHTML = `
      <div class="folder-top">
        <div class="pills" aria-label="Categorías">${M.categorias.map((c) => `<span class="${p.categorias.includes(c) ? "is-active" : ""}">${c}</span>`).join("")}</div>
        <div class="folder-ctrl">
          <button type="button" class="icon-btn" data-act="prev" aria-label="Proyecto anterior">←</button>
          <button type="button" class="icon-btn" data-act="next" aria-label="Proyecto siguiente">→</button>
          <button type="button" class="icon-btn" data-act="close" aria-label="Cerrar">✕</button>
        </div>
      </div>
      <div class="folder-grid">
        <div>
          <div class="folder-main"><img id="folder-img" src="${IMG + imgs[0]}" alt="${p.titulo}, ${p.cliente}"></div>
          ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((im, k) => `<button type="button" data-img="${im}" class="${k ? "" : "is-active"}" aria-label="Ver imagen ${k + 1} de ${imgs.length}"><img src="${IMG + im}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
        </div>
        <div>
          <h3 id="f-title">${p.titulo}</h3>
          <p class="client">${p.cliente}</p>
          <blockquote>“${p.lema}”</blockquote>
          <p class="desc">${p.descripcion}</p>
          <div class="tools">${tools}</div>
          <div class="palette">${p.paleta.map((h) => `<button type="button" data-hex="${h}" class="${isLight(h) ? "is-light" : ""}" style="background:${h}" aria-label="Copiar el color ${h}"><span>${h}</span></button>`).join("")}</div>
          <div class="folder-cta"><button type="button" class="btn btn-solid" data-fill-serv="${esc(M.servicioDe(p.categorias[0]))}" data-fill-msg="${esc(`Hola Mariana, vi tu proyecto ${p.titulo} y quiero algo así para mi marca.`)}">Quiero algo así →</button></div>
        </div>
      </div>`;
  }
  folder.addEventListener("click", (e) => {
    if (e.target === folder) return folder.close();
    const act = e.target.closest("[data-act]");
    if (act) {
      const a = act.dataset.act;
      if (a === "close") return folder.close();
      current = (current + (a === "next" ? 1 : -1) + M.proyectos.length) % M.proyectos.length;
      return renderFolder();
    }
    const th = e.target.closest("[data-img]");
    if (th) {
      $("#folder-img").src = IMG + th.dataset.img;
      $$(".thumbs button", folder).forEach((b) => b.classList.toggle("is-active", b === th));
      return;
    }
    const sw = e.target.closest("[data-hex]");
    if (sw) {
      const hex = sw.dataset.hex;
      (navigator.clipboard ? navigator.clipboard.writeText(hex) : Promise.reject()).then(
        () => toast(`🎨 Copiado <b>${hex}</b>`),
        () => toast(`🎨 ${hex}`)
      );
    }
  });
  folder.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      current = (current + (e.key === "ArrowRight" ? 1 : -1) + M.proyectos.length) % M.proyectos.length;
      renderFolder();
    }
  });

  // ---------------- Servicios ----------------
  const NOTE = [["#FFE3EC", "#F38FB0", -2.4], ["#E6E4FB", "#9C98E0", 1.8], ["#FFF4BE", "#F2C230", -1.2], ["#DDF3E6", "#7CCB9A", 2.4], ["#FFFFFF", "#EA1E2B", -1.8]];
  $("#postits").innerHTML = M.servicios
    .map((s, i) => {
      const [bg, tape, r] = NOTE[i % NOTE.length];
      return `<article class="postit" style="--bg:${bg};--tape:${tape};--r:${r}deg"><span class="tape" aria-hidden="true"></span><span class="num">0${i + 1}</span><h3>${s.nombre}</h3><p>${s.detalle}</p><a href="#contacto" data-fill-serv="${esc(s.nombre)}">Lo quiero →</a></article>`;
    })
    .join("");

  // ---------------- Contacto ----------------
  // Enlace a Behance: solo si hay un perfil puesto en data.js.
  if (M.contacto.behance) $("#c-be").href = M.contacto.behance;
  else $("#c-be").remove();

  // ---------------- Teléfono de disco ----------------
  (function rotary() {
    const CX = 200, CY = 200, RH = 139, HOLE = 26, STOP = 28;
    const angleOf = (d) => -30 - 30 * ((d === 0 ? 10 : d) - 1);
    const rad = (a) => (a * Math.PI) / 180;
    const pt = (r, a) => [CX + r * Math.cos(rad(a)), CY + r * Math.sin(rad(a))];
    const circ = (x, y, r) => `M${x + r},${y} a${r},${r} 0 1,0 ${-2 * r},0 a${r},${r} 0 1,0 ${2 * r},0 Z`;

    let d = circ(CX, CY, 184) + circ(CX, CY, 96);
    const nums = [];
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]) {
      const [x, y] = pt(RH, angleOf(n));
      d += circ(x, y, HOLE);
      nums.push(`<g class="dial-num" tabindex="0" role="button" aria-label="Marcar ${n}" data-n="${n}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${HOLE - 3}"/><text x="${x.toFixed(1)}" y="${(y + 1).toFixed(1)}">${n}</text></g>`);
    }
    $("#wheel-path").setAttribute("d", d);
    $("#dial-numbers").innerHTML = nums.join("");
    const [a1x, a1y] = pt(196, STOP - 9), [a2x, a2y] = pt(196, STOP + 7), [tx, ty] = pt(118, STOP + 2), [cx1, cy1] = pt(160, STOP - 8), [cx2, cy2] = pt(160, STOP + 10);
    $(".finger-stop").setAttribute("d", `M${a1x},${a1y} Q${cx1},${cy1} ${tx},${ty} Q${cx2},${cy2} ${a2x},${a2y} Z`);

    const wheel = $("#dial-wheel"), display = $("#dial-digits");
    let buffer = "", busy = false, queue = [], resetT;

    function show(text) { display.textContent = text; }
    function format(b) { return b.replace(/^(\d{4})(\d{0,3})(\d{0,4}).*/, (m, a, b2, c) => [a, b2, c].filter(Boolean).join(" ")) || b; }

    function dial(n) {
      if (busy) { queue.push(n); return; }
      busy = true;
      const steps = n === 0 ? 10 : n;
      const amount = STOP - angleOf(n);
      const t1 = reduced ? 1 : 200 + amount * 2, t2 = reduced ? 1 : 180 + amount * 2.6;
      wheel.animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${amount}deg)` }], { duration: t1, easing: "cubic-bezier(.45,0,.25,1)", fill: "forwards" })
        .finished.then(() => {
          for (let k = 0; k < steps; k++) setTimeout(() => audio.click(0.1), (k * t2) / steps);
          return wheel.animate([{ transform: `rotate(${amount}deg)` }, { transform: "rotate(0deg)" }], { duration: t2, easing: "linear", fill: "forwards" }).finished;
        })
        .then(() => {
          addDigit(String(n));
          busy = false;
          if (queue.length) dial(queue.shift());
        });
    }
    function addDigit(n) {
      buffer += n;
      show(format(buffer));
      clearTimeout(resetT);
      resetT = setTimeout(() => { buffer = ""; show("marca un número…"); }, 5000);
      const b = buffer;
      if (b.endsWith("1940")) { buffer = ""; cafe(); }
      else if (b.endsWith("2001")) { buffer = ""; y2k(); }
      else if (b.endsWith("911")) { buffer = ""; show("¡EMERGENCIA!"); boom(); }
      else if (b.length >= 11) {
        buffer = "";
        show("número equivocado");
        toast("😅 Número equivocado… mejor mándame una postal con el formulario de al lado.");
      }
    }
    $("#dial-numbers").addEventListener("click", (e) => { const g = e.target.closest(".dial-num"); if (g) dial(Number(g.dataset.n)); });
    $("#dial-numbers").addEventListener("keydown", (e) => {
      const g = e.target.closest(".dial-num");
      if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); dial(Number(g.dataset.n)); }
    });
  })();

  // ---------------- Modos secretos ----------------
  let cafeT;
  function cafe() {
    document.body.classList.add("mode-cafe");
    $$(".steam").forEach((s) => s.remove());
    [0.2, 0.5, 0.8].forEach((x, i) => {
      const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      s.setAttribute("class", "steam");
      s.setAttribute("viewBox", "0 0 60 300");
      s.style.left = `calc(${x * 100}% - 30px)`;
      s.innerHTML = `<path style="animation-delay:${i * 0.6}s" d="M30 300 C 5 250, 55 220, 30 170 S 5 90, 30 40"/>`;
      document.body.appendChild(s);
    });
    clearTimeout(cafeT);
    cafeT = setTimeout(() => { document.body.classList.remove("mode-cafe"); $$(".steam").forEach((s) => s.remove()); }, 9000);
    eggs.found("cafe", "☕ <b>Flor de Patria, desde 1940.</b> Más aroma, más café.");
  }

  let y2kT;
  function sparkle(e) {
    const s = document.createElement("span");
    s.className = "sparkle";
    s.textContent = ["✦", "✧", "★", "♡"][Math.floor(Math.random() * 4)];
    s.style.left = e.clientX + "px";
    s.style.top = e.clientY + "px";
    s.style.color = ["#ff5ea8", "#7d6bff", "#3fd1ff", "#ffe14d"][Math.floor(Math.random() * 4)];
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
  function y2k() {
    document.body.classList.add("mode-2001");
    window.addEventListener("pointermove", sparkle);
    clearTimeout(y2kT);
    y2kT = setTimeout(() => { document.body.classList.remove("mode-2001"); window.removeEventListener("pointermove", sparkle); }, 12000);
    eggs.found("y2k", "✨ Modo 2001: brillitos, degradados y mucha nostalgia.");
  }

  function creativa() {
    const on = document.body.classList.toggle("mode-creativa");
    if (on) eggs.found("creativa", "🌈 Modo <b>CREATIVA</b> activado. Repite el truco para apagarlo.");
    else toast("Modo creativa apagado. Todo vuelve a su sitio.");
  }
  window.Kit.konami(creativa);
  window.Kit.taps($("#wordmark"), 5, creativa);
  // El logo lleva arriba del todo (y sus toques siguen contando para el modo creativa).
  $("#wordmark").addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });

  // ---------------- Chepyto y el big bang ----------------
  const chep = $("#chepyto"), layer = $("#boom");
  let booming = false;
  function peek() { if (!booming) chep.classList.add("is-peeking"); }
  new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { setTimeout(peek, 1500); o.disconnect(); } }, { threshold: 0.2 }).observe(board);
  setTimeout(peek, 30000);
  chep.addEventListener("click", boom);
  // En contacto se esconde para no tapar los botones.
  new IntersectionObserver((en) => {
    if (en[0].isIntersecting) chep.classList.remove("is-peeking");
    else if (!booming && chep.dataset.seen) peek();
  }, { threshold: 0.25 }).observe($("#contacto"));
  chep.addEventListener("transitionend", () => { if (chep.classList.contains("is-peeking")) chep.dataset.seen = "1"; });

  function bursts(n, seed) {
    const colors = ["#EA1E2B", "#F38FB0", "#BCBADD", "#233668", "#FFE45C", "#ffffff"];
    for (let i = 0; i < n; i++) {
      const b = document.createElement("div");
      b.className = "boom-burst";
      b.innerHTML = burstSVG(colors[i % colors.length], seed + i);
      layer.appendChild(b);
      const a = Math.random() * Math.PI * 2, dist = 180 + Math.random() * Math.max(window.innerWidth, window.innerHeight) * 0.55;
      const s = 0.6 + Math.random() * 1.8;
      b.animate(
        [{ transform: "translate(0,0) scale(.1) rotate(0deg)", opacity: 1 }, { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px) scale(${s}) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.75 }, { transform: `translate(${Math.cos(a) * dist * 1.1}px, ${Math.sin(a) * dist * 1.1 + 60}px) scale(${s * 0.9})`, opacity: 0 }],
        { duration: 1500 + Math.random() * 900, easing: "cubic-bezier(.1,.8,.3,1)", fill: "forwards" }
      ).finished.then(() => b.remove());
    }
  }
  function boom() {
    if (booming) return;
    booming = true;
    chep.classList.remove("is-peeking");
    chep.classList.add("is-lit");
    if (reduced) {
      chep.classList.remove("is-lit");
      booming = false;
      eggs.found("boom", "💥 ¡Big bang! Te presento a <b>Chepyto</b>, mascota 3D para Piro Chepy.");
      return;
    }
    const steps = ["3", "2", "1"];
    steps.forEach((s, i) =>
      setTimeout(() => {
        layer.innerHTML = `<div class="boom-count">${s}</div>`;
        audio.tone(660, 0.12, 0.08, "square");
      }, i * 750)
    );
    setTimeout(() => {
      layer.innerHTML = `<div class="boom-flash"></div><div class="boom-word">big bang</div>`;
      audio.boom();
      bursts(26, 40);
      document.body.classList.add("is-shaking");
      chep.classList.remove("is-lit");
      setTimeout(() => document.body.classList.remove("is-shaking"), 800);
      setTimeout(() => { layer.innerHTML = ""; booming = false; setTimeout(peek, 15000); }, 2600);
      eggs.found("boom", "💥 ¡Big bang! Te presento a <b>Chepyto</b>, mascota 3D que hice para Piro Chepy.");
    }, steps.length * 750);
  }

  function celebrate() {
    if (!reduced) bursts(34, 90);
    toast(`🏆 <b>¡Encontraste todos los secretos!</b> Ya eres parte del club creativo. <a href="#contacto" data-fill-msg="¡Mariana! Encontré todos los secretos de tu web 🏆" style="color:#F38FB0">Cuéntaselo a Mariana →</a>`, 9000);
  }

  // ---------------- Pestaña y consola ----------------
  window.Kit.tabTitle("¡Vuelve! Tengo ideas 💡", "¡Hola otra vez! ✨");
  window.Kit.consoleHello(
    ["Hola, curios@ 👀", "Esta web tiene 9 secretos. Algunas pistas:", "· El teléfono conoce un año cafetero: 1940.", "· La credencial tiene dos caras.", "· ↑ ↑ ↓ ↓ ← → ← → B A"],
    "font: 900 22px Archivo, sans-serif; color:#EA1E2B; background:#F4C9D6; padding:6px 12px; border-radius:8px"
  );
})();
