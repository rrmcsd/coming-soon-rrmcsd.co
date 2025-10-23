const modalSolutions = document.getElementById("modal-solutions")
const buttonFechar = document.getElementById("fechar-modal")
const eye = document.getElementById("eye")
const textModal = document.getElementById("text-modal");

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

let showTimeout;

// ---- helpers ----
const SHOW_DELAY = 200;   // ms
const FADE_OUT_DURATION = 500; // deve bater com o CSS da animação

function showModal() {
  modalSolutions.classList.remove("fade-out-modal");
  modalSolutions.classList.add("fade-in-modal");
  modalSolutions.style.display = "flex";
  eye.style.opacity = "0"
}

function hideModal() {
  modalSolutions.classList.remove("fade-in-modal");
  modalSolutions.classList.add("fade-out-modal");

  // esconde após o fim do fade-out
  setTimeout(() => {
    if (modalSolutions.classList.contains("fade-out-modal")) {
      modalSolutions.style.display = "none";
      eye.style.opacity = "1"
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


// Quebra o texto em letras individuais
textModal.innerHTML = textModal.textContent
  .split("")
  .map((char) => (char === "\n" ? "<br>" : `<span>${char}</span>`))
  .join("");

const spans = textModal.querySelectorAll("span");

// Função que “apaga” letras aleatórias e as reacende
function randomFade() {
  // Define quantas letras devem estar “apagadas” ao mesmo tempo
  const apagadas = 3;
  
  // Zera tudo pra “aceso”
  spans.forEach((span) => (span.style.opacity = 1));

  // Escolhe letras aleatórias para apagar parcialmente
  const indices = [];
  while (indices.length < apagadas) {
    const randomIndex = Math.floor(Math.random() * spans.length);
    if (!indices.includes(randomIndex) && spans[randomIndex].textContent.trim() !== "") {
      indices.push(randomIndex);
    }
  }

  // Aplica opacidade reduzida nessas letras
  indices.forEach((i) => {
    spans[i].style.opacity = 0.25 + Math.random() * 0.25; // varia entre 0.25 e 0.5
  });
}

// Chama continuamente com intervalos irregulares (pra parecer orgânico)
function startFlicker() {
  randomFade();
  const next = 600 + Math.random() * 1200; // 0.6s a 1.8s entre trocas
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
