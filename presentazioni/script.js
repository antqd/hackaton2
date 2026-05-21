const stats = {
  happiness: 68,
  energy: 71,
  order: 54
};

const scenarios = {
  control: {
    label: "Controllo aumentato",
    values: { happiness: 52, energy: 78, order: 86 },
    response: "Decreto approvato. Rischio criminale in calo del 41%. Nota etica: la privacy civile scende sotto la soglia consigliata.",
    outcome: "La città è più stabile, ma meno libera",
    detail: "Le strade diventano sicure e prevedibili. I cittadini, però, iniziano a chiedersi chi controlla il controllore."
  },
  freedom: {
    label: "Libertà protetta",
    values: { happiness: 81, energy: 66, order: 42 },
    response: "Decreto approvato. Autonomia civile in crescita. Nota operativa: servono nuove politiche comunitarie per contenere il caos.",
    outcome: "La libertà cresce, ma il caos aumenta",
    detail: "La città respira, crea e discute. Il prezzo è una rete sociale meno prevedibile e più difficile da governare."
  }
};

const meters = document.querySelectorAll("[data-meter]");
const numbers = document.querySelectorAll("[data-stat]");
const choiceButtons = document.querySelectorAll("[data-choice]");
const aiResponse = document.getElementById("aiResponse");
const aiResponseBox = document.querySelector(".ai-response");
const scenarioState = document.getElementById("scenarioState");
const outcomeText = document.getElementById("outcomeText");
const outcomeDetail = document.getElementById("outcomeDetail");
const startButton = document.getElementById("startExperience");

function initSunScene() {
  const canvas = document.getElementById("sunScene");
  const visual = canvas?.closest(".hero-visual");

  if (!canvas || !visual || !window.THREE) {
    return;
  }

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.25, 6.8);

  const system = new THREE.Group();
  system.position.y = 0.18;
  scene.add(system);

  const sunMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4c95d,
    emissive: 0xff9f1a,
    emissiveIntensity: 1.55,
    roughness: 0.34,
    metalness: 0.12
  });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.18, 72, 72), sunMaterial);
  system.add(sun);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.42, 72, 72),
    new THREE.MeshBasicMaterial({
      color: 0xf4c95d,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  system.add(halo);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 2),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x36d6ff,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.34,
      roughness: 0.2,
      metalness: 0.25
    })
  );
  system.add(core);

  const blueRing = new THREE.MeshBasicMaterial({
    color: 0x36d6ff,
    transparent: true,
    opacity: 0.64
  });
  const violetRing = new THREE.MeshBasicMaterial({
    color: 0x8e5cff,
    transparent: true,
    opacity: 0.5
  });
  const goldRing = new THREE.MeshBasicMaterial({
    color: 0xf4c95d,
    transparent: true,
    opacity: 0.72
  });

  const rings = [
    new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.012, 10, 180), blueRing),
    new THREE.Mesh(new THREE.TorusGeometry(2.22, 0.01, 10, 180), violetRing),
    new THREE.Mesh(new THREE.TorusGeometry(2.58, 0.008, 10, 180), goldRing)
  ];

  rings[0].rotation.x = Math.PI / 2.5;
  rings[1].rotation.y = Math.PI / 2.8;
  rings[2].rotation.set(Math.PI / 2.2, 0.35, 0.2);
  rings.forEach((ring) => system.add(ring));

  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0x36d6ff,
    transparent: true,
    opacity: 0.95
  });
  const nodeGeometry = new THREE.SphereGeometry(0.045, 16, 16);
  const nodes = new THREE.Group();

  for (let index = 0; index < 18; index += 1) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    const angle = (index / 18) * Math.PI * 2;
    node.position.set(Math.cos(angle) * 2.22, Math.sin(angle) * 0.38, Math.sin(angle) * 2.22);
    nodes.add(node);
  }

  system.add(nodes);

  scene.add(new THREE.AmbientLight(0x8fb8ff, 0.6));

  const keyLight = new THREE.PointLight(0xf4c95d, 3.2, 12);
  keyLight.position.set(0, 1.8, 3.8);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x36d6ff, 1.2);
  rimLight.position.set(-3, 2.5, 4);
  scene.add(rimLight);

  const rotationTarget = { x: -0.12, y: 0.35 };
  const pointer = { x: 0, y: 0, active: false };

  function resizeScene() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 560 ? 7.6 : 6.8;
    system.scale.setScalar(width < 560 ? 0.86 : 1);
    camera.updateProjectionMatrix();
  }

  canvas.addEventListener("pointerdown", (event) => {
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    canvas.classList.add("is-dragging");
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!pointer.active) {
      return;
    }

    const deltaX = event.clientX - pointer.x;
    const deltaY = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    rotationTarget.y += deltaX * 0.008;
    rotationTarget.x = Math.max(-0.75, Math.min(0.75, rotationTarget.x + deltaY * 0.006));
  });

  function releasePointer(event) {
    pointer.active = false;
    canvas.classList.remove("is-dragging");
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  canvas.addEventListener("pointerup", releasePointer);
  canvas.addEventListener("pointercancel", releasePointer);
  window.addEventListener("resize", resizeScene);

  function animate() {
    if (!pointer.active) {
      rotationTarget.y += 0.0035;
    }

    system.rotation.x += (rotationTarget.x - system.rotation.x) * 0.08;
    system.rotation.y += (rotationTarget.y - system.rotation.y) * 0.08;
    sun.rotation.y += 0.006;
    halo.rotation.y -= 0.003;
    core.rotation.x += 0.006;
    core.rotation.y -= 0.008;
    rings[0].rotation.z += 0.006;
    rings[1].rotation.x += 0.004;
    rings[2].rotation.y -= 0.005;
    nodes.rotation.y += 0.0045;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resizeScene();
  visual.classList.add("is-live");
  animate();
}

function setMeters(values) {
  meters.forEach((meter) => {
    const key = meter.dataset.meter;
    meter.style.width = `${values[key]}%`;
  });
}

function animateNumber(element, nextValue) {
  const startValue = Number(element.textContent);
  const duration = 620;
  const startTime = performance.now();
  element.classList.add("is-changing");

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startValue + (nextValue - startValue) * eased);
    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.classList.remove("is-changing");
    }
  }

  requestAnimationFrame(tick);
}

function applyChoice(choice) {
  const scenario = scenarios[choice];

  choiceButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.choice === choice);
  });

  numbers.forEach((number) => {
    const key = number.dataset.stat;
    animateNumber(number, scenario.values[key]);
  });

  setMeters(scenario.values);
  scenarioState.textContent = scenario.label;
  aiResponse.textContent = scenario.response;
  outcomeText.textContent = scenario.outcome;
  outcomeDetail.textContent = scenario.detail;

  aiResponseBox.classList.remove("is-updated");
  void aiResponseBox.offsetWidth;
  aiResponseBox.classList.add("is-updated");

  document.getElementById("outcome").scrollIntoView({ behavior: "smooth", block: "center" });
}

function revealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

startButton.addEventListener("click", () => {
  document.getElementById("demo").scrollIntoView({ behavior: "smooth" });
  scenarioState.textContent = "Scenario attivo";
  aiResponse.textContent = "Scenario caricato. Scegli una politica e osserva come reagisce la città.";
  aiResponseBox.classList.remove("is-updated");
  void aiResponseBox.offsetWidth;
  aiResponseBox.classList.add("is-updated");
});

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => applyChoice(button.dataset.choice));
});

setMeters(stats);
revealOnScroll();
initSunScene();
