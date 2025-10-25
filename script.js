const modalSolutions = document.getElementById("modal-solutions")
const buttonFechar = document.getElementById("fechar-modal")
const eye = document.getElementById("eye")
const textModal = document.getElementById("text-modal");
let showTimeout;
const SHOW_DELAY = 200;   // ms
const FADE_OUT_DURATION = 500; // deve bater com o CSS da animação
const labelNews = document.getElementById("label-newsletter")
const inputNews = document.getElementById("input-newsletter")
const sendIcon = document.getElementById("icon-send")
const sendButton = document.getElementById("button-newsletter")
const divNews = document.getElementById("div-newsletter")
let focusTO = null, blurTO = null;
const modalMsg = document.getElementById("modal-msg")
const fecharMsg = document.getElementById("fechar-msg")

// === Apps Script Web App ===
const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbxoZ_hbG0TaltuSjv9CpxvVvykrpBsCyZ-44f03bTEs9O2DVUaA75SWBMUNMhgzff3n/exec";
const API_KEY = "MINHA_CHAVE_SECRETA_RRMCSD_2025_!@#F3q8x";

// Envia sem ler resposta (evita erro de CORS no console)
async function subscribeLead(email, nome = "") {
  const payload = {
    key: API_KEY,
    email: String(email || "").trim().toLowerCase(),
    nome: String(nome || "").trim(),
    source: "rrmcsd-coming-soon",
    userAgent: navigator.userAgent
  };

  try {
    // não defina Content-Type; use no-cors; keepalive ajuda ao fechar a aba rápido
    await fetch(APPSCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      body: JSON.stringify(payload)
    });
    return { ok: true, opaque: true }; // não há leitura do JSON de volta
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// Se estiver usando <form>, garanta que o botão NÃO submeta:
const form = document.getElementById("newsletter");
if (form) form.addEventListener("submit", e => e.preventDefault());

sendButton.addEventListener("click", async (ev) => {
  ev?.preventDefault?.();

  if (inputNews.value.includes("@") && validateEmail(inputNews.value)) {
    sendButton.disabled = true;
    sendIcon.style.opacity = "0.6";

    const resp = await subscribeLead(inputNews.value);

    if (resp.ok) {
      // === sua UX atual de sucesso ===
      inputNews.classList.add("fade-bottom-out");
      startConfetti();

      setTimeout(() => {
        inputNews.style.display = "none";
        labelNews.style.display = "none";
        sendIcon.style.marginRight = "3px";
        divNews.style.width = "45px";
        divNews.style.padding = "0px";
        divNews.classList.add("color-loop");
        sendIcon.classList.add("zoom-in-out");
        modalMsg.classList.add("fade-bottom-in");
        modalMsg.style.display = "flex";
        setTimeout(() => { divNews.classList.add("fade-bottom-out"); }, 800);
      }, 400);
    } else {
      // erro de rede
      inputNews.value = "";
      inputNews.style.border = "solid 2px #ed3e3eff";
    }

    sendButton.disabled = false;
    sendIcon.style.opacity = "1";
  } else {
    inputNews.value = "";
    inputNews.style.border = "solid 2px #ed3e3eff";
  }
});

fecharMsg.addEventListener("click", () => {
  modalMsg.classList.remove("fade-bottom-in")
  modalMsg.classList.add("fade-bottom-out")
  setTimeout(() => {
    modalMsg.style.display = "none"
  }, 1000);
})

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

 // Função da animação de confete
  function startConfetti() {
    const duration = 500;
    const end = Date.now() + duration;

    function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 100,
        origin: { x: 0 },
        colors: ['#dadada', '#176b39', '#a3fc83'],
        drift: 0.0
      });

      confetti({
        particleCount: 5,
        angle: 120,
        spread: 100,
        origin: { x: 1 },
        colors: ['#dadada', '#176b39', '#a3fc83'],
        drift: 0.0
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }

    frame();
  }

function textAnimation() {
  const dots = document.getElementById("dots");
  const states = ["", ".", "..", "..."];
  let index = 0;

  setInterval(() => {
    dots.style.opacity = 0; // fade out

    setTimeout(() => {
      dots.textContent = states[index];
      dots.style.opacity = 1; // fade in
      index = (index + 1) % states.length;
    }, 400); // combina com o transition do CSS
  }, 800);
}

