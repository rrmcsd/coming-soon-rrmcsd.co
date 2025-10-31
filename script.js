// === TURBO-SAFE CORE =========================================================
// helpers de ciclo de vida (iguais aos seus, mas usados de verdade agora)
let __teardowns = [];
function addTeardown(fn){ __teardowns.push(fn); }
function cleanup(){
  __teardowns.forEach(fn => { try { fn(); } catch(_){} });
  __teardowns = [];
}

// util: bind com teardown automático
function on(el, type, fn, opts){
  el.addEventListener(type, fn, opts);
  addTeardown(() => el.removeEventListener(type, fn, opts));
}

// === Apps Script Web App (sem mudanças) ======================================
const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbxqX5CpA9NZM9Czuv_sXZRB_lkwCfhdA6NFrh_-f6sQjtmQafRnm592ubuI-5b6u-gi/exec";
const API_KEY = "MINHA_CHAVE_SECRETA_RRMCSD_2025_!@#F3q8x";

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// === MÓDULO: partículas do modal (Home) =====================================
function initParticlesOnCanvas(){
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let rafId = null;
  let particlesArray = [];
  const particleColor = "#18181885";
  const particleRadius = 1.5;

  const mouse = { x: undefined, y: undefined, radius: 100 };

  const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
  const onOut  = () => { mouse.x = mouse.y = undefined; };
  on(window, 'mousemove', onMove);
  on(window, 'mouseout', onOut);

  function calculateParticleCount() {
    const area = window.innerWidth * window.innerHeight;
    const calculatedCount = Math.floor(area / 3500);
    return Math.max(80, Math.min(350, calculatedCount));
  }

  class Particle {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.baseX = x; this.baseY = y;
      this.density = Math.random() * 15 + 5;
      this.size = particleRadius; this.color = particleColor;
      this.driftVx = (Math.random() - 0.5) * 0.15;
      this.driftVy = (Math.random() - 0.5) * 0.15;
      this.vx = this.driftVx; this.vy = this.driftVy;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath(); ctx.fill();
    }
    update() {
      this.baseX += this.driftVx; this.baseY += this.driftVy;
      if (this.baseX <= 0 || this.baseX >= canvas.width) this.driftVx *= -1;
      if (this.baseY <= 0 || this.baseY >= canvas.height) this.driftVy *= -1;

      let rfx=0, rfy=0;
      if (mouse.x !== undefined && mouse.y !== undefined) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const ang = Math.atan2(dy, dx);
          rfx = -Math.cos(ang) * force * this.density * 0.3;
          rfy = -Math.sin(ang) * force * this.density * 0.3;
        }
      }
      const ret = 0.08;
      const rtx = (this.baseX - this.x) * ret;
      const rty = (this.baseY - this.y) * ret;
      this.vx = rtx + rfx + this.driftVx;
      this.vy = rty + rfy + this.driftVy;
      this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x + this.vx));
      this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y + this.vy));
    }
  }

  function init() {
    particlesArray = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = calculateParticleCount();
    for (let i = 0; i < count; i++) {
      particlesArray.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i=0;i<particlesArray.length;i++){ particlesArray[i].update(); particlesArray[i].draw(); }
    rafId = requestAnimationFrame(animate);
  }

  let resizeTO;
  const onResize = () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(init, 250);
  };
  on(window, "resize", onResize);

  init(); animate();

  // teardown deste módulo
  addTeardown(() => {
    if (rafId) cancelAnimationFrame(rafId);
  });
}

