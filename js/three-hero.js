document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("webgl-hero-container");
  const canvas = document.getElementById("hero-canvas");
  if (!container || !canvas) return;

  // --- 1. Scene Setup ---
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#0a0a0c", 0.005);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 25;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- 2. Particle Geometry Setup ---
  const particleCount = 6000;
  const geometry = new THREE.BufferGeometry();
  
  const posBase = new Float32Array(particleCount * 3);     // Tubular Sensor
  const posExploded = new Float32Array(particleCount * 3); // Components
  const posNetwork = new Float32Array(particleCount * 3);  // Factory Grid
  const randoms = new Float32Array(particleCount);

  for(let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // State 1: Sensor (Hollow Cylinder + Core)
    const isCore = Math.random() > 0.8;
    const r = isCore ? (Math.random() * 2) : 5 + (Math.random() * 2);
    const theta = Math.random() * Math.PI * 2;
    const h = (Math.random() - 0.5) * 20;
    
    posBase[i3] = Math.cos(theta) * r;
    posBase[i3 + 1] = h;
    posBase[i3 + 2] = Math.sin(theta) * r;

    // State 2: Exploded view (Clusters)
    let cx = 0, cy = 0, cz = 0;
    if (h > 5) { cy = 12; cx = 8; }
    else if (h > 0) { cy = 3; cx = -8; cz = -8; }
    else if (h > -5) { cy = -4; cx = 10; cz = 8; }
    else { cy = -12; cx = -6; }

    posExploded[i3] = posBase[i3] * 1.5 + cx + (Math.random() - 0.5) * 6;
    posExploded[i3 + 1] = posBase[i3+1] * 1.5 + cy + (Math.random() - 0.5) * 6;
    posExploded[i3 + 2] = posBase[i3+2] * 1.5 + cz + (Math.random() - 0.5) * 6;

    // State 3: Automation Network Grid (Abstract Factory floor)
    const netSize = 60;
    posNetwork[i3] = (Math.random() - 0.5) * netSize;
    posNetwork[i3 + 1] = (Math.random() - 0.5) * (netSize / 2) - 10;
    posNetwork[i3 + 2] = (Math.random() - 0.5) * netSize;

    randoms[i] = Math.random();
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(posBase, 3));
  geometry.setAttribute("aPositionExploded", new THREE.BufferAttribute(posExploded, 3));
  geometry.setAttribute("aPositionNetwork", new THREE.BufferAttribute(posNetwork, 3));
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

  // --- 3. Custom Morphing Shader Material ---
  const material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#00d2ff") }, // Electric Blue
      uColor2: { value: new THREE.Color("#444444") }, // Graphite
      uProgress1: { value: 0 },
      uProgress2: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uProgress1;
      uniform float uProgress2;
      attribute vec3 aPositionExploded;
      attribute vec3 aPositionNetwork;
      attribute float aRandom;
      varying float vAlpha;
      varying float vMix;

      void main() {
        vec3 finalPos = position;
        
        // Morph 1
        finalPos = mix(finalPos, aPositionExploded, uProgress1);
        
        // Morph 2
        finalPos = mix(finalPos, aPositionNetwork, uProgress2);

        // Ambient floating
        finalPos.y += sin(uTime * 1.5 + aRandom * 10.0) * 0.8;
        finalPos.x += cos(uTime * 1.2 + aRandom * 10.0) * 0.4;

        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        
        gl_PointSize = (20.0 * aRandom + 4.0) * (40.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;

        vAlpha = 0.2 + (sin(uTime * 3.0 + aRandom * 20.0) * 0.5 + 0.5) * 0.8;
        vMix = aRandom;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying float vAlpha;
      varying float vMix;
      void main() {
        // Circular point soft edge
        float dist = distance(gl_PointCoord, vec2(0.5));
        if(dist > 0.5) discard;
        float strength = pow(1.0 - (dist * 2.0), 1.5);
        
        vec3 finalColor = mix(uColor1, uColor2, vMix * 0.5); // Add some graphite variation
        gl_FragColor = vec4(finalColor, strength * vAlpha);
      }
    `
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Initial rotations
  particles.rotation.x = Math.PI * 0.1;
  particles.rotation.z = Math.PI * 0.1;

  // --- 4. Render Loop ---
  const clock = new THREE.Clock();
  function tick() {
    material.uniforms.uTime.value = clock.getElapsedTime();
    particles.rotation.y += 0.002;
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  }
  tick();

  // --- 5. GSAP ScrollTrigger Sequence ---
  gsap.registerPlugin(ScrollTrigger);

  // 5 steps total, timeline scrubs through them based on scroll
  // Use a pinned timeline for true Apple-like continuous scrolling
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#webgl-hero-container",
      start: "top top",
      end: "+=5000",
      scrub: 1.5,
      pin: true
    }
  });

  gsap.set("#step-1", { opacity: 1 });

  // ----------------------------------------------------------------
  // START: Time 0
  // Transition 1: Intro -> Precision (0 to 15)
  tl.to("#step-1", { opacity: 0, duration: 10 }, 0);
  
  // Camera moves right (Object left).
  tl.to(camera.position, { z: 18, x: 6, ease: "power2.inOut", duration: 15 }, 0);
  tl.to(particles.rotation, { x: Math.PI * 0.4, z: Math.PI * 0.1, ease: "power2.inOut", duration: 15 }, 0);
  
  // Step 2 ("Precision", Right) fades in towards the end of motion (7 to 15)
  tl.to("#step-2", { opacity: 1, duration: 8 }, 7);

  // ----------------------------------------------------------------
  // Presentation 1: Precision Engineering (15 to 35)
  // Text 2 stays 100% opacity. Visual is dynamic: continuous slow zoom so it's NEVER idle.
  tl.to(camera.position, { z: 16, ease: "none", duration: 20 }, 15);
  tl.to(particles.rotation, { x: Math.PI * 0.45, z: 0, ease: "none", duration: 20 }, 15);

  // ----------------------------------------------------------------
  // Transition 2: Precision -> Deconstruct (35 to 55)
  tl.to("#step-2", { opacity: 0, duration: 8 }, 35);
  
  // Object morphs to explode. Camera moves Left (Object Right).
  tl.to(material.uniforms.uProgress1, { value: 1, ease: "power2.inOut", duration: 20 }, 35);
  tl.to(camera.position, { z: 30, x: -7, ease: "power2.inOut", duration: 20 }, 35);
  tl.to(particles.rotation, { x: -Math.PI * 0.2, ease: "power2.inOut", duration: 20 }, 35);
  
  // Step 3 ("Deconstruct", Left) fades in (45 to 55)
  tl.to("#step-3", { opacity: 1, duration: 10 }, 45);

  // ----------------------------------------------------------------
  // Presentation 2: Deconstruct (55 to 75)
  // Dynamic visual: gentle zoom and twist
  tl.to(camera.position, { z: 28, ease: "none", duration: 20 }, 55);
  tl.to(particles.rotation, { x: -Math.PI * 0.25, z: Math.PI * 0.1, ease: "none", duration: 20 }, 55);

  // ----------------------------------------------------------------
  // Transition 3: Deconstruct -> Network (75 to 95)
  tl.to("#step-3", { opacity: 0, duration: 8 }, 75);
  
  // Object morphs to Network. Camera moves Right (Object Left).
  tl.to(material.uniforms.uProgress2, { value: 1, ease: "power2.inOut", duration: 20 }, 75);
  tl.to(camera.position, { z: 45, x: 6, ease: "power2.inOut", duration: 20 }, 75);
  tl.to(particles.rotation, { x: Math.PI * 0.2, z: -Math.PI * 0.1, ease: "power2.inOut", duration: 20 }, 75);
  
  // Step 4 ("Network", Right) fades in (85 to 95)
  tl.to("#step-4", { opacity: 1, duration: 10 }, 85);

  // ----------------------------------------------------------------
  // Presentation 3: Network (95 to 115)
  tl.to(camera.position, { z: 42, ease: "none", duration: 20 }, 95);
  tl.to(particles.rotation, { x: Math.PI * 0.25, ease: "none", duration: 20 }, 95);

  // ----------------------------------------------------------------
  // Transition 4: Network -> Final (115 to 135)
  tl.to("#step-4", { opacity: 0, duration: 8 }, 115);
  
  // Zoom out, center camera.
  tl.to(camera.position, { z: 65, y: 10, x: 0, ease: "power2.inOut", duration: 20 }, 115);
  tl.to(particles.rotation, { x: 0, z: 0, ease: "power2.inOut", duration: 20 }, 115);
  tl.to(particles.position, { y: -15, ease: "power2.inOut", duration: 20 }, 115);

  // Step 5 (Center) fades in
  tl.to("#step-5", { opacity: 1, duration: 10 }, 125);


  // --- 6. Window Resize ---
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