textAnimation();

function showModal() {
  modalSolutions.classList.remove("fade-out-modal");
  modalSolutions.classList.add("fade-in-modal");
  modalSolutions.style.display = "flex";
  eye.style.opacity = "0"
  if (window.$crisp) {
    $crisp.push(["do", "chat:hide"]);
  }
}

function hideModal() {
  modalSolutions.classList.remove("fade-in-modal");
  modalSolutions.classList.add("fade-out-modal");

  // esconde após o fim do fade-out
  setTimeout(() => {
    if (modalSolutions.classList.contains("fade-out-modal")) {
      modalSolutions.style.display = "none";
      eye.style.opacity = "1"
        if (window.$crisp) {
          $crisp.push(["do", "chat:show"]);
        }
    }
  }, FADE_OUT_DURATION);
}

// ---- handlers (desktop) ----
function onEnter() {
  clearTimeout(showTimeout);
  showTimeout = setTimeout(showModal, SHOW_DELAY);
}

// ---- handlers (mobile) ----
function onClickOpen() {
  clearTimeout(showTimeout);
  showTimeout = setTimeout(showModal, SHOW_DELAY);
}

function onClickClose() {
  hideModal();
}

// ---- binding/unbinding ----
function bindDesktop() {
  eye.addEventListener("mouseenter", onEnter);
}

function unbindDesktop() {
  eye.removeEventListener("mouseenter", onEnter);
}

function bindMobile() {
  eye.addEventListener("click", onClickOpen);
  buttonFechar?.addEventListener("click", onClickClose);
}

function unbindMobile() {
  eye.removeEventListener("click", onClickOpen);
  buttonFechar?.removeEventListener("click", onClickClose);
}

// ---- aplicar conforme largura ----
const mqMobile = window.matchMedia("(max-width: 768px)");

function applyBindings() {
  clearTimeout(showTimeout);

  if (mqMobile.matches) {
    // MOBILE: click abre / botão fecha
    unbindDesktop();
    bindMobile();
  } else {
    // DESKTOP: hover abre / botão fecha
    unbindMobile();
    bindDesktop();
    buttonFechar?.addEventListener("click", onClickClose);
  }
}

applyBindings();
mqMobile.addEventListener("change", applyBindings);

// Constrói HTML preservando quebras e espaços
textModal.innerHTML = textModal.textContent
  .split("")
  .map(char => {
    if (char === "\n") return "<br>";
    if (char === " ")  return `<span class="space">&nbsp;</span>`; // espaço preservado
    return `<span class="char">${char}</span>`;                    // letra normal
  })
  .join("");

// Selecione apenas letras (ignora .space)
const spans = textModal.querySelectorAll("span.char");

// Função que “apaga” letras aleatórias e as reacende
function randomFade() {
  const apagadas = 3;

  // acende tudo
  spans.forEach(span => (span.style.opacity = 1));

  // escolhe letras aleatórias (somente .char)
  const indices = new Set();
  while (indices.size < apagadas) {
    const i = Math.floor(Math.random() * spans.length);
    indices.add(i);
  }

  // aplica opacidade reduzida
  indices.forEach(i => {
    spans[i].style.opacity = 0.25 + Math.random() * 0.25; // 0.25–0.5
  });
}

