
const cancelButton = document.getElementById("unsubscribe")
const inputCancel = document.getElementById("input-cancelamento")
const modalMsg = document.getElementById("modal-msg")
const fecharMsg = document.getElementById("fechar-msg")

// === Apps Script Web App ===
const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbxoZ_hbG0TaltuSjv9CpxvVvykrpBsCyZ-44f03bTEs9O2DVUaA75SWBMUNMhgzff3n/exec";
const API_KEY = "MINHA_CHAVE_SECRETA_RRMCSD_2025_!@#F3q8x";

// função genérica
async function unsubscribeLead(email) {
  const payload = {
    key: API_KEY,
    action: "unsubscribe",
    email: String(email || "").trim().toLowerCase(),
    userAgent: navigator.userAgent,
  };

  try {
    await fetch(APPSCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      body: JSON.stringify(payload),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

cancelButton.addEventListener("click", async () => {
  if (inputCancel.value.includes("@") && validateEmail(inputCancel.value)) {
    await unsubscribeLead(inputCancel.value);

    // UX igual ao subscribe
    setTimeout(() => {
      modalMsg.classList.add("fade-bottom-in");
      modalMsg.style.display = "flex";
      inputCancel.value = "";
    }, 400);
  } else {
    inputCancel.value = "";
    inputCancel.style.border = "solid 2px #ed3e3eff";
  }
});

fecharMsg.addEventListener("click", () => {
  modalMsg.classList.remove("fade-bottom-in")
  modalMsg.classList.add("fade-bottom-out")
  setTimeout(() => {
    modalMsg.style.display = "none"
  }, 1000);
})

inputCancel.addEventListener("click", () => {
    inputCancel.value = ""
    inputCancel.style.border = "solid 2px #176b39"
})

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  let particlesArray = [];
  const particleColor = "rgba(24, 24, 24, 0.7)";
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

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

function setWindowSize() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
};
window.addEventListener('resize', setWindowSize);

var eyes = document.querySelectorAll(".eyes");
var cursorPos = { x: 0, y: 0 };

window.addEventListener("mousemove", mousemove);
window.addEventListener("touchmove", touchmove);

function mousemove(e) {
  cursorPos = {
    x: e.clientX,
    y: e.clientY
  }; 
	if (!clicked) {
	  eyes.forEach(function(el) {
		  eyeFollow.init(el);
	  })
	}
}
function touchmove(e) {
  cursorPos = {
    x: e.targetTouches[0].offsetX,
    y: e.targetTouches[0].offsetY
  }; 
	if (!clicked) {
	  eyes.forEach(function(el) {
		  eyeFollow.init(el);
	  })
	}
}

var eyeFollow = (function() {

	function getOffset(el) {
  		el = el.getBoundingClientRect();
		return {
			x: el.left + window.scrollX,
			y: el.top + window.scrollY
		};
	}
	
	function moveEye(eye) {
		var eyeOffset = getOffset(eye);
		var bBox = eye.getBBox();
		var centerX = eyeOffset.x + bBox.width / 2;
		var centerY = eyeOffset.y + bBox.height / 2;
		var percentTop = Math.round((cursorPos.y - centerY) * 100 / windowHeight);
		var percentLeft = Math.round((cursorPos.x - centerX) * 100 / windowWidth);
		eye.style.transform = `translate(${percentLeft/5}px, ${ percentTop/5}px)`
	}
	
	return {
    init: (el) => {
      moveEye(el);
    }
  };
})();



var clicked, cancelled;
var animate = (function() {

	var select = function(el) {
		 return document.getElementById(el);
	};
	var 
		 eyeGroup = select("eye-group"),
		 paper = select("paper-group"),
		 mouth = select("mouth"),
		 eyebrowSadLeft = select("eyebrow-sad-left"),
		 eyebrowSadRight = select("eyebrow-sad-right"),
		 mouthWorry = select("mouth-worry"),
		 tongue = select("tongue")

	function initAnimations() {
		clicked = false;
	}

	return {
		init: () => {
			initAnimations();
		}
	};
})();

document.addEventListener("DOMContentLoaded", animate.init());

function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}