// === MÓDULO: Home (modal + newsletter + flicker) ============================
function initHome(){
  if (document.body.id !== 'body-home') return;

  // elementos
  const modalSolutions = document.getElementById("modal-solutions");
  const buttonFechar   = document.getElementById("fechar-modal");
  const eyeImg         = document.getElementById("eye-layer");
  const textModal      = document.getElementById("text-modal");
  const labelNews      = document.getElementById("label-newsletter");
  const inputNews      = document.getElementById("input-newsletter");
  const sendIcon       = document.getElementById("icon-send");
  const sendButton     = document.getElementById("button-newsletter");
  const divNews        = document.getElementById("div-newsletter");
  const modalMsgHome   = document.getElementById("modal-msg-home");
  const fecharMsgHome  = document.getElementById("fechar-msg-home");
  const rrmcsdImg      = document.getElementById("rrmcsd-img") 

  const FADE_OUT_DURATION = 500;
  let showTimeout;
  let flickerTO;

  // Partículas do canvas dentro do modal
  initParticlesOnCanvas();

  // Confetti lazy (garante existir)
  const ensureConfetti = () => {
    return new Promise(res => {
      if (window.confetti) return res();
      const s = document.getElementById('confetes');
      if (s) {
        // espera carregar
        if (s.dataset.ready) return res();
        s.addEventListener('load', () => { s.dataset.ready = '1'; res(); }, { once: true });
      } else res();
    });
  };
  
async function subscribeLead(email, nome = "") {
  const payload = {
    key: API_KEY,
    action: "hubspot_subscribe",
    email: email.trim().toLowerCase(),
    nome: nome.trim()
  };

  try {
    const resp = await fetch(APPSCRIPT_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await resp.json();
    return json;
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

  const form = document.getElementById("newsletter");
  if (form) on(form, "submit", e => e.preventDefault());

  const onSend = async (ev) => {
    ev?.preventDefault?.();
    if (inputNews.value.includes("@") && validateEmail(inputNews.value)) {
      sendButton.disabled = true;
      const resp = await subscribeLead(inputNews.value);

      if (resp.ok) {
        inputNews.classList.add("fade-bottom-out");
        rrmcsdImg.classList.remove("fade-bottom-out")
        rrmcsdImg.classList.add("fade-bottom-in")
        rrmcsdImg.style.display = "block"
        await ensureConfetti();
        if (window.confetti){
          const end = Date.now() + 500;
          const frame = () => {
            window.confetti({ particleCount: 5, angle: 60, spread: 100, origin: {x:0}, colors: ['#dadada','#176b39','#a3fc83'] });
            window.confetti({ particleCount: 5, angle:120, spread: 100, origin: {x:1}, colors: ['#dadada','#176b39','#a3fc83'] });
            if (Date.now() < end) requestAnimationFrame(frame);
          }; frame();
        }
        setTimeout(() => {
          inputNews.style.display = "none";
          labelNews.style.display = "none";
          sendIcon.style.display  = "block";
          sendIcon.style.marginRight = "3px";
          divNews.style.width = "45px"; divNews.style.padding = "0px";
          divNews.classList.add("color-loop");
          sendIcon.classList.add("zoom-in-out");
          modalMsgHome.classList.add("fade-bottom-in");
          modalMsgHome.style.display = "flex";
          setTimeout(() => {
            divNews.classList.add("fade-bottom-out");
            divNews.style.pointerEvents = "none";
            sendButton.style.pointerEvents = "none";
            sendIcon.style.pointerEvents = "none";
          }, 800);
        }, 400);
      } else {
        inputNews.value = "";
        inputNews.style.border = "solid 2px #ed3e3eff";
      }
      sendButton.disabled = false;
      sendIcon.style.opacity = "1";
    } else {
      inputNews.value = "";
      inputNews.style.border = "solid 2px #ed3e3eff";
    }
  };
  on(sendButton, "click", onSend);

  const onCloseMsg = () => {
    modalMsgHome.classList.remove("fade-bottom-in");
    modalMsgHome.classList.add("fade-bottom-out");
    setTimeout(() => { modalMsgHome.style.display = "none"; }, 1000);
  };
  on(fecharMsgHome, "click", onCloseMsg);

  function showModal() {
    if (!modalSolutions || !eyeImg) return;
    modalSolutions.classList.remove("fade-out-modal");
    modalSolutions.classList.add("fade-in-modal");
    modalSolutions.style.display = "flex";
    if (window.$crisp) { $crisp.push(["do", "chat:hide"]); }
  }
  function hideModal() {
    if (!modalSolutions || !eyeImg) return;
    modalSolutions.classList.remove("fade-in-modal");
    modalSolutions.classList.add("fade-out-modal");
    setTimeout(() => {
      if (modalSolutions.classList.contains("fade-out-modal")) {
        modalSolutions.style.display = "none";
        if (window.$crisp) { $crisp.push(["do", "chat:show"]); }
      }
    }, FADE_OUT_DURATION);
  }

  const mqMobile = window.matchMedia("(max-width: 768px)");
  const onEnter = () => { clearTimeout(showTimeout); showTimeout = setTimeout(showModal, 200); };
  const onClickOpen = () => { clearTimeout(showTimeout); showTimeout = setTimeout(showModal, 200); };
  const onClickClose = () => hideModal();

  function bindDesktop() {
    if (eyeImg) on(eyeImg, "click", onEnter);
  }
  function bindMobile() {
    if (eyeImg) on(eyeImg, "click", onClickOpen);
    if (buttonFechar) on(buttonFechar, "click", onClickClose);
  }

  function applyBindings(){
    if (mqMobile.matches){ bindMobile(); }
    else { bindDesktop(); if (buttonFechar) on(buttonFechar, "click", onClickClose); }
  }
  applyBindings();
  on(mqMobile, "change", applyBindings);

  // animação do título "em breve..."
  function textAnimation() {
    const dots = document.getElementById("dots");
    if(!dots) return;
    let idx = 0; const states = ["", ".", "..", "..."];
    const tick = () => {
      dots.style.opacity = 0;
      const t1 = setTimeout(() => {
        dots.textContent = states[idx]; dots.style.opacity = 1;
        idx = (idx+1) % states.length;
        flickerTO = setTimeout(tick, 800);
      }, 400);
      addTeardown(()=> clearTimeout(t1));
    };
    tick();
  }
  textAnimation();

  // texto flicker
  if (textModal) {
    textModal.innerHTML = textModal.textContent
      .split("")
      .map(c => c === "\n" ? "<br>" : (c === " " ? `<span class="space">&nbsp;</span>` : `<span class="char">${c}</span>`))
      .join("");
    const spans = textModal.querySelectorAll("span.char");
    const flick = () => {
      spans.forEach(s => s.style.opacity = 1);
      const indices = new Set();
      while (indices.size < 3) indices.add(Math.floor(Math.random() * spans.length));
      indices.forEach(i => spans[i].style.opacity = 0.25 + Math.random()*0.25);
      flickerTO = setTimeout(flick, 600 + Math.random()*1200);
    };
    flick();
  }

  // hooks mobile/desktop newsletter
  (function mobileDesktopHooks(){
    const runMobileOnly = () => {
      if (!divNews) return;
      const onOpen = () => {
        rrmcsdImg.classList.remove("fade-bottom-in")
        labelNews.classList.remove("fade-bottom-in");
        inputNews.classList.remove("fade-bottom-out");
        rrmcsdImg.classList.add("fade-bottom-out")
        labelNews.classList.add("fade-bottom-out");
        inputNews.classList.add("fade-bottom-in");
        const t = setTimeout(() => {
          sendButton.style.pointerEvents = "all";
          sendButton.style.display = "block";
          inputNews.style.display = "block";
          labelNews.style.display = "none";
          rrmcsdImg.style.display = "none"
        }, 450);
        addTeardown(() => clearTimeout(t));
      };
      const onLeave = () => {
        if (modalMsgHome.style.display !== "flex"){
          inputNews.value = "";
          rrmcsdImg.classList.remove("fade-bottom-out")
          labelNews.classList.remove("fade-bottom-out");
          inputNews.classList.remove("fade-bottom-in");

          rrmcsdImg.classList.add("fade-bottom-in")
          labelNews.classList.add("fade-bottom-in");
          inputNews.classList.add("fade-bottom-out");
          const t = setTimeout(() => {
            inputNews.style.display = "none";
            labelNews.style.display = "block";
            setTimeout(() => {
            rrmcsdImg.style.display = "block"
            }, 300);
            sendButton.style.pointerEvents = "none";
          }, 450);
          addTeardown(() => clearTimeout(t));
        }
      };
      on(divNews, "click", onOpen);
      on(divNews, "mouseleave", onLeave);
    };

    const runDesktopOnly = () => {
      if (!inputNews) return;
      const onFocus = () => {
        labelNews.classList.remove("fade-bottom-in");
        labelNews.classList.add("fade-bottom-out");
        sendButton.classList.add("fade-bottom-in");
        const t = setTimeout(() => {
          sendButton.style.display = "block";
          inputNews.style.width = "400px";
          labelNews.style.display = "none";
        }, 450);
        addTeardown(()=> clearTimeout(t));
      };
      const onBlur = (e) => {
        const to = e.relatedTarget;
        if (to && (to === sendButton || sendButton.contains(to))) return;
        inputNews.value = "";
        inputNews.style.border = "solid 2px #181818";
        sendButton.classList.remove("fade-bottom-in");
        sendButton.classList.add("fade-bottom-out");
        labelNews.classList.remove("fade-bottom-out");
        labelNews.classList.add("fade-bottom-in");
        const t = setTimeout(() => {
          sendButton.style.display = "none";
          inputNews.style.width = "300px";
          labelNews.style.display = "inline-block";
        }, 450);
        addTeardown(()=> clearTimeout(t));
      };
      on(inputNews, "focus", onFocus);
      on(inputNews, "focusout", onBlur);
    };

    const apply = () => (window.matchMedia("(max-width: 768px)").matches ? runMobileOnly() : runDesktopOnly());
    apply();
    on(window.matchMedia("(max-width: 768px)"), "change", apply);
  })();

  // teardown específico da Home para estados transitórios
  addTeardown(() => {
    clearTimeout(showTimeout);
    clearTimeout(flickerTO);
    // reseta mini UI do newsletter se necessário, evitando “snapshot sujo”
    if (labelNews && inputNews && sendButton && sendIcon && divNews) {
      labelNews.style.display = "inline-block";
      inputNews.style.display = "none";
      inputNews.value = "";
      inputNews.style.width = "300px";
      sendButton.style.display = "none";
      divNews.classList.remove("color-loop","fade-bottom-out");
      sendIcon.classList.remove("zoom-in-out");
    }
  });
}

// === MÓDULO: Cancel (mantém sua lógica; apenas turbo-safe) ===================
function initCancel(){
  if (document.body.id !== 'body-cancel') return;

  const cancelButton  = document.getElementById("unsubscribe");
  const inputCancel   = document.getElementById("input-cancelamento");
  const modalMsgCancel= document.getElementById("modal-msg-cancel");
  const fecharMsgCancel = document.getElementById("fechar-msg-cancel");
  const eyes = document.querySelectorAll(".eyes-cancel");

  async function unsubscribeLead(email) {
  const payload = {
    key: API_KEY,
    action: "hubspot_unsubscribe",
    email: String(email || "").trim().toLowerCase(),
    userAgent: navigator.userAgent
  };
  try {
    await fetch(APPSCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // troque para "cors" se configurar CORS no Apps Script
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

  const onClickUnsub = async () => {
    if (inputCancel.value.includes("@") && validateEmail(inputCancel.value)) {
      await unsubscribeLead(inputCancel.value);
      const t = setTimeout(() => {
        modalMsgCancel.classList.add("fade-bottom-in");
        modalMsgCancel.style.display = "flex";
        inputCancel.value = "";
      }, 400);
      addTeardown(() => clearTimeout(t));
    } else {
      inputCancel.value = "";
      inputCancel.style.border = "solid 2px #ed3e3eff";
    }
  };
  on(cancelButton, "click", onClickUnsub);

  on(fecharMsgCancel, "click", () => {
    modalMsgCancel.classList.remove("fade-bottom-in");
    modalMsgCancel.classList.add("fade-bottom-out");
    const t = setTimeout(() => { modalMsgCancel.style.display = "none"; }, 1000);
    addTeardown(()=> clearTimeout(t));
  });

  on(inputCancel, "click", () => {
    inputCancel.value = "";
    inputCancel.style.border = "solid 2px #176b39";
  });

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  const onResize = () => { windowWidth = window.innerWidth; windowHeight = window.innerHeight; };
  on(window, "resize", onResize);

  const getOffset = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + window.scrollX, y: r.top + window.scrollY };
  };

  const moveEye = (eye, cursor) => {
    const off = getOffset(eye);
    const b = eye.getBBox();
    const cx = off.x + b.width/2;
    const cy = off.y + b.height/2;
    const pTop  = Math.round((cursor.y - cy) * 100 / windowHeight);
    const pLeft = Math.round((cursor.x - cx) * 100 / windowWidth);
    eye.style.transform = `translate(${pLeft/5}px, ${pTop/5}px)`;
  };

  const onPointer = (x,y) => eyes.forEach(el => moveEye(el, {x,y}));

  const mm = (e) => onPointer(e.clientX, e.clientY);
  const tm = (e) => onPointer(e.targetTouches[0].offsetX, e.targetTouches[0].offsetY);

  on(window, "mousemove", mm);
  on(window, "touchmove", tm);
}

// === BOOTSTRAP TURBO =========================================================
// roda em cada visita
function boot(){
  cleanup();                  // desmonta restos da rota anterior
  initHome();                 // inicializa se for a home
  initCancel();               // inicializa se for /cancel
}

// Turbo dispara em cada visita
document.addEventListener('turbo:load', boot);

// antes do Turbo tirar um snapshot da página atual
document.addEventListener('turbo:before-cache', () => {
  // limpe temporários, pare animações, etc.
  cleanup();
});
