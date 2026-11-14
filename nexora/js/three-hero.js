/* =====================================================
   AVEN — Ultra-Lightweight Three.js 3D Hero Scene
   Guaranteed Render & Zero Lag (On-Demand + Viewport Aware)
   ===================================================== */

(function () {
  function init() {
    const container = document.getElementById('three-canvas-wrap');
    if (!container) return;

    // Clear any previous canvas
    container.innerHTML = '';

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);

    // Exact 3/4 isometric perspective matching reference angle
    camera.position.set(0, 0.25, 4.0);
    camera.lookAt(0, 0, 0);

    // 2. High-Performance Lightweight WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1); // Capped at 1 to eliminate GPU overhead on Retina screens
    container.appendChild(renderer.domElement);

    // 3. Smooth Orbit Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = false; // Fixed angle, no unwanted rotation
    controls.enablePan = false;
    controls.minDistance = 2.2;
    controls.maxDistance = 6.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.minPolarAngle = Math.PI / 6;

    // 4. Clean Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight(0x00a3ff, 1.8); // AVEN Cyan
    cyanRim.position.set(-4, 2, -2);
    scene.add(cyanRim);

    // 5. Model Group (Set to EXACT angle from screenshot)
    const modelGroup = new THREE.Group();
    // 30 degree Y rotation + slight tilt to match reference screenshot
    modelGroup.rotation.set(0.04, 0.52, 0);
    scene.add(modelGroup);

    // -----------------------------------------------------------
    // Stylized AVEN Kiosk 3D Model
    // -----------------------------------------------------------
    const kiosk = new THREE.Group();

    // Body (Matte Navy Metallic)
    const bodyGeo = new THREE.BoxGeometry(1.25, 2.45, 0.42);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x07172f,
      roughness: 0.3,
      metalness: 0.6
    });
    kiosk.add(new THREE.Mesh(bodyGeo, bodyMat));

    // Base Stand
    const baseGeo = new THREE.BoxGeometry(1.48, 0.16, 0.65);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0a2244,
      roughness: 0.4,
      metalness: 0.5
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -1.26;
    kiosk.add(base);

    // Screen (Vibrant Blue Display)
    const screenGeo = new THREE.PlaneGeometry(1.04, 0.82);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0756b9,
      emissive: 0x003b8e,
      emissiveIntensity: 0.35,
      roughness: 0.2
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.62, 0.215);
    kiosk.add(screen);

    // Screen Top Glow Bar (Cyan)
    const barGeo = new THREE.PlaneGeometry(0.96, 0.02);
    const barMat = new THREE.MeshBasicMaterial({ color: 0x00a3ff });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 0.94, 0.22);
    kiosk.add(bar);

    // Power Bank Rental Bays (4 rows x 3 columns)
    const slotMat = new THREE.MeshBasicMaterial({ color: 0x030b14 });
    const pbMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.2
    });
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });

    const startY = 0.06;
    const spacingY = 0.23;
    const startX = -0.33;
    const spacingX = 0.33;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const x = startX + c * spacingX;
        const y = startY - r * spacingY;

        // Slot
        const slot = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.15), slotMat);
        slot.position.set(x, y, 0.215);
        kiosk.add(slot);

        // Power Bank
        const pb = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.11, 0.05), pbMat);
        pb.position.set(x, y, 0.23);
        kiosk.add(pb);

        // Green LED
        const led = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.02), ledMat);
        led.position.set(x + 0.065, y, 0.26);
        kiosk.add(led);
      }
    }

    // Lower Branding Panel
    const lowerGeo = new THREE.PlaneGeometry(1.04, 0.2);
    const lowerMat = new THREE.MeshStandardMaterial({
      color: 0x0a2244,
      emissive: 0x00a3ff,
      emissiveIntensity: 0.25,
      roughness: 0.3
    });
    const lower = new THREE.Mesh(lowerGeo, lowerMat);
    lower.position.set(0, -0.98, 0.215);
    kiosk.add(lower);

    kiosk.position.y = 0.08;
    modelGroup.add(kiosk);

    // -----------------------------------------------------------
    // Drag & Drop .GLB into 3D card
    // -----------------------------------------------------------
    const dropZone = document.getElementById('three-hero-container');
    if (dropZone && typeof THREE.GLTFLoader !== 'undefined') {
      dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.style.borderColor = '#00A3FF';
      });
      dropZone.addEventListener('dragleave', e => {
        e.preventDefault();
        dropZone.style.borderColor = 'rgba(66, 169, 239, 0.25)';
      });
      dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.style.borderColor = 'rgba(66, 169, 239, 0.25)';

        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
          const reader = new FileReader();
          reader.onload = function (event) {
            const buffer = event.target.result;
            const loader = new THREE.GLTFLoader();
            loader.parse(
              buffer,
              '',
              function (gltf) {
                while (modelGroup.children.length > 0) {
                  modelGroup.remove(modelGroup.children[0]);
                }
                const root = gltf.scene;
                const box = new THREE.Box3().setFromObject(root);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2.4 / (maxDim || 1);

                root.scale.setScalar(scale);
                root.position.sub(center.multiplyScalar(scale));
                root.position.y += 0.08;

                modelGroup.add(root);
                requestWakeup(60);
              },
              err => console.error('Error parsing GLB:', err)
            );
          };
          reader.readAsArrayBuffer(file);
        }
      });
    }

    // -----------------------------------------------------------
    // Intelligent On-Demand Rendering (0% Idle CPU Load)
    // -----------------------------------------------------------
    let activeFrames = 90; // Initial render settle
    let isVisible = true;

    function requestWakeup(frames = 30) {
      activeFrames = Math.max(activeFrames, frames);
    }

    // Wakeup on any user interaction with 3D canvas
    controls.addEventListener('change', () => requestWakeup(30));
    container.addEventListener('pointerdown', () => requestWakeup(60));
    container.addEventListener('pointermove', (e) => { if (e.buttons > 0) requestWakeup(25); });
    container.addEventListener('wheel', () => requestWakeup(30), { passive: true });

    // Stop rendering completely when Hero section is out of viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) requestWakeup(45);
        });
      }, { threshold: 0.05 });
      observer.observe(container);
    }

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return; // 0% CPU when scrolled away
      if (activeFrames > 0) {
        activeFrames--;
        controls.update();
        renderer.render(scene, camera);
      }
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW && newH) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
        requestWakeup(15);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
