import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { C, FLOOR_Y, solid, add, canvasTexture } from "./lib.js?v=20261111d";
import { buildProps } from "./props.js?v=20261111d";

/* 每个可点物品聚焦时的镜头目标 */
const FOCUS = {
  music: { target: [-0.34, 1.15, -2.45], zoom: 2.2 },
  drums: { target: [-2.55, 0.95, -1.72], zoom: 2.3 },
  guitar: { target: [-3.2, 0.95, 1.95], zoom: 4.2 },
  racket: { target: [-3.7, 1.75, 2.3], zoom: 3.2 },
  gloves: { target: [-3.68, 1.42, 2.32], zoom: 3.4 },
  paintWheat: { target: [-2.73, 2.55, -2.6], zoom: 3.0 },
  paintAlmond: { target: [-1.43, 2.2, -2.6], zoom: 3.0 },
  desk: { target: [1.75, 1.35, -2.2], zoom: 2.7 },
  board: { target: [1.75, 2.5, -2.6], zoom: 2.8 },
  monitor: { target: [1.63, 1.5, -2.4], zoom: 3.2 },
  keyboard: { target: [1.65, 1.1, -2.15], zoom: 3.0 },
  notebook: { target: [0.95, 1.12, -2.15], zoom: 2.9 },
  shelf: { target: [3.45, 1.3, -2.55], zoom: 3.3 },
  library: { target: [3.45, 0.75, -2.52], zoom: 3.2 },
  drone: { target: [3.48, 2.3, -2.5], zoom: 3.2 },
  mug: { target: [2.47, 1.1, -2.15], zoom: 3.2 },
  calendar: { target: [2.73, 1.1, -2.43], zoom: 3.0 },
  map: { target: [-3.62, 2.1, 0.62], zoom: 3.1 },
  poster: { target: [-3.55, 2.05, -1.45], zoom: 3.2 },
  bike: { target: [2.55, 0.9, 1.75], zoom: 2.2 },
  sports: { target: [-3.62, 1.7, 1.82], zoom: 2.6 },
  camera: { target: [-3.42, 0.85, 2.42], zoom: 2.6 },
  table: { target: [-1.95, 0.75, 0.55], zoom: 2.4 },
  tequila: { target: [-1.78, 0.7, 0.2], zoom: 3.0 },
  knight: { target: [3.2, 1.95, -2.57], zoom: 3.2 },
  sand: { target: [3.5, 1.95, -2.57], zoom: 3.2 },
  movies: { target: [3.48, 1.45, -2.55], zoom: 3.0 },
  telescope: { target: [-3.4, 0.75, 2.45], zoom: 2.9 },
  letter: { target: [-3.1, 0.85, 0.2], zoom: 2.6 },
  seeds: { target: [-2.02, 0.55, 0.73], zoom: 3.0 },
  sunflowers: { target: [-2.06, 0.75, 0.25], zoom: 3.0 }
};

const HOME_TARGET = new THREE.Vector3(0.0, 1.32, -0.3);
const BASE_THETA = Math.PI / 4;
const BASE_PHI = 0.95;
const ORBIT_RADIUS = 26;
const THETA_RANGE = 0.62;
const PHI_MIN = 0.62;
const PHI_MAX = 1.34;