// loop orgânico
function startFlicker() {
  randomFade();
  const next = 600 + Math.random() * 1200; // 0.6–1.8s
  setTimeout(startFlicker, next);
}
startFlicker();

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Could not get 2D context!");
    return;
  }

  let particlesArray = [];
  const particleColor = "#18181885";
  const particleRadius = 1.5;

  const mouse = {
    x: undefined,
    y: undefined,
    radius: 100
  };

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = Math.random() * 15 + 5;
      this.size = particleRadius;
      this.color = particleColor;
      this.driftVx = (Math.random() - 0.5) * 0.15;
      this.driftVy = (Math.random() - 0.5) * 0.15;
      this.vx = this.driftVx;
      this.vy = this.driftVy;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      this.baseX += this.driftVx;
      this.baseY += this.driftVy;

      if (this.baseX <= 0 || this.baseX >= canvas.width) {
        this.driftVx *= -1;
        this.baseX += this.driftVx * 2;
      }
      if (this.baseY <= 0 || this.baseY >= canvas.height) {
        this.driftVy *= -1;
        this.baseY += this.driftVy * 2;
      }

      let repulsionForceX = 0;
      let repulsionForceY = 0;
      let isMouseActive = mouse.x !== undefined && mouse.y !== undefined;

      if (isMouseActive) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          repulsionForceX = -Math.cos(angle) * force * this.density * 0.3;
          repulsionForceY = -Math.sin(angle) * force * this.density * 0.3;
        }
      }

      const returnSpeed = 0.08;
      let returnForceX = (this.baseX - this.x) * returnSpeed;
      let returnForceY = (this.baseY - this.y) * returnSpeed;

      this.vx = returnForceX + repulsionForceX + this.driftVx;
      this.vy = returnForceY + repulsionForceY + this.driftVy;

      this.x += this.vx;
      this.y += this.vy;

      this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
      this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
    }
  }

  function init() {
    particlesArray = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = calculateParticleCount();

    for (let i = 0; i < count; i++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      particlesArray.push(new Particle(x, y));
    }
  }

  function calculateParticleCount() {
    const area = window.innerWidth * window.innerHeight;

    const calculatedCount = Math.floor(area / 3500);
    return Math.max(80, Math.min(350, calculatedCount));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      if (particlesArray[i]) {
        // Basic check
        particlesArray[i].update();
        particlesArray[i].draw();
      }
    }
    requestAnimationFrame(animate);
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      init();
    }, 250);
  });

  init();
  animate();
});

(function mobileDesktopHooks(){
  function runMobileOnly() {
    labelNews.addEventListener("click", () => {
      labelNews.classList.remove("fade-bottom-in")
      inputNews.classList.remove("fade-bottom-out")
      labelNews.classList.add("fade-bottom-out")
      inputNews.classList.add("fade-bottom-in")
      setTimeout(() => {
        sendButton.style.pointerEvents = "all"
        sendButton.style.display = "block"
        inputNews.style.display = "block"
        labelNews.style.display = "none"
      }, 450);
    });

    divNews.addEventListener("mouseleave", () => {
      inputNews.value = ""
      labelNews.classList.remove("fade-bottom-out")
      inputNews.classList.remove("fade-bottom-in")
      labelNews.classList.add("fade-bottom-in")
      inputNews.classList.add("fade-bottom-out")
      setTimeout(() => {
        inputNews.style.display = "none"
        labelNews.style.display = "block"
        sendButton.style.pointerEvents = "none"
      }, 450);
    })
  }

  function runDesktopOnly() {
  inputNews.addEventListener("focus", () => {
    clearTimeout(blurTO);
    labelNews.classList.remove("fade-bottom-in");
    labelNews.classList.add("fade-bottom-out");
    sendButton.classList.add("fade-bottom-in")
    focusTO = setTimeout(() => {
      sendButton.style.display = "block"
      inputNews.style.width = "400px";
      labelNews.style.display = "none";
    }, 450);
  });

  // BLUR: só traz o label de volta se o foco NÃO foi para o botão
  inputNews.addEventListener("focusout", (e) => {
    // se o foco foi para o botão (ou algo dentro dele), não faz nada
    const to = e.relatedTarget;
    if (to && (to === sendButton || sendButton.contains(to))) return;

    clearTimeout(focusTO);
    inputNews.value = ""
    inputNews.style.border = "solid 2px #181818"
    sendButton.classList.remove("fade-bottom-in")
    sendButton.classList.add("fade-bottom-out")
    labelNews.classList.remove("fade-bottom-out");
    labelNews.classList.add("fade-bottom-in");
    blurTO = setTimeout(() => {
      sendButton.style.display = "none"
      inputNews.style.width = "300px";
      labelNews.style.display = "inline-block";
    }, 450);
  });

  }

  function applyHooks(){
    if (mqMobile.matches) runMobileOnly();
    else runDesktopOnly();
  }

  applyHooks();
  mqMobile.addEventListener("change", applyHooks);
})();