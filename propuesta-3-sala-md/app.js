/* Propuesta 3 · "Sala MD" */
(function () {
  const M = window.MARIANA;
  const { $, $$, reduced, toast, audio, esc } = window.Kit;
  const IMG = "../assets/img/";
  const pad = (n) => String(n).padStart(2, "0");

  // Cartelas de museo: técnica (con humor), marco y el grafiti que aparece a oscuras.
  const SALA = {
    "flor-de-patria": { tecnica: "Illustrator y Photoshop sobre aroma de café recién colado", marco: "wood", grafiti: "más aroma, más café ☕", gc: "#C6FF4D" },
    alphacolor: { tecnica: "Illustrator y Photoshop sobre esmalte brillante", marco: "black", grafiti: "versión_final_FINAL_ahorasí.ai", gc: "#5CE1FF" },
    marivalen: { tecnica: "Illustrator y Photoshop sobre papel rosa y mariposas", marco: "gold", grafiti: "¿y si lo hacemos rosa? 🦋", gc: "#FF5FD2" },
    "maxy-sweet": { tecnica: "Illustrator y Photoshop sobre malvaviscos y gomitas", marco: "white", grafiti: "I am just a girl with ideas", gc: "#C6FF4D" },
    artesano: { tecnica: "Photoshop sobre fibras tejidas a mano", marco: "wood", grafiti: "Mariana estuvo aquí ✦", gc: "#FF5FD2" },
    chepyto: { tecnica: "Escultura digital en Blender. Mecha incluida.", escultura: true, grafiti: "big bang 💥", gc: "#FFD84D" },
    cabana: { tecnica: "Modelado 3D en Blender: madera, luz y paciencia", marco: "black", grafiti: "Ctrl+S  Ctrl+S  Ctrl+S", gc: "#5CE1FF" },
    intershibuya: { tecnica: "InDesign sobre cartón, plástico y mucho verde", marco: "white", torcido: true, grafiti: "THIS IS NOT AI", gc: "#C6FF4D" },
  };

  const eggs = window.Kit.secrets(
    [
      { id: "luces", nombre: "Linterna", pista: "En la sala hay un interruptor. ¿Qué se ve a oscuras?" },
      { id: "alarma", nombre: "Alarma", pista: "Hay una obra que dice NO TOCAR. Insiste." },
      { id: "guardia", nombre: "El guardia", pista: "Alguien duerme al final de la sala." },
      { id: "marco", nombre: "Perfeccionista", pista: "Uno de los cuadros está torcido." },
      { id: "foto", nombre: "Prohibido llevarse obras", pista: "Intenta llevarte una obra (clic derecho) o hazle una captura." },
      { id: "obra", nombre: "La obra que falta", pista: "Hay un marco vacío esperando algo." },
      { id: "noche", nombre: "Noche en el museo", pista: "↑ ↑ ↓ ↓ ← → ← → B A  (o toca el logo 5 veces)." },
    ],
    { key: "md-p3-secretos", label: "secretos de sala", onAll: celebrate }
  );

  // Libro de visitas = formulario de contacto (Web3Forms). La tienda y las audioguías llevan aquí.
  const contact = window.Kit.contactForm($("#contact-form"), { subject: "Nueva firma en el libro de visitas" });

  // ---------------- Entrada ----------------
  $("#t-num").textContent = String(Math.floor(Math.random() * 900000) + 100000);
  $("#stub").addEventListener("click", () => {
    const t = $("#ticket");
    if (t.classList.contains("is-torn")) return;
    t.classList.add("is-torn");
    for (let i = 0; i < 6; i++) setTimeout(() => audio.click(0.12), i * 35);
    setTimeout(() => $("#sala").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }), reduced ? 0 : 750);
  });

  // ---------------- Sala ----------------
  const track = $("#track");
  function imgTag(file, alt, extra = "") {
    const [w, h] = (M.dims && M.dims[file]) || [800, 800];
    return `<img src="${IMG + file}" alt="${alt}" width="${w}" height="${h}" ${extra}>`;
  }
  function heightFor(file) {
    const [w, h] = (M.dims && M.dims[file]) || [1, 1];
    return w / h > 1.25 ? "min(32vh, 300px)" : "min(46vh, 430px)";
  }
  function cartela(p, i, s) {
    return `<figcaption class="cartela">
      <span class="c-artist">Mariana Díaz (Venezuela)</span>
      <b>${p.titulo}</b>
      <span>${p.categorias.join(", ")}${p.anio ? " · " + p.anio : ""}</span>
      <span>${s.tecnica}</span>
      <span class="c-col">${p.cliente}</span>
      <button type="button" class="c-listen" data-listen="${i}">▶ Audioguía · obra ${pad(i + 1)}</button>
    </figcaption>`;
  }
  const ghost = (s, top, left, rot) => `<span class="ghost" style="top:${top};left:${left};--r:${rot};color:${s.gc};text-shadow:0 0 12px ${s.gc}">${s.grafiti}</span>`;

  const works = M.proyectos.map((p, i) => {
    const s = SALA[p.id];
    const g = ghost(s, i % 2 ? "-16%" : "104%", i % 3 ? "6%" : "30%", i % 2 ? "-5deg" : "4deg");
    if (s.escultura) {
      return `<figure class="work sculpture" data-i="${i}">
        <span class="lamp" aria-hidden="true"></span>
        <div class="plinth-wrap">
          <button type="button" class="vitrina" id="vitrina" aria-label="${p.titulo}, escultura digital en vitrina. No tocar.">${imgTag(p.portada, "Chepyto, mascota 3D: una bomba sonriente con camiseta amarilla")}</button>
          <div class="plinth"></div>
          <span class="no-tocar">NO TOCAR</span>
          <span class="rope" aria-hidden="true"><span></span></span>
        </div>
        ${cartela(p, i, s)}${g}
      </figure>`;
    }
    return `<figure class="work" data-i="${i}">
      <span class="lamp" aria-hidden="true"></span>
      <button type="button" class="frame frame-${s.marco}${s.torcido ? " is-crooked" : ""}" data-open="${i}" aria-label="Abrir la audioguía de ${p.titulo}" style="--h:${heightFor(p.portada)}">
        <span class="frame-inner">${imgTag(p.portada, `${p.titulo}: ${p.cliente}`, 'loading="lazy"')}</span>
      </button>
      ${cartela(p, i, s)}${g}
    </figure>`;
  });
  works.push(`<figure class="work" id="obra-falta">
      <span class="lamp" aria-hidden="true"></span>
      <button type="button" class="frame frame-black" id="empty-frame" aria-label="Marco vacío: tu marca aquí" style="--h:min(40vh,380px)">
        <span class="frame-inner"><span class="empty-art">?</span></span>
      </button>
      <figcaption class="cartela"><span class="c-artist">Mariana Díaz (Venezuela)</span><b>Tu marca aquí</b><span>2026 · Técnica por definir</span><span class="c-col">Colección: la tuya, si quieres</span></figcaption>
      <span class="ghost" style="top:-18%;left:10%;--r:-4deg;color:#FF5FD2;text-shadow:0 0 12px #FF5FD2">tu idea + mis ideas = 💥</span>
    </figure>`);
  works.push(`<button type="button" class="guard" id="guard" aria-label="Guardia de sala, dormido">
      <span class="bubble">¡No estaba dormido! Estaba… evaluando el kerning de las cartelas.</span>
      <span class="zzz" aria-hidden="true">z z Z</span>
      <svg viewBox="0 0 200 250" aria-hidden="true">
        <rect x="128" y="68" width="12" height="94" rx="3" fill="#7a4e2d"/>
        <rect x="40" y="150" width="108" height="12" rx="3" fill="#8b5a33"/>
        <rect x="48" y="160" width="8" height="84" fill="#5d391f"/><rect x="134" y="160" width="8" height="84" fill="#5d391f"/>
        <path d="M70 152 q-6 -58 30 -64 q36 4 34 64 z" fill="#2B3A67"/>
        <rect x="56" y="146" width="76" height="20" rx="9" fill="#1f2a4d"/>
        <path d="M58 160 l-8 72 h18 l8 -64z" fill="#1f2a4d"/><path d="M92 160 l2 72 h18 l-2 -72z" fill="#1f2a4d"/>
        <ellipse cx="58" cy="236" rx="17" ry="7" fill="#111"/><ellipse cx="104" cy="236" rx="17" ry="7" fill="#111"/>
        <path d="M74 112 q26 16 52 0 l2 13 q-28 15 -56 0z" fill="#24325a"/>
        <rect x="112" y="98" width="11" height="8" rx="1.5" fill="#F2C230"/>
        <circle cx="100" cy="66" r="24" fill="#C68A62"/>
        <path d="M74 58 q26 -30 52 0 z" fill="#1f2a4d"/><rect x="72" y="53" width="56" height="9" rx="3" fill="#1f2a4d"/><path d="M128 58 h14 q-3 7 -14 7z" fill="#111"/>
        <circle cx="100" cy="45" r="4" fill="#F2C230"/>
        <g class="eyes-closed"><path d="M87 71 q5 4 10 0 M103 71 q5 4 10 0" stroke="#3a2214" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>
        <g class="eyes-open"><circle cx="92" cy="70" r="3.6" fill="#3a2214"/><circle cx="108" cy="70" r="3.6" fill="#3a2214"/></g>
        <path d="M95 81 q5 3 10 0" stroke="#3a2214" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
      <span class="ghost" style="top:-30%;left:-10%;--r:-8deg;color:#5CE1FF;text-shadow:0 0 12px #5CE1FF">shhh… está dormido</span>
    </button>`);
  track.insertAdjacentHTML("beforeend", works.join(""));

  // Pasillo horizontal: el scroll vertical desplaza la pared.
  const sala = $("#sala");
  let horiz = false, maxX = 0;
  function measure() {
    horiz = window.innerWidth > 860;
    if (!horiz) { sala.style.height = ""; track.style.removeProperty("--tx"); return; }
    maxX = Math.max(0, track.scrollWidth - window.innerWidth);
    sala.style.height = window.innerHeight + maxX + "px";
    $$(".work", track).forEach((w) => w.querySelector(".lamp") && w.style.setProperty("--lamp-y", Math.max(40, w.offsetTop - 80) + "px"));
    onScroll();
  }
  function onScroll() {
    if (!horiz) return;
    const p = Math.min(1, Math.max(0, -sala.getBoundingClientRect().top / (maxX || 1)));
    track.style.setProperty("--tx", (-p * maxX).toFixed(1) + "px");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(measure, 120); });
  window.addEventListener("load", measure);
  document.fonts && document.fonts.ready.then(measure);
  measure();

  // Clics dentro de la sala
  track.addEventListener("click", (e) => {
    const fr = e.target.closest("[data-open]");
    if (fr) {
      if (fr.classList.contains("is-crooked")) {
        fr.classList.remove("is-crooked");
        audio.tone(880, 0.2, 0.05);
        eggs.found("marco", "📐 Ahora sí, derechito. Perfeccionista, como Mariana.");
        return;
      }
      return openGuide(Number(fr.dataset.open));
    }
    const li = e.target.closest("[data-listen]");
    if (li) return openGuide(Number(li.dataset.listen), true);
  });

  // Chepyto: NO TOCAR
  let touches = 0;
  const vit = $("#vitrina");
  vit.addEventListener("click", () => {
    touches++;
    vit.classList.remove("is-shaking");
    void vit.offsetWidth;
    vit.classList.add("is-shaking");
    if (touches === 1) toast("🚫 Por favor, <b>no tocar</b> la obra.");
    else if (touches === 2) toast("😤 Le dije que no toque a Chepyto…");
    else { touches = 0; alarm(); }
  });
  function alarm() {
    const a = $("#alarm");
    a.classList.remove("is-on");
    void a.offsetWidth;
    a.classList.add("is-on");
    for (let i = 0; i < 8; i++) setTimeout(() => audio.tone(i % 2 ? 640 : 880, 0.4, 0.05, "square"), i * 450);
    wakeGuard("¡Alto ahí! 🚨 …Bueno, si tanto te gusta, encárgale una mascota a Mariana.");
    setTimeout(() => toast(`🚨 <b>¡Seguridad!</b> Si tanto te gustó Chepyto, <a href="#salida" data-fill-serv="${esc(M.servicioDe("3D"))}" data-fill-msg="Toqué a Chepyto y sonó la alarma 🚨. Quiero una mascota 3D para mi marca.">encárgale una mascota a Mariana →</a>`, 9000), 1200);
    eggs.found("alarma");
  }

  // Guardia
  const guard = $("#guard");
  function wakeGuard(text) {
    if (text) $(".bubble", guard).textContent = text;
    guard.classList.add("is-awake");
    guard.setAttribute("aria-label", "Guardia de sala, despierto");
    clearTimeout(guard._t);
    guard._t = setTimeout(() => {
      guard.classList.remove("is-awake");
      guard.setAttribute("aria-label", "Guardia de sala, dormido");
    }, 5000);
  }
  guard.addEventListener("click", () => {
    wakeGuard("¡No estaba dormido! Estaba… evaluando el kerning de las cartelas.");
    eggs.found("guardia", "💤 El guardia jura que no estaba dormido.");
  });

  // Marco vacío
  $("#empty-frame").addEventListener("click", () => {
    eggs.found("obra", "🖼️ Esta pared está esperando tu marca. Pasa por la tienda del museo.");
    setTimeout(() => $("#tienda").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }), 900);
  });

  // ---------------- Luz de sala y linterna ----------------
  const sw = $("#switch"), dark = $("#darkness"), onBtn = $("#lights-on");
  function lights(off) {
    document.body.classList.toggle("lights-off", off);
    sw.setAttribute("aria-pressed", String(off));
    onBtn.hidden = !off;
    audio.click(0.3);
    if (off) eggs.found("luces", "🔦 Luz apagada. Pasea la linterna por las paredes… alguien dejó grafitis.");
  }
  sw.addEventListener("click", () => lights(!document.body.classList.contains("lights-off")));
  onBtn.addEventListener("click", () => lights(false));
  const moveLight = (e) => { dark.style.setProperty("--mx", e.clientX + "px"); dark.style.setProperty("--my", e.clientY + "px"); };
  window.addEventListener("pointermove", moveLight, { passive: true });
  window.addEventListener("pointerdown", moveLight, { passive: true });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("lights-off")) lights(false); });

  // ---------------- Prohibido llevarse obras ----------------
  document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".frame, .vitrina, .portrait-work")) eggs.found("foto", "🚫 Las obras no se pueden llevar… pero sí puedes encargar una. 😉");
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen") eggs.found("foto", "📸 ¡Nada de fotos con flash! …Bueno, ya que la tomaste, compártela.");
  });

  // ---------------- Audioguía ----------------
  const guide = $("#guide"), gIn = $("#guide-inner");
  let gi = 0, gk = 0;
  function openGuide(i, autoplay) {
    gi = i; gk = 0;
    renderGuide();
    if (!guide.open) guide.showModal();
    if (autoplay) speak();
  }
  function renderGuide() {
    stopSpeech();
    const p = M.proyectos[gi], s = SALA[p.id], imgs = [p.portada, ...p.imagenes];
    gIn.innerHTML = `
      <div class="g-media">
        ${imgTag(imgs[gk], `${p.titulo}, imagen ${gk + 1}`, 'id="g-img"')}
        ${imgs.length > 1 ? `<div class="g-thumbs">${imgs.map((im, k) => `<button type="button" data-gk="${k}" class="${k === gk ? "is-active" : ""}" aria-label="Imagen ${k + 1}"><img src="${IMG + im}" alt=""></button>`).join("")}</div>` : ""}
      </div>
      <div class="g-body">
        <div class="g-top"><p class="eyebrow">Audioguía · obra ${pad(gi + 1)} de ${pad(M.proyectos.length)}</p>
          <div class="g-ctrl"><button type="button" data-g="-1" aria-label="Obra anterior">←</button><button type="button" data-g="1" aria-label="Obra siguiente">→</button><button type="button" data-g="x" aria-label="Cerrar">✕</button></div>
        </div>
        <h3 id="g-title">${p.titulo}</h3>
        <p class="g-meta">${p.cliente} · ${p.categorias.join(", ")}${p.anio ? " · " + p.anio : ""}<br>${s.tecnica}</p>
        <p class="g-quote">“${p.lema}”</p>
        <p class="g-desc">${p.descripcion}</p>
        <button type="button" class="play" id="play"><i>▶</i><span>Escuchar audioguía</span><span class="bars" aria-hidden="true"><b></b><b></b><b></b></span></button>
        <div class="g-cta"><button type="button" class="btn btn-red" data-fill-serv="${esc(M.servicioDe(p.categorias[0]))}" data-fill-msg="${esc(`Hola Mariana, vi "${p.titulo}" en tu sala y quiero algo así para mi marca.`)}">Quiero una obra así →</button></div>
      </div>`;
  }
  function stopSpeech() { if ("speechSynthesis" in window) speechSynthesis.cancel(); }
  function speak() {
    const btn = $("#play");
    if (!("speechSynthesis" in window)) return toast("Este navegador no tiene voz, pero la cartela te lo cuenta todo 😉");
    if (btn.classList.contains("is-playing")) { stopSpeech(); btn.classList.remove("is-playing"); return; }
    const p = M.proyectos[gi];
    const u = new SpeechSynthesisUtterance(`Obra ${gi + 1}. ${p.titulo}. ${p.cliente}. ${p.descripcion} Su lema: ${p.lema}.`);
    const voices = speechSynthesis.getVoices();
    u.voice = voices.find((v) => /^es[-_](VE|419|US|MX|CO)/i.test(v.lang)) || voices.find((v) => /^es/i.test(v.lang)) || null;
    u.lang = u.voice ? u.voice.lang : "es-ES";
    u.onend = u.onerror = () => btn.classList.remove("is-playing");
    stopSpeech();
    btn.classList.add("is-playing");
    speechSynthesis.speak(u);
  }
  guide.addEventListener("click", (e) => {
    if (e.target === guide) return guide.close();
    const g = e.target.closest("[data-g]");
    if (g) {
      if (g.dataset.g === "x") return guide.close();
      gi = (gi + Number(g.dataset.g) + M.proyectos.length) % M.proyectos.length;
      gk = 0;
      return renderGuide();
    }
    const t = e.target.closest("[data-gk]");
    if (t) { gk = Number(t.dataset.gk); return renderGuide(); }
    if (e.target.closest("#play")) speak();
  });
  guide.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      gi = (gi + (e.key === "ArrowRight" ? 1 : -1) + M.proyectos.length) % M.proyectos.length;
      gk = 0;
      renderGuide();
    }
  });
  guide.addEventListener("close", stopSpeech);

  // ---------------- La artista ----------------
  $("#sala-text").textContent =
    `Mariana Díaz (Venezuela) es diseñadora gráfica, formada en ${M.estudios.carrera} en la ${M.estudios.universidad} (${M.estudios.anio}). ` +
    `Su trabajo recorre el branding, el empaque, las redes sociales, el modelado 3D y el diseño editorial. ` +
    `Enfocada en la conceptualización de ideas, disfruta crear y aprender; cada pieza de esta sala lleva, en sus propias palabras, “un pedacito de mí”.`;
  const crono = M.experiencia.map((e) => ({ y: parseInt(e.anios, 10), t: `<b>${e.anios}</b><span>${e.empresa} · ${e.rol}</span>` }));
  crono.push({ y: M.estudios.anio - 0.5, t: `<b>${M.estudios.anio}</b><span>Egresa de ${M.estudios.carrera} · ${M.estudios.universidad}</span>` });
  crono.push({ y: 2026.5, t: `<b>2026</b><span>Freelance · agenda abierta</span>` });
  $("#crono").innerHTML = crono.sort((a, b) => a.y - b.y).map((c) => `<li>${c.t}</li>`).join("");
  $("#tecnicas").textContent = M.software.join(", ") + ".";

  // ---------------- Tienda ----------------
  const ART = {
    logo: `<svg viewBox="0 0 60 60"><text x="30" y="40" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-size="34" fill="#1C1B19">Aa</text><circle cx="30" cy="30" r="26" fill="none" stroke="#1C1B19" stroke-width="2"/></svg>`,
    empaque: `<svg viewBox="0 0 60 60" fill="none" stroke="#1C1B19" stroke-width="2.4" stroke-linejoin="round"><path d="M12 20h36l-3 34H15z"/><path d="M22 20v-4a8 8 0 0 1 16 0v4"/><path d="M22 32h16"/></svg>`,
    redes: `<svg viewBox="0 0 60 60" fill="none" stroke="#1C1B19" stroke-width="2.4" stroke-linejoin="round"><rect x="17" y="6" width="26" height="48" rx="5"/><path d="M30 38c-6-4-8-7-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3-2 6-8 10z" fill="#C1272D" stroke="none"/></svg>`,
    "3d": `<svg viewBox="0 0 60 60" fill="none" stroke="#1C1B19" stroke-width="2.4" stroke-linejoin="round"><path d="M30 6l22 12v24L30 54 8 42V18z"/><path d="M8 18l22 12 22-12M30 30v24"/></svg>`,
    editorial: `<svg viewBox="0 0 60 60" fill="none" stroke="#1C1B19" stroke-width="2.4" stroke-linejoin="round"><path d="M30 14c-6-4-14-5-22-4v36c8-1 16 0 22 4 6-4 14-5 22-4V10c-8-1-16 0-22 4z"/><path d="M30 14v36"/></svg>`,
  };
  const COLORS = ["#F6D7DE", "#D9D7F1", "#F5DD95", "#C9EAD9", "#F3CDB2"];
  const shelf = $("#shelf");
  shelf.innerHTML = M.servicios
    .map((s, i) => `<article class="product" style="--c:${COLORS[i % COLORS.length]}">
        <span class="price-tag">A consultar</span>
        <div class="product-art" aria-hidden="true">${ART[s.id] || ART.logo}</div>
        <h3>${s.nombre}</h3><p>${s.detalle}</p>
        <button type="button" class="add" data-add="${i}" aria-pressed="false">Añadir a la bolsa</button>
      </article>`)
    .join("");
  const chosen = new Set();
  function updateBag() {
    const names = [...chosen].sort().map((i) => M.servicios[i].nombre);
    $("#bag-text").textContent = names.length ? `Tu bolsa (${names.length}): ${names.join(", ")}` : "Tu bolsa está vacía";
    $("#pay").disabled = !names.length;
  }
  // Pagar en caja: el pedido queda escrito en el libro de visitas.
  $("#pay").addEventListener("click", () => {
    const names = [...chosen].sort().map((i) => M.servicios[i].nombre);
    contact.fill({
      servicio: names.length === 1 ? names[0] : "",
      mensaje: `Hola Mariana, vengo de la tienda de tu museo y me llevo:\n${names.map((n) => "• " + n).join("\n")}\n¿Me pasas presupuesto?`,
    });
  });
  shelf.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (!b) return;
    const i = Number(b.dataset.add);
    if (chosen.has(i)) chosen.delete(i); else chosen.add(i);
    const on = chosen.has(i);
    b.setAttribute("aria-pressed", String(on));
    b.textContent = on ? "✓ En la bolsa" : "Añadir a la bolsa";
    if (on) audio.tone(1320, 0.18, 0.05);
    updateBag();
  });
  updateBag();

  // ---------------- Salida ----------------
  // Enlace a Behance: solo si hay un perfil puesto en data.js.
  if (M.contacto.behance) $("#x-be").href = M.contacto.behance;
  else { $("#x-be").remove(); $(".salida-grid").classList.add("is-solo"); }

  // ---------------- Noche en el museo ----------------
  function noche() {
    const on = document.body.classList.toggle("mode-noche");
    if (on) eggs.found("noche", "🌙 Noche en el museo: las obras cobran vida. Repite para que vuelvan a dormir.");
    else toast("☀️ Amaneció. Las obras vuelven a su sitio.");
  }
  window.Kit.konami(noche);
  window.Kit.taps($("#logo"), 5, noche);

  function celebrate() {
    toast(`🏆 <b>¡Encontraste los 7 secretos de la sala!</b> Te nombramos visitante de honor. <a href="#salida" data-fill-msg="¡Mariana! Encontré los 7 secretos de tu sala 🏆">Cuéntaselo →</a>`, 9000);
  }

  window.Kit.tabTitle("🖼️ ¡Vuelve! La sala sigue abierta", "¡Qué bueno verte de nuevo! ✨");
  window.Kit.consoleHello(
    ["Sala MD · Backstage 🖼️", "Bienvenida/o detrás de las paredes. Hay 7 secretos en la sala.", "· Apaga la luz.", "· No toques a Chepyto (en serio).", "· ↑ ↑ ↓ ↓ ← → ← → B A"],
    "font: 400 24px 'Instrument Serif', Georgia, serif; color:#fff; background:#C1272D; padding:6px 14px"
  );
})();