export function createWorld(container, config) {
  /* ---------------- 基础三件套 ---------------- */
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";
  renderer.domElement.style.cursor = "grab";
  container.appendChild(renderer.domElement);

  const camera = new THREE.OrthographicCamera(-6, 6, 6, -6, 0.1, 120);
  camera.position.set(
    HOME_TARGET.x + Math.sin(BASE_THETA) * Math.sin(BASE_PHI) * ORBIT_RADIUS,
    HOME_TARGET.y + Math.cos(BASE_PHI) * ORBIT_RADIUS,
    HOME_TARGET.z + Math.cos(BASE_THETA) * Math.sin(BASE_PHI) * ORBIT_RADIUS
  );
  camera.lookAt(HOME_TARGET);

  /* ---------------- 灯光 ---------------- */
  scene.add(new THREE.HemisphereLight("#fff4e0", "#b8a184", 1.05));

  const sun = new THREE.DirectionalLight("#ffeacb", 3.0);
  sun.position.set(7.5, 12, 8.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -9;
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 40;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.045;
  scene.add(sun);
  scene.add(sun.target);

  const fill = new THREE.DirectionalLight("#dbe6ff", 0.4);
  fill.position.set(-8, 5, -5);
  scene.add(fill);

  const lampGlow = new THREE.SpotLight("#ffd9a0", 16, 4.5, 0.9, 0.9, 1.6);
  lampGlow.position.set(0.45, 2.02, -2.1);
  lampGlow.target.position.set(0.85, 1.0, -2.3);
  scene.add(lampGlow);
  scene.add(lampGlow.target);

  /* ---------------- 房间外壳 ---------------- */
  const floorTex = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#e7dcc9";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(${150 + Math.random() * 40}, ${120 + Math.random() * 35}, ${90 + Math.random() * 30}, 0.05)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 40 + Math.random() * 160, 2 + Math.random() * 3);
    }
    for (let y = 0; y < h; y += 86) {
      ctx.fillStyle = "rgba(120,95,70,0.10)";
      ctx.fillRect(0, y, w, 2);
    }
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = "rgba(255,250,240,0.35)";
      ctx.fillRect(0, i * 86 + 30, w, 8);
    }
  }, { repeat: [3, 2.4] });

  add(scene, new THREE.BoxGeometry(8.4, 0.3, 6.4), solid(C.plinth, 0.95), [0, -0.15, 0]);
  add(scene, new THREE.BoxGeometry(8, 0.18, 6), new THREE.MeshStandardMaterial({
    map: floorTex, roughness: 0.9
  }), [0, 0, 0]);

  add(scene, new THREE.BoxGeometry(8, 3.8, 0.18), solid(C.wallBack, 1), [0, 1.9, -2.91]);
  add(scene, new THREE.BoxGeometry(0.18, 3.8, 6), solid(C.wallSide, 1), [-3.91, 1.9, 0]);

  const trim = solid(C.trim, 0.9);
  add(scene, new THREE.BoxGeometry(8.16, 0.16, 0.26), trim, [0, 3.82, -2.91]);
  add(scene, new THREE.BoxGeometry(0.26, 0.16, 6.16), trim, [-3.91, 3.82, 0]);
  add(scene, new THREE.BoxGeometry(8, 0.14, 0.1), trim, [0, 0.07, -2.82]);
  add(scene, new THREE.BoxGeometry(0.1, 0.14, 5.9), trim, [-3.82, 0.07, 0]);

  /* ---------------- 家具 ---------------- */
  const parts = buildProps(scene);

  /* ---------------- 可交互对象登记 ---------------- */
  const hotspotObjects = [];
  const hotspotByKey = new Map();
  const liftState = new Map();

  function registerHotspot(object, key) {
    if (!object) return;
    object.traverse((child) => {
      child.userData.hotspot = key;
    });
    object.userData.hotspot = key;
    hotspotObjects.push(object);
    if (!hotspotByKey.has(key)) hotspotByKey.set(key, object);
    if (!liftState.has(object)) {
      liftState.set(object, { baseY: object.position.y, target: 0 });
    }
  }

  registerHotspot(parts.music, "music");
  registerHotspot(parts.desk, "desk");
  registerHotspot(parts.board, "board");
  registerHotspot(parts.shelf, "shelf");
  parts.shelf.userData.noLift = true;
  registerHotspot(parts.table, "table");
  registerHotspot(parts.seeds, "seeds");
  registerHotspot(parts.sunflowers, "sunflowers");
  registerHotspot(parts.tequila, "tequila");
  registerHotspot(parts.binoHit, "telescope");
  registerHotspot(parts.bookHit, "birdbook");
  registerHotspot(parts.racket, "racket");
  registerHotspot(parts.racketB, "racket");
  registerHotspot(parts.sports, "gloves");
  registerHotspot(parts.letter, "letter");
  registerHotspot(parts.crate, "crate");
  registerHotspot(parts.monitor, "monitor");
  registerHotspot(parts.keyboard, "keyboard");
  registerHotspot(parts.notebook, "notebook");
  registerHotspot(parts.knight, "knight");
  registerHotspot(parts.drone, "drone");
  registerHotspot(parts.mug, "mug");
  registerHotspot(parts.calendar, "calendar");
  registerHotspot(parts.map, "map");
  registerHotspot(parts.paintWheat, "paintWheat");
  registerHotspot(parts.paintAlmond, "paintAlmond");
  registerHotspot(parts.poster, "poster");
  registerHotspot(parts.movieBox, "movies");
  registerHotspot(parts.sand, "sand");
  registerHotspot(parts.libHit, "library");
  registerHotspot(parts.deskCamera, "cameraObj");

  /* ---------------- GLB 模型 ---------------- */
  const loader = new GLTFLoader();
  const modelsToLoad = [];

  function fitModel(model, { height, x, z, rotY = 0, recolor = null }) {
    model.rotation.y = rotY;

    if (recolor) {
      model.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (!mat.color) return;
          const hsl = {};
          mat.color.getHSL(hsl);
          if (hsl.h > 0.18 && hsl.h < 0.5 && hsl.s > 0.12) {
            mat.color.set(recolor);
          }
        });
      });
    }

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    if (!size.y) return null;
    model.scale.setScalar(height / size.y);

    const box2 = new THREE.Box3().setFromObject(model);
    const center = box2.getCenter(new THREE.Vector3());
    model.position.set(x - center.x, FLOOR_Y - box2.min.y, z - center.z);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(model);
    return model;
  }

  // 把鼓组贴图里的薄荷绿改成胡桃木色，奶油鼓皮和黄铜镲片保留
  function recolorDrumTexture(model) {
    model.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!mat.map || !mat.map.image) return;
        const img = mat.map.image;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const px = data.data;

        for (let i = 0; i < px.length; i += 4) {
          const r = px[i] / 255;
          const g = px[i + 1] / 255;
          const b = px[i + 2] / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const l = (max + min) / 2;
          const s = max === min ? 0 : (l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min));
          if (s < 0.12) continue;

          let h;
          if (max === r) h = ((g - b) / (max - min)) % 6;
          else if (max === g) h = (b - r) / (max - min) + 2;
          else h = (r - g) / (max - min) + 4;
          h /= 6;
          if (h < 0) h += 1;

          if (h > 0.3 && h < 0.52) {
            const k = 0.5 + l * 0.92;
            px[i] = Math.min(255, 104 * k);
            px[i + 1] = Math.min(255, 68 * k);
            px[i + 2] = Math.min(255, 44 * k);
          } else if ((h < 0.04 || h > 0.96) && s > 0.35 && l > 0.25) {
            // 原来的珊瑚红坐凳 / 红色装饰，统一成深棕皮革
            const k = 0.55 + l * 0.55;
            px[i] = Math.min(255, 84 * k);
            px[i + 1] = Math.min(255, 52 * k);
            px[i + 2] = Math.min(255, 38 * k);
          }
        }

        ctx.putImageData(data, 0, 0);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.flipY = mat.map.flipY;
        tex.wrapS = mat.map.wrapS;
        tex.wrapT = mat.map.wrapT;
        mat.map = tex;
        mat.needsUpdate = true;
      });
    });
  }

  // 吉他：原模型 + 贴图改成墨绿
  function recolorGuitarTexture(model) {
    model.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!mat.map || !mat.map.image) return;
        const img = mat.map.image;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const px = data.data;

        for (let i = 0; i < px.length; i += 4) {
          const r = px[i] / 255;
          const g = px[i + 1] / 255;
          const b = px[i + 2] / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const l = (max + min) / 2;
          const s = max === min ? 0 : (l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min));
          if (s < 0.1) continue;

          let h;
          if (max === r) h = ((g - b) / (max - min)) % 6;
          else if (max === g) h = (b - r) / (max - min) + 2;
          else h = (r - g) / (max - min) + 4;
          h /= 6;
          if (h < 0) h += 1;

          if (h > 0.28 && h < 0.55) {
            const k = 0.55 + l * 0.62;
            px[i] = Math.min(255, 34 * k);
            px[i + 1] = Math.min(255, 74 * k);
            px[i + 2] = Math.min(255, 54 * k);
          }
        }

        ctx.putImageData(data, 0, 0);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.flipY = mat.map.flipY;
        tex.wrapS = mat.map.wrapS;
        tex.wrapT = mat.map.wrapT;
        mat.map = tex;
        mat.needsUpdate = true;
      });
    });
  }

  function loadModel(url, opts) {
    return new Promise((resolve) => {
      loader.load(
        url,
        (gltf) => {
          const model = fitModel(gltf.scene, opts);
          if (model && opts.hotspot) registerHotspot(model, opts.hotspot);
          resolve(model);
        },
        undefined,
        (error) => {
          console.warn("模型加载失败：" + url, error);
          resolve(null);
        }
      );
    });
  }

  // 自行车：bike1 的导出轴向有问题，先用原来的 bike.glb
  modelsToLoad.push(loadModel("./assets/models/bike.glb", {
    height: 1.3, x: 2.55, z: 1.75, rotY: -1.15, hotspot: "bike"
  }));

  // 吉他：原模型 + 墨绿贴图
  modelsToLoad.push(new Promise((resolve) => {
    loader.load(
      "./assets/models/guitar.glb",
      (gltf) => {
        const model = gltf.scene;
        recolorGuitarTexture(model);
        const fitted = fitModel(model, {
          height: 1.25, x: -3.2, z: 1.95, rotY: 0.7
        });
        if (fitted) registerHotspot(fitted, "guitar");
        resolve(fitted);
      },
      undefined,
      () => resolve(null)
    );
  }));

  // 架子鼓：原模型 + 贴图换色（薄荷绿 → 胡桃木）
  modelsToLoad.push(new Promise((resolve) => {
    loader.load(
      "./assets/models/drums.glb",
      (gltf) => {
        const model = gltf.scene;
        recolorDrumTexture(model);
        const fitted = fitModel(model, {
          height: 1.24, x: -2.62, z: -1.72, rotY: 0.8
        });
        if (fitted) registerHotspot(fitted, "drums");
        resolve(fitted);
      },
      undefined,
      () => resolve(null)
    );
  }));

  // 落地灯：只取 furniture.glb 里名字带 lamp 的部件
  modelsToLoad.push(new Promise((resolve) => {
    loader.load(
      "./assets/models/furniture.glb",
      (gltf) => {
        const furniture = gltf.scene;
        furniture.scale.setScalar(0.28);
        let found = false;
        furniture.traverse((child) => {
          if (child.isMesh) {
            const isLamp = /lamp/i.test(child.name);
            child.visible = isLamp;
            if (isLamp) {
              found = true;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          }
        });
        if (!found) return resolve(null);

        furniture.updateMatrixWorld(true);
        const lampBox = new THREE.Box3();
        furniture.traverse((child) => {
          if (child.isMesh && child.visible) lampBox.union(new THREE.Box3().setFromObject(child));
        });
        if (lampBox.isEmpty()) return resolve(null);

        const center = lampBox.getCenter(new THREE.Vector3());
        furniture.position.set(0.45 - center.x, FLOOR_Y - lampBox.min.y, -2.15 - center.z);
        scene.add(furniture);
        resolve(furniture);
      },
      undefined,
      () => resolve(null)
    );
  }));

  /* ---------------- 灰尘 ---------------- */
  const dustCount = 180;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustSeeds = [];
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = -3.8 + Math.random() * 7.6;
    dustPositions[i * 3 + 1] = 0.2 + Math.random() * 3.0;
    dustPositions[i * 3 + 2] = -2.7 + Math.random() * 5.2;
    dustSeeds.push(Math.random() * Math.PI * 2);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

  const dotTex = canvasTexture(64, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,248,232,0.95)");
    g.addColorStop(0.4, "rgba(255,244,222,0.45)");
    g.addColorStop(1, "rgba(255,244,222,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    map: dotTex,
    size: 0.055,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    sizeAttenuation: true,
    color: 0xfff3dd
  }));
  scene.add(dust);

  /* ---------------- 相机状态 ---------------- */
  const homeTarget = HOME_TARGET.clone();
  const goalTarget = homeTarget.clone();
  const currentTarget = homeTarget.clone();
  let theta = BASE_THETA;
  let phi = BASE_PHI;
  let zoom = 1;
  let zoomGoal = 1;

  const direction = new THREE.Vector3();
  const goalPos = new THREE.Vector3();

  function updateGoalPosition() {
    direction.set(
      Math.sin(theta) * Math.sin(phi),
      Math.cos(phi),
      Math.cos(theta) * Math.sin(phi)
    );
  }

  const api = {
    focused: null,
    onSelect: null,
    onClose: null,
    onLetter: null,
    onCrate: null,
    onPlaylist: null,
    onMonitor: null,
    onMonitorDouble: null,
    onKeyboard: null,
    onNotebook: null,
    onKnight: null,
    onCamera: null,
    onBirds: null,
    onBirdbook: null,
    onMovies: null,
    onMap: null,
    onLibrary: null,
    onPoster: null,
    onReady: null,
    reset,
    focus,
    exitFocus,
    getScreenRect,
    snap,
    setScreenImage,
    screenBlack,
    setFrameImage,
    setMapDrawing,
    setPosterImage
  };

  const screenTexture = parts.monitor?.userData?.screenTexture;

  function paintScreen(draw) {
    if (!screenTexture) return;
    const canvas = screenTexture.image;
    const ctx = canvas.getContext("2d");
    draw(ctx, canvas.width, canvas.height);
    screenTexture.needsUpdate = true;
  }

  function setScreenImage(img) {
    paintScreen((ctx, w, h) => {
      if (!img || !img.complete || !img.naturalWidth) {
        ctx.fillStyle = "#0b0b0b";
        ctx.fillRect(0, 0, w, h);
        return;
      }
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = w / h;
      let sx = 0;
      let sy = 0;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;
      if (ir > cr) {
        sw = sh * cr;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = sw / cr;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    });
  }

  function screenBlack() {
    paintScreen((ctx, w, h) => {
      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, w, h);
    });
  }

  const frameTexture = parts.frameTexture;

  function setFrameImage(img) {
    if (!frameTexture || !img || !img.complete || !img.naturalWidth) return;
    const canvas = frameTexture.image;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = w / h;
    let sx = 0;
    let sy = 0;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    if (ir > cr) {
      sw = sh * cr;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = sw / cr;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    frameTexture.needsUpdate = true;
  }

  const defaultShot = new Image();
  defaultShot.onload = () => setFrameImage(defaultShot);
  defaultShot.src = "./assets/camera/c2.jpg";

  let mapOverlay = null;

  function setMapDrawing(url) {
    if (!url) {
      if (mapOverlay) mapOverlay.visible = false;
      return;
    }
    if (!mapOverlay) {
      mapOverlay = new THREE.Mesh(
        new THREE.PlaneGeometry(1.56, 1.1),
        new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })
      );
      mapOverlay.position.set(-3.762, 2.12, 0.62);
      mapOverlay.rotation.y = Math.PI / 2;
      scene.add(mapOverlay);
    }
    const texture = new THREE.TextureLoader().load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    mapOverlay.material.map = texture;
    mapOverlay.material.needsUpdate = true;
    mapOverlay.visible = true;
  }

  try {
    const savedMap = localStorage.getItem("alw.mapDrawing");
    if (savedMap) setMapDrawing(savedMap);
  } catch (error) {
    // ignore
  }

  function setPosterImage(img) {
    if (!parts.poster || !img || !img.complete || !img.naturalWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 1150;
    const ctx = canvas.getContext("2d");
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = canvas.width / canvas.height;
    let sx = 0;
    let sy = 0;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    if (ir > cr) {
      sw = sh * cr;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = sw / cr;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    parts.poster.material.map = texture;
    parts.poster.material.needsUpdate = true;
  }

  let savedView = null;
  const HOVER_LIFT = 0.02;
  const FOCUS_LIFT = 0.05;

  function reset() {
    savedView = null;
    api.focused = null;
    goalTarget.copy(homeTarget);
    zoomGoal = 1;
    theta += THREE.MathUtils.euclideanModulo(BASE_THETA - theta + Math.PI, Math.PI * 2) - Math.PI;
    phi = BASE_PHI;
    liftState.forEach((state) => { state.target = 0; });
  }

  function focus(key) {
    const target = FOCUS[key];
    if (!target) return;

    if (!savedView) {
      savedView = {
        target: goalTarget.clone(),
        zoom: zoomGoal,
        theta,
        phi
      };
    }

    api.focused = key;
    goalTarget.set(target.target[0], target.target[1], target.target[2]);
    zoomGoal = target.zoom;

    // 竖屏时给底部留位置
    const aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight);
    if (aspect < 0.85) goalTarget.y -= 0.35;

    liftState.forEach((state, object) => {
      if (object.userData.noLift) return;
      state.target = object.userData.hotspot === key ? FOCUS_LIFT : 0;
    });
  }

  function exitFocus() {
    api.focused = null;
    liftState.forEach((state) => { state.target = 0; });
    if (!savedView) return;
    goalTarget.copy(savedView.target);
    zoomGoal = savedView.zoom;
    theta = savedView.theta;
    phi = savedView.phi;
    savedView = null;
  }

  const corner = new THREE.Vector3();

  function getScreenRect(key) {
    const object = hotspotByKey.get(key);
    if (!object) return null;

    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return null;

    const width = renderer.domElement.clientWidth || window.innerWidth;
    const height = renderer.domElement.clientHeight || window.innerHeight;
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;

    for (let i = 0; i < 8; i++) {
      corner.set(
        i & 1 ? box.max.x : box.min.x,
        i & 2 ? box.max.y : box.min.y,
        i & 4 ? box.max.z : box.min.z
      ).project(camera);

      const x = (corner.x * 0.5 + 0.5) * width;
      const y = (-corner.y * 0.5 + 0.5) * height;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }

    if (!Number.isFinite(left) || right < 0 || left > width || bottom < 0 || top > height) {
      return null;
    }

    return { left, right, top, bottom, cx: (left + right) / 2, cy: (top + bottom) / 2 };
  }

  function applyHover(key) {
    liftState.forEach((state, object) => {
      if (object.userData.noLift) { state.target = 0; return; }
      const objectKey = object.userData.hotspot;
      if (objectKey === key) state.target = HOVER_LIFT;
      else if (objectKey !== api.focused) state.target = 0;
    });
  }

  // 调试用：立刻到位，不做缓动
  function snap() {
    updateGoalPosition();
    liftState.forEach((state, object) => {
      object.position.y = state.baseY + state.target;
    });
    camera.position.copy(goalTarget).addScaledVector(direction, ORBIT_RADIUS);
    currentTarget.copy(goalTarget);
    camera.lookAt(currentTarget);
    camera.zoom = zoomGoal;
    camera.updateProjectionMatrix();
  }

  /* ---------------- 交互 ---------------- */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const pointers = new Map();
  let dragging = false;
  let dragMoved = false;
  let lastX = 0;
  let lastY = 0;
  let pinchStart = 0;
  let pinchZoom = 1;
  let hovered = null;
  let longPressTimer = 0;
  let longPressFired = false;
  let pressOrigin = null;

  function toPointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hotspotObjects, true);
    if (!hits.length) return null;
    let node = hits[0].object;
    while (node && !node.userData.hotspot) node = node.parent;
    return node ? node.userData.hotspot : null;
  }

  function pointerDistance() {
    const list = Array.from(pointers.values());
    if (list.length < 2) return 0;
    return Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
  }

  renderer.domElement.addEventListener("dblclick", () => {
    if (pick() === "monitor") api.onMonitorDouble?.();
  });

  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    renderer.domElement.setPointerCapture?.(event.pointerId);

    if (pointers.size === 1) {
      dragging = true;
      dragMoved = false;
      lastX = event.clientX;
      lastY = event.clientY;
      pressOrigin = { x: event.clientX, y: event.clientY };
      longPressFired = false;
      window.clearTimeout(longPressTimer);
      toPointer(event);
      if (pick() === "monitor") {
        longPressTimer = window.setTimeout(() => {
          longPressFired = true;
          api.onMonitorDouble?.();
        }, 650);
      }
    } else if (pointers.size === 2) {
      dragging = false;
      dragMoved = true;
      pinchStart = pointerDistance();
      pinchZoom = zoomGoal;
    }
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId) && event.pointerType === "mouse") {
      // 鼠标悬停，未按下
      toPointer(event);
      const key = pick();
      if (key !== hovered) {
        hovered = key;
        renderer.domElement.style.cursor = key ? "pointer" : "grab";
        applyHover(key);
      }
      return;
    }

    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pressOrigin && Math.hypot(event.clientX - pressOrigin.x, event.clientY - pressOrigin.y) > 12) {
      window.clearTimeout(longPressTimer);
      pressOrigin = null;
    }

    if (pointers.size >= 2) {
      const dist = pointerDistance();
      if (pinchStart > 0) {
        zoomGoal = THREE.MathUtils.clamp(pinchZoom * (dist / pinchStart), 0.85, 4.5);
      }
      return;
    }

    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    if (Math.abs(dx) + Math.abs(dy) > 2) dragMoved = true;
    if (!dragMoved) return;

    theta = THREE.MathUtils.clamp(
      theta - dx * 0.0045,
      BASE_THETA - THETA_RANGE,
      BASE_THETA + THETA_RANGE
    );
    phi = THREE.MathUtils.clamp(phi + dy * 0.0035, PHI_MIN, PHI_MAX);
  });

  function endPointer(event) {
    pointers.delete(event.pointerId);
    if (pointers.size === 0) {
      dragging = false;
      pinchStart = 0;
    } else if (pointers.size === 1) {
      const rest = Array.from(pointers.values())[0];
      lastX = rest.x;
      lastY = rest.y;
      dragging = true;
      pinchStart = 0;
    }
  }

  renderer.domElement.addEventListener("pointerup", (event) => {
    window.clearTimeout(longPressTimer);
    pressOrigin = null;
    if (longPressFired) {
      longPressFired = false;
      endPointer(event);
      return;
    }
    const wasDrag = dragMoved;
    endPointer(event);
    if (wasDrag || pointers.size > 0) return;

    toPointer(event);
    const key = pick();
    if (key) {
      if (key === "letter") {
        focus(key);
        api.onLetter?.();
      } else if (key === "crate") {
        api.onCrate?.();
      } else if (key === "music") {
        api.onPlaylist?.();
      } else if (key === "monitor") {
        focus(key);
        api.onMonitor?.();
      } else if (key === "keyboard") {
        focus(key);
        api.onKeyboard?.();
      } else if (key === "notebook") {
        focus(key);
        api.onNotebook?.();
      } else if (key === "knight") {
        api.onKnight?.();
      } else if (key === "movies") {
        api.onMovies?.();
      } else if (key === "library") {
        focus("library");
        api.onLibrary?.();
      } else if (key === "shelf") {
        focus("shelf");
      } else if (key === "map") {
        focus("map");
        api.onMap?.();
      } else if (key === "poster") {
        focus("poster");
        api.onPoster?.();
      } else if (key === "cameraObj") {
        api.onCamera?.();
      } else if (key === "telescope") {
        focus("telescope");
        api.onSelect?.("telescope", config.hotspots.telescope);
      } else if (key === "birdbook") {
        api.onBirdbook?.();
      } else {
        focus(key);
        api.onSelect?.(key, config.hotspots[key]);
      }
      return;
    }

    if (api.focused) {
      exitFocus();
    }
    api.onClose?.();
  });

  renderer.domElement.addEventListener("pointercancel", endPointer);

  renderer.domElement.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomGoal = THREE.MathUtils.clamp(
      zoomGoal * Math.exp(-event.deltaY * 0.0012),
      0.85,
      4.5
    );
  }, { passive: false });

  renderer.domElement.addEventListener("pointerleave", () => {
    hovered = null;
    renderer.domElement.style.cursor = "grab";
    applyHover(null);
  });

  /* ---------------- 尺寸 ---------------- */
  function resize() {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;

    // 竖屏时适当靠近一点，别让房间缩成一小块
    const viewHeight = aspect < 0.85
      ? Math.max(11.2, 8.2 / aspect)
      : Math.max(9.7, 9.2 / aspect);
    camera.left = -viewHeight * aspect / 2;
    camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  window.addEventListener("resize", resize);
  resize();

  /* ---------------- 主循环 ---------------- */
  let lastTime = performance.now() / 1000;

  function animate(now) {
    requestAnimationFrame(animate);
    const time = (now ?? performance.now()) / 1000;
    const dt = Math.min(Math.max(time - lastTime, 0), 0.05);
    lastTime = time;
    const t = time;

    updateGoalPosition();
    goalPos.copy(goalTarget).addScaledVector(direction, ORBIT_RADIUS);
    camera.position.lerp(goalPos, 0.09);
    currentTarget.lerp(goalTarget, 0.1);
    camera.lookAt(currentTarget);

    if (Math.abs(camera.zoom - zoomGoal) > 0.0005) {
      camera.zoom += (zoomGoal - camera.zoom) * 0.09;
      camera.updateProjectionMatrix();
    }

    // 物件轻微的浮起 / 落下
    liftState.forEach((state, object) => {
      if (object.userData.noLift) return;
      const want = state.baseY + state.target;
      if (Math.abs(object.position.y - want) > 0.0004) {
        object.position.y += (want - object.position.y) * Math.min(1, dt * 14);
      }
    });

    // 唱盘慢慢转
    if (parts.music?.userData.spin) {
      parts.music.userData.spin.forEach((obj) => {
        obj.rotation.y += dt * 2.2;
      });
    }

    // 灰尘
    const attr = dustGeo.getAttribute("position");
    for (let i = 0; i < dustCount; i++) {
      let y = attr.getY(i) + dt * 0.022;
      if (y > 3.3) y = 0.15;
      attr.setY(i, y);
      const s = dustSeeds[i];
      attr.setX(i, attr.getX(i) + Math.sin(t * 0.35 + s) * 0.0006);
      attr.setZ(i, attr.getZ(i) + Math.cos(t * 0.28 + s) * 0.0005);
    }
    attr.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  /* 模型加载完（或超时）再报 ready */
  Promise.allSettled(modelsToLoad).then(() => {
    api.onReady?.();
  });
  setTimeout(() => api.onReady?.(), 2500);

  api.dispose = () => {
    ro.disconnect();
    window.removeEventListener("resize", resize);
    renderer.dispose();
  };

  return api;
}
