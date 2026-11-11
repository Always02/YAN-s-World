import * as THREE from "three";
import {
  C, FLOOR_Y, add, rbox, group, cylGeo, sphereGeo, solid, glassy,
  canvasTexture, softShadow, castAll
} from "./lib.js?v=20261111e";
import {
  rugArt, screenArt, posterArt, cardNightHeron, cardSunflower,
  cardTequila, cardBebop, cardAerial, noteSeeds, sleeveArt, postcardArt, postcardForest
} from "./art.js?v=20261111e";

/* ==================================================================
   小工具
================================================================== */

function latheGeo(points, segments = 28) {
  return new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segments
  );
}

function leafGeo() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.075, 0.04, 0.085, 0.2, 0.028, 0.32);
  s.bezierCurveTo(0.008, 0.335, -0.008, 0.335, -0.028, 0.32);
  s.bezierCurveTo(-0.085, 0.2, -0.075, 0.04, 0, 0);
  return new THREE.ShapeGeometry(s, 14);
}

function planeWithTexture(parent, w, h, tex, pos, rot = [0, 0, 0], opts = {}) {
  const material = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: opts.roughness ?? 0.95,
    metalness: 0,
    transparent: opts.transparent ?? false,
    side: opts.doubleSide ? THREE.DoubleSide : THREE.FrontSide
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function blob(parent, size, opacity, pos) {
  const s = softShadow(size, opacity);
  s.position.set(pos[0], FLOOR_Y + 0.008, pos[2]);
  parent.add(s);
  return s;
}

/* ==================================================================
   沙发
================================================================== */
function makeSofa() {
  const g = new THREE.Group();
  const fabric = solid(C.sage, 0.98);
  const fabricDark = solid(C.olive, 0.98);
  const cushion = solid(C.cream, 1);
  const wood = solid(C.woodDark, 0.88);

  // 细木腿
  for (const x of [-0.34, 0.34]) {
    for (const z of [-0.88, 0.88]) {
      add(g, cylGeo(0.026, 0.032, 0.2, 10), wood, [x, 0.1, z]);
    }
  }

  // 木框
  rbox(g, 0.84, 0.15, 2.04, solid(C.wood, 0.88), [0, 0.27, 0], [0, 0, 0], 0.03);

  // 座垫（中间补一条，消掉缝）
  for (const z of [-0.5, 0.5]) {
    rbox(g, 0.8, 0.2, 0.94, fabric, [0.02, 0.44, z], [0, 0, 0], 0.08);
  }
  rbox(g, 0.8, 0.2, 0.09, fabric, [0.02, 0.44, 0], [0, 0, 0], 0.03);

  // 靠背：两块靠垫接得更紧
  rbox(g, 0.16, 0.74, 2.04, fabricDark, [-0.35, 0.72, 0], [0, 0, 0], 0.07);
  for (const z of [-0.51, 0.51]) {
    rbox(g, 0.15, 0.42, 0.98, fabric, [-0.24, 0.74, z], [0, 0, 0.1], 0.07);
  }

  // 扶手
  for (const z of [-1.0, 1.0]) {
    rbox(g, 0.8, 0.3, 0.13, fabricDark, [0.02, 0.6, z], [0, 0, 0], 0.055);
    rbox(g, 0.8, 0.06, 0.14, solid(C.wood, 0.85), [0.02, 0.46, z], [0, 0, 0], 0.03);
  }

  // 一个靠枕
  // 一个靠枕
  const pillow = rbox(g, 0.16, 0.36, 0.46, cushion, [-0.06, 0.74, 0.16], [0, 0.14, 0.34], 0.09);
  pillow.castShadow = true;

  castAll(g);
  return g;
}

/* ==================================================================
   茶几
================================================================== */
function makeCoffeeTable() {
  const g = new THREE.Group();
  const wood = solid(C.wood, 0.82);

  // 纵向更长：和沙发平行
  rbox(g, 0.86, 0.07, 1.3, wood, [0, 0.44, 0], [0, 0, 0], 0.03);
  rbox(g, 0.66, 0.03, 1.06, wood, [0, 0.13, 0], [0, 0, 0], 0.015);

  const legGeo = cylGeo(0.026, 0.034, 0.405, 12);
  for (const x of [-0.33, 0.33]) {
    for (const z of [-0.55, 0.55]) {
      add(g, legGeo, solid(C.woodDark, 0.85), [x, 0.2025, z]);
    }
  }
  castAll(g);
  return g;
}

/* ==================================================================
   圆边几
================================================================== */
function makeSideTable() {
  const g = new THREE.Group();
  const wood = solid(C.woodDark, 0.85);

  add(g, cylGeo(0.32, 0.32, 0.045, 32), wood, [0, 0.56, 0]);
  add(g, cylGeo(0.305, 0.305, 0.015, 32), solid(C.wood, 0.85), [0, 0.587, 0]);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    add(g, cylGeo(0.019, 0.023, 0.54, 10), wood, [Math.cos(a) * 0.2, 0.27, Math.sin(a) * 0.2]);
  }
  add(g, new THREE.TorusGeometry(0.2, 0.012, 8, 28), wood, [0, 0.18, 0], [Math.PI / 2, 0, 0]);
  castAll(g);
  return g;
}

/* ==================================================================
   书堆
================================================================== */
function makeBooks(count, w = 0.19, h = 0.035, d = 0.26, palette = [C.cream, C.clay, C.teal, C.mustard]) {
  const g = new THREE.Group();
  let y = 0;
  for (let i = 0; i < count; i++) {
    const hh = h * (0.8 + Math.random() * 0.5);
    const book = rbox(g, w * (0.9 + Math.random() * 0.12), hh, d, solid(palette[i % palette.length], 0.95),
      [(Math.random() - 0.5) * 0.02, y + hh / 2, 0], [0, (Math.random() - 0.5) * 0.12, 0], 0.006);
    book.userData.isBook = true;
    y += hh;
  }
  return g;
}

/* ==================================================================
   桌面 + 显示器 + 键盘 + 无人机 + 相机
================================================================== */
function makeMonitor() {
  const g = new THREE.Group();
  const dark = solid(C.coal, 0.5, 0.25);
  const screenTex = canvasTexture(1024, 576, screenArt);

  // 显示器：底座坐在桌面上
  rbox(g, 0.52, 0.025, 0.28, dark, [0, 0.0125, 0], [0, 0, 0], 0.01);
  rbox(g, 0.075, 0.23, 0.075, dark, [0, 0.14, -0.03], [0, 0, 0], 0.01);
  rbox(g, 1.02, 0.6, 0.055, dark, [0, 0.56, -0.06], [0, 0, 0], 0.012);
  planeWithTexture(g, 0.955, 0.535, screenTex, [0, 0.56, -0.022], [0, 0, 0], { roughness: 0.35 });

  // 屏幕反光条
  const sheen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 })
  );
  sheen.position.set(0, 0.74, -0.028);
  g.add(sheen);

  g.userData.screenTexture = screenTex;

  return g;
}

function makeKeyboard() {
  const g = new THREE.Group();
  const base = solid("#2b2b2d", 0.6);
  const keyMat = solid("#3d3d40", 0.75);

  rbox(g, 0.62, 0.022, 0.21, base, [0, 0.011, 0], [0, 0, 0], 0.012);

  const keyGeo = new THREE.BoxGeometry(0.028, 0.011, 0.028);
  const cols = 13;
  const rows = 4;
  const inst = new THREE.InstancedMesh(keyGeo, keyMat, cols * rows + 1);
  inst.castShadow = true;
  inst.receiveShadow = true;
  const dummy = new THREE.Object3D();
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dummy.position.set(-0.255 + c * 0.0425, 0.028, -0.068 + r * 0.043);
      dummy.updateMatrix();
      inst.setMatrixAt(idx++, dummy.matrix);
    }
  }
  dummy.position.set(-0.02, 0.028, 0.075);
  dummy.scale.set(6.2, 1, 1);
  dummy.updateMatrix();
  inst.setMatrixAt(idx++, dummy.matrix);
  g.add(inst);

  // 鼠标：更像个人体工学鼠标
  const mouse = new THREE.Group();
  const shell = add(mouse, sphereGeo(0.045, 18, 14), solid("#2f2f31", 0.5), [0, 0.02, 0]);
  shell.scale.set(1, 0.55, 1.45);
  add(mouse, cylGeo(0.008, 0.008, 0.012, 10), solid("#55555a", 0.6), [0, 0.047, 0.012], [Math.PI / 2, 0, 0]);
  mouse.position.set(0.42, 0.013, 0.02);
  g.add(mouse);

  return g;
}

function makeDroneModel() {
  const g = new THREE.Group();
  const body = solid("#3a3a3c", 0.5, 0.3);
  const accent = solid("#c96f4e", 0.6);

  rbox(g, 0.14, 0.045, 0.11, body, [0, 0.03, 0], [0, 0, 0], 0.02);
  rbox(g, 0.05, 0.02, 0.05, accent, [0, 0.055, 0.01], [0, 0, 0], 0.008);

  const armGeo = cylGeo(0.008, 0.008, 0.14, 8);
  const motorGeo = cylGeo(0.016, 0.018, 0.03, 12);
  const propGeo = new THREE.BoxGeometry(0.09, 0.002, 0.012);

  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const x = Math.cos(a) * 0.1;
    const z = Math.sin(a) * 0.1;
    const arm = add(g, armGeo, body, [x * 0.55, 0.03, z * 0.55], [Math.PI / 2, -a, 0]);
    arm.rotation.set(Math.PI / 2, 0, 0);
    arm.rotation.y = -a;
    add(g, motorGeo, body, [x, 0.05, z]);
    const prop = add(g, propGeo, solid("#2a2a2c", 0.6), [x, 0.07, z], [0, a, 0]);
    prop.scale.setScalar(0.9);
  }

  // 起落架
  for (const z of [-0.04, 0.04]) {
    add(g, cylGeo(0.004, 0.004, 0.06, 6), body, [0, 0.005, z]);
  }
  castAll(g);
  return g;
}

function makeCamera() {
  const g = new THREE.Group();
  const bodyMat = solid("#2e2c2a", 0.55, 0.15);
  const silver = solid("#b9b2a4", 0.5, 0.4);

  rbox(g, 0.16, 0.1, 0.07, bodyMat, [0, 0.05, 0], [0, 0, 0], 0.012);
  rbox(g, 0.05, 0.03, 0.075, bodyMat, [-0.03, 0.11, 0], [0, 0, 0], 0.008);
  add(g, cylGeo(0.032, 0.036, 0.05, 20), bodyMat, [0.06, 0.05, 0.02], [Math.PI / 2, 0, 0]);
  add(g, cylGeo(0.03, 0.03, 0.012, 20), silver, [0.06, 0.05, 0.05], [Math.PI / 2, 0, 0]);
  add(g, cylGeo(0.024, 0.024, 0.004, 20), solid("#1a1c22", 0.15, 0.6), [0.06, 0.05, 0.058], [Math.PI / 2, 0, 0]);
  rbox(g, 0.03, 0.012, 0.02, silver, [-0.055, 0.105, 0], [0, 0, 0], 0.004);

  // 背带
  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(0.085, 0.005, 6, 24, Math.PI * 1.3),
    solid("#6b5a45", 0.9)
  );
  strap.position.set(0.0, 0.02, -0.04);
  strap.rotation.set(0, 0.3, 0.4);
  g.add(strap);
  castAll(g);
  return g;
}

function makeBinoculars() {
  const g = new THREE.Group();
  const m = solid("#4b5244", 0.65);
  for (const x of [-0.035, 0.035]) {
    add(g, cylGeo(0.028, 0.032, 0.11, 16), m, [x, 0.055, 0], [Math.PI / 2, 0, 0]);
    add(g, cylGeo(0.032, 0.032, 0.01, 16), solid("#23262a", 0.3, 0.4), [x, 0.055, 0.058], [Math.PI / 2, 0, 0]);
  }
  rbox(g, 0.05, 0.025, 0.04, m, [0, 0.06, -0.01], [0, 0, 0], 0.006);
  castAll(g);
  return g;
}

function makeDeskRig() {
  const g = new THREE.Group();
  const topMat = solid(C.woodLight, 0.75);
  const legMat = solid(C.woodDark, 0.85);

  rbox(g, 2.2, 0.09, 1.0, topMat, [0, 0.99, 0], [0, 0, 0], 0.03);
  for (const x of [-1.0, 1.0]) {
    for (const z of [-0.4, 0.4]) {
      add(g, new THREE.BoxGeometry(0.07, 0.95, 0.07), legMat, [x, 0.475, z]);
    }
  }

  // 右侧抽屉柜
  rbox(g, 0.36, 0.6, 0.84, solid(C.wood, 0.85), [0.7, 0.33, 0], [0, 0, 0], 0.02);
  for (let i = 0; i < 3; i++) {
    rbox(g, 0.32, 0.15, 0.02, solid(C.woodLight, 0.8), [0.7, 0.16 + i * 0.19, 0.425], [0, 0, 0], 0.006);
    add(g, cylGeo(0.012, 0.012, 0.02, 10), solid(C.woodDark, 0.7), [0.7, 0.16 + i * 0.19, 0.44], [Math.PI / 2, 0, 0]);
  }

  const monitor = makeMonitor();
  monitor.position.set(-0.12, 1.035, -0.18);
  g.add(monitor);

  const keyboard = makeKeyboard();
  keyboard.position.set(-0.1, 1.035, 0.16);
  g.add(keyboard);

  g.userData.monitor = monitor;
  g.userData.keyboard = keyboard;

  // 鼠标垫 + 鼠标
  rbox(g, 0.3, 0.008, 0.22, solid("#b9b2a2", 0.95), [0.38, 1.04, 0.17], [0, 0, 0], 0.01);
  rbox(g, 0.055, 0.026, 0.085, solid("#efece4", 0.6), [0.38, 1.06, 0.17], [0, 0, 0], 0.012);

  // 马克杯
  const mug = new THREE.Group();
  add(mug, cylGeo(0.058, 0.05, 0.105, 24), solid("#e7ded0", 0.7), [0, 0.052, 0]);
  add(mug, cylGeo(0.052, 0.052, 0.085, 24), solid("#6a4a33", 0.6), [0, 0.052, 0]);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.008, 8, 18, Math.PI), solid("#e7ded0", 0.7));
  handle.position.set(0.062, 0.055, 0);
  handle.rotation.z = -Math.PI / 2;
  mug.add(handle);
  mug.position.set(0.72, 1.035, 0.2);
  g.add(mug);
  g.userData.mug = mug;

  // 笔记本 + 笔
  const notebook = rbox(g, 0.34, 0.018, 0.24, solid("#e9e3d4", 0.95), [-0.8, 1.043, 0.16], [0, 0.12, 0], 0.006);
  add(g, cylGeo(0.006, 0.006, 0.17, 8), solid(C.ink, 0.6), [-0.76, 1.058, 0.2], [0, 0.5, Math.PI / 2]);
  g.userData.notebook = notebook;

  // 小盆栽：往右挪到显示器左边，叶子重做
  const pot = new THREE.Group();
  add(pot, latheGeo([[0, 0], [0.06, 0], [0.07, 0.03], [0.065, 0.09]]), solid(C.cream, 0.9), [0, 0, 0]);
  add(pot, cylGeo(0.06, 0.06, 0.01, 16), solid("#5b4a38", 1), [0, 0.088, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const stem = new THREE.Group();
    stem.rotation.y = a;
    stem.rotation.x = 0.18 + (i % 3) * 0.08;
    const len = 0.09 + (i % 4) * 0.02;
    add(stem, cylGeo(0.004, 0.005, len, 6), solid("#5f7a55", 0.9), [0, len / 2, 0]);
    const leaf = new THREE.Mesh(leafGeo(), solid(i % 2 ? C.leaf : C.leafDark, 0.9));
    leaf.scale.setScalar(0.2 + (i % 3) * 0.04);
    leaf.position.set(0, len, 0);
    leaf.rotation.set(-1.0, 0, (i - 4) * 0.1);
    leaf.castShadow = true;
    stem.add(leaf);
    pot.add(stem);
  }
  pot.position.set(-0.68, 1.035, -0.12);
  pot.scale.setScalar(1.1);
  g.add(pot);

  castAll(g);
  return g;
}

function makeChair() {
  const g = new THREE.Group();
  const wood = solid(C.woodDark, 0.85);
  const cushion = solid(C.clay, 0.95);

  rbox(g, 0.5, 0.07, 0.47, cushion, [0, 0.5, 0], [0, 0, 0], 0.03);
  for (const x of [-0.2, 0.2]) {
    for (const z of [-0.19, 0.19]) {
      add(g, cylGeo(0.022, 0.026, 0.47, 10), wood, [x, 0.235, z]);
    }
  }
  // 靠背
  for (const x of [-0.19, 0.19]) {
    add(g, cylGeo(0.02, 0.022, 0.42, 10), wood, [x, 0.72, 0.2]);
  }
  rbox(g, 0.46, 0.26, 0.055, cushion, [0, 0.88, 0.2], [0.08, 0, 0], 0.03);

  castAll(g);
  return g;
}

/* ==================================================================
   毛毡板
================================================================== */
function makeCorkBoard() {
  const g = new THREE.Group();
  const wood = solid(C.wood, 0.85);
  const feltTex = canvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = "#a89c84";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 6000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.18)" : "rgba(70,60,46,0.26)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  });

  const feltMaterial = new THREE.MeshStandardMaterial({ map: feltTex, roughness: 1 });
  rbox(g, 2.16, 1.24, 0.03, feltMaterial, [0, 0, 0], [0, 0, 0], 0.1);

  const frameMat = solid("#b08a62", 0.82);
  rbox(g, 2.3, 0.09, 0.1, frameMat, [0, 0.66, 0.03], [0, 0, 0], 0.012);
  rbox(g, 2.3, 0.09, 0.1, frameMat, [0, -0.66, 0.03], [0, 0, 0], 0.012);
  rbox(g, 0.09, 1.32, 0.1, frameMat, [-1.12, 0, 0.03], [0, 0, 0], 0.012);
  rbox(g, 0.09, 1.32, 0.1, frameMat, [1.12, 0, 0.03], [0, 0, 0], 0.012);

  // 卡片后面的薄影，让它们从毛毡上"浮"起来
  function cardShadow(w, h, x, y) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w + 0.02, h + 0.02),
      new THREE.MeshBasicMaterial({ color: 0x4a4034, transparent: true, opacity: 0.16, depthWrite: false })
    );
    m.position.set(x + 0.008, y - 0.008, 0.032);
    g.add(m);
  }

  const cards = [
    { tex: canvasTexture(512, 400, cardNightHeron), w: 0.5, h: 0.39, x: -0.68, y: 0.26, r: -0.07 },
    { tex: canvasTexture(400, 480, cardSunflower), w: 0.33, h: 0.4, x: -0.22, y: 0.3, r: 0.05 },
    { tex: canvasTexture(420, 520, cardTequila), w: 0.33, h: 0.42, x: -0.2, y: -0.31, r: 0.06 },
    { tex: canvasTexture(420, 420, cardBebop), w: 0.37, h: 0.37, x: 0.6, y: 0.29, r: 0.08 },
    { tex: canvasTexture(420, 320, postcardForest), w: 0.5, h: 0.38, x: 0.65, y: -0.24, r: -0.06 },
    { tex: canvasTexture(420, 380, noteSeeds), w: 0.3, h: 0.28, x: 0.22, y: -0.02, r: 0.12 },
    { tex: canvasTexture(440, 300, postcardArt), w: 0.46, h: 0.31, x: -0.65, y: -0.3, r: -0.05 }
  ];

  for (const card of cards) {
    cardShadow(card.w, card.h, card.x, card.y);
    const mesh = planeWithTexture(g, card.w, card.h, card.tex, [card.x, card.y, 0.036], [0, 0, card.r]);
    mesh.castShadow = true;

    const tape = new THREE.Mesh(
      new THREE.PlaneGeometry(card.w * 0.28, 0.045),
      new THREE.MeshStandardMaterial({ color: "#e8d9b8", transparent: true, opacity: 0.85, roughness: 1 })
    );
    tape.position.set(card.x + card.w * 0.22, card.y + card.h * 0.46, 0.042);
    tape.rotation.z = card.r - 0.2;
    g.add(tape);

    add(g, sphereGeo(0.016, 10, 8), solid("#b87558", 0.5), [card.x - card.w * 0.2, card.y + card.h * 0.45, 0.052]);
  }

  castAll(g);
  return g;
}

/* ==================================================================
   唱片柜 + 唱机 + 音箱
================================================================== */
function makeConsole() {
  const g = new THREE.Group();
  g.userData.spin = [];

  const body = solid(C.wood, 0.85);
  const top = solid(C.woodLight, 0.75);

  rbox(g, 1.36, 0.5, 0.5, body, [0, 0.32, 0], [0, 0, 0], 0.02);
  rbox(g, 1.4, 0.05, 0.54, top, [0, 0.59, 0], [0, 0, 0], 0.012);
  for (const x of [-0.6, 0.6]) {
    for (const z of [-0.2, 0.2]) {
      add(g, cylGeo(0.022, 0.026, 0.08, 10), solid(C.woodDark, 0.85), [x, 0.04, z]);
    }
  }
  // 柜门
  for (const x of [-0.335, 0.335]) {
    rbox(g, 0.64, 0.4, 0.02, solid(C.woodLight, 0.8), [x, 0.32, 0.255], [0, 0, 0], 0.006);
    add(g, cylGeo(0.012, 0.012, 0.03, 10), solid(C.woodDark, 0.6), [x + (x < 0 ? 0.26 : -0.26), 0.32, 0.27], [Math.PI / 2, 0, 0]);
  }

  // 唱机
  const tt = new THREE.Group();
  tt.position.set(-0.16, 0.615, 0);
  rbox(tt, 0.46, 0.075, 0.38, solid(C.woodDark, 0.7), [0, 0.037, 0], [0, 0, 0], 0.012);
  add(tt, cylGeo(0.165, 0.165, 0.014, 40), solid("#2c2c2e", 0.55, 0.2), [0, 0.082, 0]);
  const platter = add(tt, cylGeo(0.15, 0.15, 0.012, 40), solid("#1d1d1f", 0.6), [0, 0.092, 0]);
  platter.userData.spin = "platter";

  const label = add(tt, cylGeo(0.05, 0.05, 0.002, 24), solid(C.mustard, 0.8), [0, 0.0995, 0]);
  label.userData.spin = "platter";

  // 唱臂
  const arm = add(tt, cylGeo(0.006, 0.006, 0.22, 8), solid("#b8b3a8", 0.35, 0.6), [0.16, 0.1, -0.1]);
  arm.rotation.set(Math.PI / 2, 0, 0.55);
  arm.position.set(0.155, 0.1, -0.06);
  add(tt, cylGeo(0.022, 0.022, 0.03, 12), solid("#b8b3a8", 0.35, 0.6), [0.205, 0.1, 0.02]);
  add(tt, cylGeo(0.012, 0.012, 0.02, 10), solid("#8f8a80", 0.5, 0.4), [0.13, 0.105, -0.19]);

  // 按钮
  for (let i = 0; i < 2; i++) {
    add(tt, cylGeo(0.012, 0.012, 0.008, 12), solid("#c9c3b6", 0.6), [0.02 + i * 0.045, 0.083, 0.165]);
  }
  g.add(tt);
  g.userData.spin.push(platter, label);

  // 小音箱
  for (const x of [-0.6, 0.48]) {
    const sp = new THREE.Group();
    rbox(sp, 0.17, 0.24, 0.19, solid("#3b3a36", 0.85), [0, 0.12, 0], [0, 0, 0], 0.014);
    add(sp, cylGeo(0.046, 0.046, 0.008, 20), solid("#23231f", 0.9), [0, 0.145, 0.098], [Math.PI / 2, 0, 0]);
    add(sp, cylGeo(0.018, 0.018, 0.008, 16), solid("#5a5852", 0.8), [0, 0.058, 0.098], [Math.PI / 2, 0, 0]);
    sp.position.set(x, 0.615, 0.01);
    g.add(sp);
  }

  // 靠墙立着的唱片封套
  const sleeves = [
    ["冀西南林路行", "万能青年旅店", "#4a5347"],
    ["太阳系", "苏紫旭", "#8c5f42"],
    ["新长征", "崔健", "#8e2f2a"]
  ];
  sleeves.forEach(([title, artist, bg], i) => {
    const tex = canvasTexture(400, 400, sleeveArt(title, artist, bg, "#f3ead6"));
    const sleeve = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 0.32),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide })
    );
    sleeve.position.set(-0.3 + i * 0.15, 0.75 + i * 0.012, -0.16 - i * 0.012);
    sleeve.rotation.set(-0.1, 0.03 * i, 0.02 * (i - 1));
    sleeve.castShadow = true;
    g.add(sleeve);
  });

  // 耳机挂钩
  add(g, new THREE.TorusGeometry(0.06, 0.012, 10, 24, Math.PI * 1.15), solid("#2c2c2e", 0.7), [0.55, 0.78, 0.16], [0.2, 0, 0]);

  castAll(g);
  return g;
}

/* ==================================================================
   墙面黑胶
================================================================== */
function makeWallRecords() {
  const g = new THREE.Group();
  const vinyl = solid("#24262a", 0.55);
  const labels = [C.clay, C.mustard, C.teal, "#8a6f9b"];
  const positions = [
    [-1.55, 0.34, 0.32], [-0.9, 0.6, 0.3], [-0.32, 0.3, 0.36], [0.35, 0.52, 0.27]
  ];

  positions.forEach(([x, y, r], i) => {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.038, 48), vinyl);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(x, y, 0);
    disc.castShadow = true;
    g.add(disc);

    const label = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.32, r * 0.32, 0.042, 32),
      solid(labels[i % labels.length], 0.85)
    );
    label.rotation.x = Math.PI / 2;
    label.position.set(x, y, 0.004);
    g.add(label);

    const hole = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.05, r * 0.05, 0.046, 12), vinyl);
    hole.rotation.x = Math.PI / 2;
    hole.position.set(x, y, 0.006);
    g.add(hole);
  });

  castAll(g);
  return g;
}

/* ==================================================================
   展示架（游戏 / 书 / 摆件）
================================================================== */
function makeKnight() {
  const g = new THREE.Group();
  const white = solid("#e9e4d8", 0.85);
  const cloak = solid("#2a2a2e", 0.95);

  add(g, cylGeo(0.045, 0.075, 0.16, 16), solid("#2f4a6b", 0.95), [0, 0.08, 0]);
  add(g, sphereGeo(0.062, 18, 14), white, [0, 0.2, 0]);
  const head = g.children[g.children.length - 1];
  head.scale.set(1.05, 1.0, 1.1);

  // 两根角
  for (const s of [-1, 1]) {
    const horn = add(g, cylGeo(0.004, 0.016, 0.1, 8), white, [s * 0.045, 0.27, 0], [0, 0, s * 0.5]);
    horn.scale.y = 1;
  }
  // 眼
  for (const s of [-1, 1]) {
    add(g, sphereGeo(0.011, 10, 8), solid("#1a1a1c", 0.4), [s * 0.024, 0.205, 0.055]);
  }
  // 小剑
  add(g, new THREE.BoxGeometry(0.008, 0.18, 0.008), solid("#cfd2cc", 0.35, 0.5), [0.085, 0.09, 0.02], [0, 0, 0.15]);
  castAll(g);
  return g;
}

function makeShelf() {
  const g = new THREE.Group();
  const wood = solid(C.wood, 0.85);
  const dark = solid(C.woodDark, 0.85);

  const W = 0.96;
  const H = 2.24;
  const D = 0.38;

  rbox(g, 0.07, H, D, dark, [-W / 2, H / 2, 0], [0, 0, 0], 0.006);
  rbox(g, 0.07, H, D, dark, [W / 2, H / 2, 0], [0, 0, 0], 0.006);
  rbox(g, W, H, 0.025, solid(C.woodLight, 0.9), [0, H / 2, -D / 2 + 0.012], [0, 0, 0], 0.004);

  const levels = [0.22, 0.76, 1.3, 1.84];
  levels.forEach((y) => {
    rbox(g, W, 0.05, D, wood, [0, y, 0], [0, 0, 0], 0.006);
  });
  rbox(g, W + 0.06, 0.06, D + 0.02, wood, [0, H, 0], [0, 0, 0], 0.006);

  // 书竖着摆满三层，顶层放小盆栽和两本平放的书
  function bookRow(count, y, z, palette, seed) {
    const row = new THREE.Group();
    let x = -0.44;
    for (let i = 0; i < count; i++) {
      const w = 0.026 + ((i * 7 + seed) % 5) * 0.004;
      if (x + w > 0.42) break;
      const h = 0.18 + ((i * 3 + seed) % 6) * 0.012 + Math.random() * 0.02;
      const color = palette[(i + seed) % palette.length];
      const lean = (Math.random() - 0.5) * 0.04;
      const bx = x + w / 2;
      rbox(row, w, h, 0.17, solid(color, 0.92), [bx, y + h / 2, 0.02], [0, 0, lean], 0.003);

      // 书脊设计：上下两道细带 + 小标签
      const bandMat = solid(i % 2 ? "#d8c39c" : "#e9dcc4", 0.7);
      rbox(row, w * 0.86, 0.016, 0.004, bandMat, [bx, y + h - 0.022, 0.107], [0, 0, lean], 0.001);
      rbox(row, w * 0.86, 0.012, 0.004, bandMat, [bx, y + 0.025, 0.107], [0, 0, lean], 0.001);
      rbox(row, w * 0.62, 0.03, 0.004, solid("#b8a07c", 0.75), [bx, y + h * 0.72, 0.107], [0, 0, lean], 0.001);

      x += w + 0.009;
    }
    return row;
  }

  g.add(bookRow(24, 0.245, 0.02, [C.clay, C.cream, C.teal, "#8a6f9b", C.mustard, C.olive], 0));
  g.add(bookRow(26, 0.785, 0.02, [C.mustard, C.cream, C.olive, "#b5713f", C.teal], 2));

  // 第三层：装电影的纸箱（打开的翻盖，不是柜子）
  const movieBox = new THREE.Group();
  const cardboard = solid("#b89a72", 0.95);
  rbox(movieBox, 0.56, 0.16, 0.34, cardboard, [0, 0.08, 0], [0, 0, 0], 0.008);
  rbox(movieBox, 0.52, 0.02, 0.3, solid("#8d7151", 1), [0, 0.16, 0], [0, 0, 0], 0.004);
  // 打开的前后翻盖
  rbox(movieBox, 0.56, 0.015, 0.14, cardboard, [0, 0.2, 0.2], [0.7, 0, 0], 0.004);
  rbox(movieBox, 0.56, 0.015, 0.14, cardboard, [0, 0.2, -0.2], [-0.7, 0, 0], 0.004);
  // 正面标签：浴血黑帮
  const labelTex = canvasTexture(260, 120, (ctx, w, h) => {
    ctx.fillStyle = "#e8dcc6";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#4a3b2c";
    ctx.font = `400 34px "Songti SC", serif`;
    ctx.textAlign = "center";
    ctx.fillText("MOVIE", w / 2, h * 0.52);
    ctx.font = `400 14px "PingFang SC", sans-serif`;
    ctx.fillStyle = "#8a755c";
    ctx.fillText("05 FILMS", w / 2, h * 0.78);
  });
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.12),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.95 })
  );
  label.position.set(0, 0.09, 0.172);
  movieBox.add(label);

  const movieTitles = ["奥德赛", "浴血黑帮", "天空之城", "路边野餐", "人生大事"];
  movieTitles.forEach((title, i) => {
    const tex = canvasTexture(140, 200, (ctx, w, h) => {
      const palette = ["#33465a", "#2a2724", "#7d94a6", "#5c6b4f", "#a8694f"];
      ctx.fillStyle = palette[i];
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(248,242,228,0.9)";
      ctx.textAlign = "center";
      ctx.font = `400 ${Math.round(w * 0.14)}px "Songti SC", serif`;
      ctx.fillText(title, w / 2, h * 0.6);
    });
    const cover = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 0.145),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide })
    );
    cover.position.set(-0.2 + i * 0.1, 0.26, 0.0);
    cover.rotation.x = -0.1;
    movieBox.add(cover);
  });
  movieBox.position.set(0, 1.33, 0);
  g.add(movieBox);
  g.userData.movieBox = movieBox;

  // 第四层：小骑士 + 沙罐 + 相框
  const knightTop = makeKnight();
  knightTop.position.set(-0.31, 1.865, 0.02);
  knightTop.rotation.y = -0.35;
  knightTop.scale.setScalar(0.55);
  g.add(knightTop);
  g.userData.knight = knightTop;

  const jar = new THREE.Group();
  const jarGlass = new THREE.Mesh(
    cylGeo(0.05, 0.055, 0.14, 20),
    new THREE.MeshStandardMaterial({ color: "#dfe8e2", transparent: true, opacity: 0.32, roughness: 0.1, depthWrite: false })
  );
  jarGlass.position.y = 0.07;
  jar.add(jarGlass);
  add(jar, cylGeo(0.048, 0.05, 0.07, 20), solid("#c9ae82", 1), [0, 0.035, 0]);
  add(jar, cylGeo(0.052, 0.052, 0.015, 20), solid(C.woodDark, 0.9), [0, 0.148, 0]);
  jar.position.set(-0.08, 1.865, 0.02);
  g.add(jar);
  g.userData.sand = jar;

  const frameTex = canvasTexture(320, 240, (ctx, w, h) => {
    ctx.fillStyle = "#efe4cf";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#c9b79a";
    ctx.fillRect(20, 20, w - 40, h - 40);
    ctx.fillStyle = "#8a7a62";
    ctx.font = `400 22px "PingFang SC", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("相机里的照片", w / 2, h / 2);
  });

  rbox(g, 0.26, 0.2, 0.012, solid(C.woodDark, 0.85), [0.27, 1.965, 0.06], [0, 0.16, 0], 0.004);
  const framePhoto = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.16),
    new THREE.MeshStandardMaterial({ map: frameTex, roughness: 0.95 })
  );
  framePhoto.position.set(0.27, 1.965, 0.07);
  framePhoto.rotation.y = 0.16;
  g.add(framePhoto);
  g.userData.frameTexture = frameTex;

  castAll(g);
  return g;
}

/* ==================================================================
   植物
================================================================== */
function makeBigPlant() {
  const g = new THREE.Group();

  add(g, latheGeo([
    [0, 0], [0.19, 0], [0.23, 0.06], [0.25, 0.36], [0.24, 0.4], [0.22, 0.4]
  ]), solid("#d9c6ab", 0.95), [0, 0, 0]);
  add(g, cylGeo(0.215, 0.215, 0.02, 24), solid("#4a3a2b", 1), [0, 0.395, 0]);

  const leafMatA = solid("#6c8a5d", 0.85);
  const leafMatB = solid("#587449", 0.85);
  const geo = leafGeo();

  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.3;
    const tilt = 0.16 + Math.random() * 0.34;
    const len = 0.72 + Math.random() * 0.4;
    const stem = new THREE.Group();
    stem.position.y = 0.4;
    stem.rotation.y = a;
    stem.rotation.x = tilt;

    const stalk = add(stem, cylGeo(0.007, 0.011, len, 8), leafMatB, [0, len / 2, 0]);
    stalk.castShadow = true;

    const leaf = new THREE.Mesh(geo, i % 2 ? leafMatA : leafMatB);
    leaf.scale.setScalar(1.35 + Math.random() * 0.45);
    leaf.position.set(0, len - 0.02, 0);
    leaf.rotation.set(-1.15, 0, (Math.random() - 0.5) * 0.5);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    stem.add(leaf);
    g.add(stem);
  }

  return g;
}

/* ==================================================================
   拳击手套
================================================================== */
function makeGloves() {
  const g = new THREE.Group();
  const red = solid("#8e3a2e", 0.85);
  const cream = solid("#e8dac2", 0.9);

  function glove(main, x, z, rot) {
    const gl = new THREE.Group();
    gl.position.set(x, 0, z);
    gl.rotation.y = rot;

    add(gl, cylGeo(0.058, 0.062, 0.075, 18), cream, [0, 0.038, 0]);
    rbox(gl, 0.145, 0.17, 0.12, main, [0, 0.16, 0.005], [0, 0, 0], 0.05);

    const thumb = add(gl, sphereGeo(0.043, 14, 10), main, [0.082, 0.135, 0.025], [0, 0, -0.3]);
    thumb.scale.set(1, 1.25, 0.9);

    for (let i = 0; i < 3; i++) {
      add(gl, new THREE.BoxGeometry(0.085, 0.005, 0.005), cream, [0, 0.1 + i * 0.028, 0.062]);
    }
    add(gl, new THREE.BoxGeometry(0.16, 0.012, 0.012), cream, [0, 0.245, 0.02]);

    gl.rotation.z = rot > 0 ? -0.08 : 0.08;
    g.add(gl);
  }

  glove(red, -0.08, 0, 0.15);
  glove(cream, 0.09, 0.02, -0.12);

  castAll(g);
  return g;
}

/* ==================================================================
   羽毛球拍 + 球
================================================================== */
function makeRacket() {
  const g = new THREE.Group();
  const metal = solid("#cfc8b8", 0.35, 0.5);
  const grip = solid("#3d4a3f", 0.9);

  const head = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.008, 8, 36), metal);
  head.position.y = 0.98;
  head.castShadow = true;
  g.add(head);

  // 拍线
  const lineMat = new THREE.LineBasicMaterial({ color: "#ded8c9", transparent: true, opacity: 0.55 });
  const pts = [];
  for (let i = -3; i <= 3; i++) {
    const off = i * 0.036;
    const half = Math.sqrt(Math.max(0, 0.145 * 0.145 - off * off)) * 0.94;
    pts.push(new THREE.Vector3(off, 0.98 - half, 0), new THREE.Vector3(off, 0.98 + half, 0));
    pts.push(new THREE.Vector3(-half, 0.98 + off, 0), new THREE.Vector3(half, 0.98 + off, 0));
  }
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
  g.add(lines);

  add(g, cylGeo(0.008, 0.011, 0.47, 10), metal, [0, 0.6, 0]);
  add(g, cylGeo(0.017, 0.02, 0.2, 12), grip, [0, 0.28, 0]);
  add(g, cylGeo(0.021, 0.021, 0.02, 12), grip, [0, 0.18, 0]);

  // 斜靠墙，顶端贴墙
  g.rotation.x = -0.16;
  g.rotation.z = 0.1;

  castAll(g);
  return g;
}

function makeShuttlecock() {
  const g = new THREE.Group();
  add(g, sphereGeo(0.022, 12, 10), solid("#efe9dc", 0.85), [0, 0.03, 0]);
  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.016, 0.075, 14, 1, true),
    new THREE.MeshStandardMaterial({ color: "#f4eee2", roughness: 0.9, side: THREE.DoubleSide })
  );
  skirt.position.y = 0.075;
  g.add(skirt);
  add(g, cylGeo(0.045, 0.045, 0.005, 14), solid("#c9c3b6", 0.9), [0, 0.113, 0]);
  return g;
}

/* ==================================================================
   桌面小物：龙舌兰日出 / 瓜子 / 向日葵
================================================================== */
function makeTequila() {
  const g = new THREE.Group();

  add(g, cylGeo(0.052, 0.044, 0.135, 24, true), glassy("#e8f0ea", 0.28, 0.05), [0, 0.068, 0]);

  const liquid = canvasTexture(64, 128, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#f7cf55");
    grad.addColorStop(0.5, "#ef8f3a");
    grad.addColorStop(1, "#c1442c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });
  const drink = new THREE.Mesh(
    new THREE.CylinderGeometry(0.047, 0.04, 0.1, 24),
    new THREE.MeshStandardMaterial({ map: liquid, roughness: 0.35 })
  );
  drink.position.y = 0.055;
  g.add(drink);

  add(g, new THREE.TorusGeometry(0.03, 0.007, 8, 20), solid("#d9c25a", 0.7), [0.055, 0.13, 0], [0, 0, 1.2]);
  add(g, sphereGeo(0.012, 10, 8), solid("#4a7a3a", 0.8), [0.058, 0.15, 0.05]);
  return g;
}

function makeSeedBowl() {
  const g = new THREE.Group();
  const bowl = new THREE.Mesh(
    latheGeo([[0, 0], [0.055, 0], [0.075, 0.02], [0.09, 0.07], [0.085, 0.072]]),
    solid("#e6dccb", 0.75)
  );
  bowl.castShadow = true;
  g.add(bowl);

  const seedGeo = new THREE.SphereGeometry(0.008, 8, 6);
  const inst = new THREE.InstancedMesh(seedGeo, solid("#4a3a28", 0.8), 90);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 90; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 0.062;
    dummy.position.set(Math.cos(a) * r, 0.055 + Math.random() * 0.012, Math.sin(a) * r);
    dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    dummy.scale.set(1, 0.5, 1.5);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
  }
  inst.castShadow = true;
  g.add(inst);
  return g;
}

function makeSunflowers() {
  const g = new THREE.Group();
  const vase = new THREE.Mesh(
    latheGeo([[0, 0], [0.07, 0], [0.085, 0.04], [0.075, 0.18], [0.055, 0.24], [0.06, 0.27]]),
    solid("#cdbba3", 0.9)
  );
  vase.castShadow = true;
  g.add(vase);
  add(g, cylGeo(0.052, 0.052, 0.012, 24), solid("#3f5a44", 0.8), [0, 0.252, 0]);

  const stemMat = solid("#5f7a55", 0.9);
  const petalMat = solid("#e2b455", 0.85);
  const petalMat2 = solid("#d7a747", 0.85);
  const centerMat = solid("#7a5433", 0.95);

  for (let f = 0; f < 3; f++) {
    const a = (f / 3) * Math.PI * 2 + 0.4;
    const lean = 0.18 + f * 0.06;
    const h = 0.28 + f * 0.035;
    const head = new THREE.Group();
    head.position.y = 0.25;
    head.rotation.z = Math.cos(a) * lean;
    head.rotation.x = Math.sin(a) * lean * 0.8;

    add(head, cylGeo(0.006, 0.008, h, 8), stemMat, [0, h / 2, 0]);

    const flower = new THREE.Group();
    flower.position.set(0, h, 0);
    flower.rotation.y = a;
    flower.rotation.x = -0.3;

    const petalGeo = new THREE.SphereGeometry(0.022, 10, 8);
    for (let i = 0; i < 14; i++) {
      const pa = (i / 14) * Math.PI * 2;
      const p = new THREE.Mesh(petalGeo, i % 2 ? petalMat : petalMat2);
      p.position.set(Math.cos(pa) * 0.055, Math.sin(pa) * 0.055, -0.004);
      p.scale.set(1.9, 0.75, 0.3);
      p.rotation.z = pa;
      p.castShadow = true;
      flower.add(p);
    }
    add(flower, sphereGeo(0.033, 16, 12), centerMat, [0, 0, 0.006]);
    head.add(flower);

    const leaf = new THREE.Mesh(leafGeo(), solid("#6f8a5e", 0.9));
    leaf.scale.setScalar(0.42);
    leaf.position.set(0.03, h * 0.45, 0);
    leaf.rotation.set(-1.2, a, 0);
    head.add(leaf);

    g.add(head);
  }
  return g;
}

/* ==================================================================
   信封
================================================================== */
function makeEnvelope() {
  const g = new THREE.Group();
  const paperMat = solid("#f3e9d5", 0.95);
  const paperMatSide = solid("#e8dcc4", 0.95);

  rbox(g, 0.26, 0.008, 0.18, paperMat, [0, 0, 0], [0, 0, 0], 0.004);

  const flap = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.11), paperMatSide);
  flap.rotation.x = -Math.PI / 2;
  flap.position.set(0, 0.006, -0.045);
  g.add(flap);

  add(g, cylGeo(0.019, 0.019, 0.012, 20), solid("#8e3b32", 0.6), [0, 0.012, 0.03]);

  const string = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.004, 6, 20), solid("#8e3b32", 0.9));
  string.rotation.x = Math.PI / 2;
  string.position.set(0, 0.016, 0.035);
  g.add(string);

  castAll(g);
  return g;
}

/* ==================================================================
   蒲团 / 唱片木箱 / 地上的书
================================================================== */
function makePouf() {
  const g = new THREE.Group();
  const fabric = solid("#c58c6a", 0.98);
  add(g, cylGeo(0.27, 0.27, 0.3, 28), fabric, [0, 0.15, 0]);
  const top = add(g, sphereGeo(0.27, 24, 14), fabric, [0, 0.3, 0]);
  top.scale.set(1, 0.3, 1);
  add(g, new THREE.TorusGeometry(0.27, 0.011, 8, 32), solid("#a9714f", 0.95), [0, 0.295, 0], [Math.PI / 2, 0, 0]);
  castAll(g);
  return g;
}

function makeCrate() {
  const g = new THREE.Group();
  const wood = solid(C.wood, 0.9);
  const W = 0.46;
  const D = 0.36;
  const H = 0.3;

  rbox(g, W, 0.03, D, wood, [0, 0.015, 0], [0, 0, 0], 0.006);
  rbox(g, W, H, 0.02, wood, [0, H / 2, -D / 2], [0, 0, 0], 0.004);
  rbox(g, W, H, 0.02, wood, [0, H / 2, D / 2], [0, 0, 0], 0.004);
  rbox(g, 0.02, H, D, wood, [-W / 2, H / 2, 0], [0, 0, 0], 0.004);
  rbox(g, 0.02, H, D, wood, [W / 2, H / 2, 0], [0, 0, 0], 0.004);
  rbox(g, W, 0.02, 0.03, wood, [0, H * 0.6, D / 2 + 0.01], [0, 0, 0], 0.004);

  const colors = ["#4a5347", "#8c5f42", "#8e2f2a", "#3f4f63", "#6d5a3f"];
  colors.forEach((color, i) => {
    const sleeve = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.3),
      new THREE.MeshStandardMaterial({ color, roughness: 0.95, side: THREE.DoubleSide })
    );
    sleeve.position.set(-0.09 + i * 0.045, 0.17, -0.02);
    sleeve.rotation.set(-0.14, 0.02 * i, 0.02 * (i - 2));
    sleeve.castShadow = true;
    g.add(sleeve);
  });

  castAll(g);
  return g;
}

/* ==================================================================
   吉他（自己搭的，焦糖色琴身 + 深棕指板）
================================================================== */
function makeGuitar() {
  const g = new THREE.Group();

  const caramel = solid("#b06a3c", 0.55);
  const caramelDark = solid("#8f5330", 0.6);
  const fretboard = solid("#3f2b1c", 0.7);
  const cream = solid("#efe0c4", 0.75);
  const metal = solid("#c9c2b2", 0.3, 0.65);
  const black = solid("#26241f", 0.5);

  // 琴身：加大，和琴颈的比例正常
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.3);
  shape.bezierCurveTo(0.12, 0.3, 0.21, 0.24, 0.21, 0.1);
  shape.bezierCurveTo(0.21, -0.01, 0.14, -0.08, 0.17, -0.18);
  shape.bezierCurveTo(0.19, -0.29, 0.11, -0.34, 0, -0.34);
  shape.bezierCurveTo(-0.11, -0.34, -0.19, -0.29, -0.17, -0.18);
  shape.bezierCurveTo(-0.14, -0.08, -0.21, -0.01, -0.21, 0.1);
  shape.bezierCurveTo(-0.21, 0.24, -0.12, 0.3, 0, 0.3);

  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 2,
    curveSegments: 16
  });
  bodyGeo.translate(0, 0, -0.03);

  const body = new THREE.Mesh(bodyGeo, caramel);
  body.position.y = 0.55;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // 护板
  const guardShape = new THREE.Shape();
  guardShape.moveTo(-0.05, 0.09);
  guardShape.bezierCurveTo(0.06, 0.09, 0.13, 0.03, 0.13, -0.04);
  guardShape.bezierCurveTo(0.13, -0.09, 0.06, -0.12, 0, -0.1);
  guardShape.bezierCurveTo(-0.05, -0.08, -0.08, -0.02, -0.05, 0.09);
  guardShape.closePath();
  const guard = new THREE.Mesh(
    new THREE.ExtrudeGeometry(guardShape, { depth: 0.006, bevelEnabled: false, curveSegments: 12 }),
    cream
  );
  guard.position.y = 0.64;
  guard.position.z = 0.032;
  g.add(guard);

  // 琴颈
  add(g, new THREE.BoxGeometry(0.058, 0.44, 0.04), caramelDark, [0, 1.06, 0]);
  add(g, new THREE.BoxGeometry(0.064, 0.38, 0.014), fretboard, [0, 1.05, 0.026]);

  // 琴头
  const head = add(g, new THREE.BoxGeometry(0.085, 0.14, 0.032), caramel, [0, 1.34, -0.008], [-0.2, 0, 0]);
  head.castShadow = true;

  for (let i = 0; i < 7; i++) {
    add(g, new THREE.BoxGeometry(0.066, 0.004, 0.004), metal, [0, 0.89 + i * 0.042, 0.034]);
  }

  // 拾音器 / 琴桥 / 旋钮
  add(g, new THREE.BoxGeometry(0.095, 0.03, 0.015), black, [0, 0.62, 0.038]);
  add(g, new THREE.BoxGeometry(0.095, 0.03, 0.015), black, [0, 0.53, 0.038]);
  add(g, new THREE.BoxGeometry(0.105, 0.024, 0.018), metal, [0, 0.45, 0.04]);
  add(g, cylGeo(0.015, 0.015, 0.012, 12), black, [0.11, 0.46, 0.045], [Math.PI / 2, 0, 0]);
  add(g, cylGeo(0.015, 0.015, 0.012, 12), black, [0.11, 0.41, 0.045], [Math.PI / 2, 0, 0]);

  // 琴弦
  for (let i = 0; i < 6; i++) {
    const x = -0.026 + i * 0.0105;
    add(g, cylGeo(0.0016, 0.0016, 0.86, 6), metal, [x, 0.89, 0.045]);
  }

  // 琴架
  const standMat = solid("#2c2b28", 0.7);
  add(g, cylGeo(0.013, 0.013, 0.32, 8), standMat, [0.11, 0.16, 0.02], [0, 0, 0.3]);
  add(g, cylGeo(0.013, 0.013, 0.32, 8), standMat, [-0.11, 0.16, 0.02], [0, 0, -0.3]);
  add(g, cylGeo(0.013, 0.013, 0.4, 8), standMat, [0, 0.2, -0.12], [-0.3, 0, 0]);
  add(g, cylGeo(0.011, 0.011, 0.3, 8), standMat, [0, 0.36, -0.02], [0, 0, Math.PI / 2]);
  add(g, new THREE.TorusGeometry(0.055, 0.009, 6, 16, Math.PI), standMat, [0, 0.44, -0.06], [0.3, 0, 0]);

  g.scale.setScalar(0.9);
  castAll(g);
  return g;
}

/* ==================================================================
   架子鼓（深胡桃木 + 米白鼓皮 + 黄铜镲片）
================================================================== */
function makeDrumKit() {
  const g = new THREE.Group();

  const shell = solid("#5c3b28", 0.6);
  const head = solid("#e8dcc6", 0.9);
  const brass = solid("#c08a2e", 0.32, 0.8);
  const hardware = solid("#a9a49a", 0.35, 0.55);

  function drum(r, h, pos, rot = [0, 0, 0]) {
    const d = new THREE.Group();
    d.position.set(pos[0], pos[1], pos[2]);
    d.rotation.set(rot[0], rot[1], rot[2]);

    add(d, cylGeo(r, r, h, 32), shell, [0, 0, 0]);
    add(d, cylGeo(r * 0.94, r * 0.94, 0.008, 32), head, [0, h / 2 + 0.003, 0]);
    add(d, cylGeo(r * 0.94, r * 0.94, 0.008, 32), head, [0, -h / 2 - 0.003, 0]);
    add(d, new THREE.TorusGeometry(r, 0.008, 8, 32), hardware, [0, h / 2, 0], [Math.PI / 2, 0, 0]);
    add(d, new THREE.TorusGeometry(r, 0.008, 8, 32), hardware, [0, -h / 2, 0], [Math.PI / 2, 0, 0]);

    g.add(d);
    return d;
  }

  // 底鼓：正面朝房间
  drum(0.29, 0.38, [0, 0.31, 0], [Math.PI / 2, 0, 0]);

  // 军鼓
  drum(0.15, 0.14, [0.48, 0.52, 0.28]);

  // 两个嗵鼓
  drum(0.11, 0.16, [-0.2, 0.72, 0.12], [0.24, 0, 0.1]);
  drum(0.12, 0.17, [0.1, 0.75, 0.15], [0.2, 0, -0.08]);

  // 支架
  function tripod(x, z, h, r = 0.1) {
    add(g, cylGeo(0.008, 0.008, h, 8), hardware, [x, h / 2, z]);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      add(g, cylGeo(0.005, 0.005, 0.26, 6), hardware,
        [x + Math.cos(a) * r, 0.07, z + Math.sin(a) * r],
        [0.4 * Math.sin(a), 0, -0.4 * Math.cos(a)]);
    }
  }

  tripod(0.48, 0.28, 0.46);
  add(g, cylGeo(0.007, 0.007, 0.16, 8), hardware, [-0.2, 0.62, 0.12]);
  add(g, cylGeo(0.007, 0.007, 0.16, 8), hardware, [0.1, 0.64, 0.15]);

  // 镲片：只留踩镲和一张吊镲
  function cymbal(r, y, x, z, tilt) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.18, r, 0.008, 32), brass);
    c.position.set(x, y, z);
    c.rotation.set(tilt, 0, 0);
    c.castShadow = true;
    g.add(c);

    add(g, cylGeo(0.007, 0.007, y, 8), hardware, [x, y / 2, z]);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      add(g, cylGeo(0.005, 0.005, 0.24, 6), hardware,
        [x + Math.cos(a) * 0.1, 0.1, z + Math.sin(a) * 0.1],
        [0.45 * Math.sin(a), 0, -0.45 * Math.cos(a)]);
    }
  }

  cymbal(0.145, 1.04, -0.52, 0.04, 0.28);
  cymbal(0.115, 0.8, 0.66, 0.2, 0.1);
  cymbal(0.115, 0.75, 0.66, 0.2, 0.1);

  // 鼓凳
  const stool = new THREE.Group();
  add(stool, cylGeo(0.14, 0.14, 0.055, 24), solid("#433a32", 0.9), [0, 0.47, 0]);
  add(stool, cylGeo(0.018, 0.018, 0.44, 8), hardware, [0, 0.23, 0]);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    add(stool, cylGeo(0.006, 0.006, 0.26, 6), hardware,
      [Math.cos(a) * 0.09, 0.07, Math.sin(a) * 0.09], [0.35 * Math.sin(a), 0, -0.35 * Math.cos(a)]);
  }
  stool.position.set(0.02, 0, -0.48);
  g.add(stool);

  castAll(g);
  return g;
}

/* ==================================================================
   日历（显示今天）
================================================================== */
function makeCalendar() {
  const g = new THREE.Group();
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const week = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];

  const tex = canvasTexture(320, 400, (ctx, w, h) => {
    ctx.fillStyle = "#faf5e8";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#b5713f";
    ctx.fillRect(0, 0, w, 74);
    ctx.fillStyle = "#f7ecd9";
    ctx.font = '500 30px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(`${now.getFullYear()}`, w / 2, 46);

    ctx.fillStyle = "#3b332a";
    ctx.font = '400 150px Georgia, serif';
    ctx.fillText(String(day), w / 2, 250);

    ctx.font = '400 26px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = "#7a6a55";
    ctx.fillText(`${month} 月 · 星期${week}`, w / 2, 305);

    ctx.strokeStyle = "rgba(120,100,75,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 335);
    ctx.lineTo(w - 40, 335);
    ctx.stroke();

    ctx.font = '400 17px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = "rgba(120,100,75,0.55)";
    ctx.fillText("TODAY", w / 2, 370);
  });

  // 背板 + 纸
  rbox(g, 0.26, 0.33, 0.02, solid("#d8c3a4", 0.9), [0, 0.165, 0], [0, 0, 0], 0.006);
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.23, 0.29),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 })
  );
  paper.position.set(0, 0.17, 0.012);
  g.add(paper);

  // 小支架
  rbox(g, 0.22, 0.015, 0.12, solid("#c9ae8a", 0.9), [0, 0.008, 0.02], [0, 0, 0], 0.004);
  rbox(g, 0.22, 0.015, 0.12, solid("#c9ae8a", 0.9), [0, 0.008, -0.06], [0.35, 0, 0], 0.004);

  castAll(g);
  return g;
}

/* ==================================================================
   磁带（代替信纸）
================================================================== */
function makeCassette() {
  const g = new THREE.Group();
  const shell = solid("#e7dcc6", 0.8);
  const dark = solid("#2a2a2c", 0.7);

  rbox(g, 0.34, 0.055, 0.22, shell, [0, 0.028, 0], [0, 0, 0], 0.012);

  // 标签
  const labelTex = canvasTexture(400, 200, (ctx, w, h) => {
    ctx.fillStyle = "#f2e8d4";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#b5713f";
    ctx.fillRect(0, 0, w, 34);
    ctx.fillStyle = "#f7ecd9";
    ctx.font = '500 18px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText("SIDE A · FOR YOU", 14, 24);
    ctx.fillStyle = "#4a4238";
    ctx.font = 'italic 400 34px Georgia, serif';
    ctx.fillText("Happy Birthday", 18, 96);
    ctx.fillStyle = "rgba(74,66,56,0.55)";
    ctx.font = '400 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText("盐 收", 18, 132);
  });

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.26, 0.13),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.9 })
  );
  label.rotation.x = -Math.PI / 2;
  label.position.set(0, 0.056, 0);
  g.add(label);

  // 两个卷轴
  for (const x of [-0.075, 0.075]) {
    add(g, cylGeo(0.036, 0.036, 0.008, 20), dark, [x, 0.058, 0.055]);
    add(g, cylGeo(0.014, 0.014, 0.01, 16), solid("#8a8172", 0.7), [x, 0.06, 0.055]);
  }

  // 底部两个孔 + 螺丝
  for (const x of [-0.1, 0.1]) {
    add(g, cylGeo(0.012, 0.012, 0.006, 12), dark, [x, 0.056, -0.075]);
  }
  for (const p of [[-0.15, -0.09], [0.15, -0.09], [-0.15, 0.09], [0.15, 0.09]]) {
    add(g, cylGeo(0.006, 0.006, 0.004, 8), solid("#9a9184", 0.6), [p[0], 0.057, p[1]]);
  }

  castAll(g);
  return g;
}

/* ==================================================================
   鸟图鉴（封面带小鸟）
================================================================== */
function makeBirdBook() {
  const g = new THREE.Group();
  const books = makeBooks(2, 0.2, 0.03, 0.26, ["#6f8b7a", C.cream]);
  g.add(books);

  const coverTex = canvasTexture(360, 260, (ctx, w, h) => {
    ctx.fillStyle = "#6f8b7a";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(244,238,224,0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, w - 28, h - 28);

    ctx.fillStyle = "rgba(244,238,224,0.92)";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.44, 34, 24, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.5 + 24, h * 0.36, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.5 + 36, h * 0.35);
    ctx.lineTo(w * 0.5 + 58, h * 0.34);
    ctx.lineTo(w * 0.5 + 36, h * 0.38);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(244,238,224,0.7)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - 30, h * 0.46);
    ctx.lineTo(w * 0.5 - 52, h * 0.52);
    ctx.stroke();

    ctx.fillStyle = "#f4eee0";
    ctx.font = `400 30px "Songti SC", Georgia, serif`;
    ctx.textAlign = "center";
    ctx.fillText("百鸟图鉴", w / 2, h * 0.82);
  });

  const cover = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.26),
    new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.9 })
  );
  cover.rotation.x = -Math.PI / 2;
  cover.position.set(0, 0.058, 0);
  g.add(cover);
  return g;
}

/* ==================================================================
   组装
================================================================== */
export function buildProps(scene) {
  const parts = {};

  // 地毯
  const rugTex = canvasTexture(512, 512, rugArt);
  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(3.3, 2.85),
    new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(-2.24, FLOOR_Y + 0.004, 0.6);
  rug.receiveShadow = true;
  scene.add(rug);

  // 沙发
  const sofa = makeSofa();
  sofa.position.set(-3.36, FLOOR_Y, 0.55);
  scene.add(sofa);
  blob(scene, 2.5, 0.42, [-3.36, 0, 0.55]);
  parts.sofa = sofa;

  // 茶几
  const table = makeCoffeeTable();
  table.position.set(-1.9, FLOOR_Y, 0.55);
  scene.add(table);
  blob(scene, 1.45, 0.22, [-1.9, 0, 0.55]);
  parts.table = table;

  // 茶几上的东西（坐标相对茶几）
  const tequila = makeTequila();
  tequila.position.set(0.15, 0.475, -0.34);
  tequila.scale.setScalar(1.3);
  table.add(tequila);
  parts.tequila = tequila;

  const seeds = makeSeedBowl();
  seeds.position.set(-0.12, 0.475, 0.18);
  seeds.scale.setScalar(1.2);
  table.add(seeds);
  parts.seeds = seeds;

  const sunflowers = makeSunflowers();
  sunflowers.position.set(-0.16, 0.475, -0.3);
  sunflowers.scale.setScalar(1.05);
  table.add(sunflowers);
  parts.sunflowers = sunflowers;

  const mags = null;

  // 边几：只留望远镜和鸟图鉴
  const side = makeSideTable();
  side.position.set(-3.44, FLOOR_Y, 2.42);
  scene.add(side);
  blob(scene, 0.95, 0.22, [-3.44, 0, 2.42]);

  const bino = makeBinoculars();
  bino.position.set(0.02, 0.596, 0.08);
  bino.rotation.y = -0.5;
  side.add(bino);
  parts.telescope = bino;

  const birdBook = makeBirdBook();
  birdBook.position.set(-0.02, 0.596, -0.12);
  birdBook.rotation.y = 0.2;
  side.add(birdBook);
  parts.birdbook = birdBook;

  const bookHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.24, 0.34),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  bookHit.position.set(-3.38, 0.72, 2.3);
  scene.add(bookHit);
  parts.bookHit = bookHit;

  const binoHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.22, 0.3),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  binoHit.position.set(-3.4, 0.74, 2.56);
  scene.add(binoHit);
  parts.binoHit = binoHit;

  // 办公桌
  const desk = makeDeskRig();
  desk.position.set(1.75, FLOOR_Y, -2.35);
  scene.add(desk);
  blob(scene, 2.6, 0.26, [1.75, 0, -2.3]);
  parts.desk = desk;
  parts.monitor = desk.userData.monitor;
  parts.keyboard = desk.userData.keyboard;
  parts.notebook = desk.userData.notebook;

  const calendar = makeCalendar();
  calendar.position.set(0.98, 1.035, -0.08);
  calendar.rotation.y = 0.08;
  desk.add(calendar);
  parts.calendar = calendar;
  parts.mug = desk.userData.mug;

  const chair = makeChair();
  chair.position.set(1.63, FLOOR_Y, -1.42);
  chair.rotation.y = -0.12;
  scene.add(chair);

  // 书放椅子上 → 已统一收到书柜

  const cameraModel = makeCamera();
  cameraModel.position.set(0.52, 1.035, -0.3);
  cameraModel.rotation.y = 0.08;
  cameraModel.scale.setScalar(1.15);
  desk.add(cameraModel);
  parts.deskCamera = cameraModel;

  // 毛毡板
  const board = makeCorkBoard();
  board.position.set(1.75, 2.62, -2.77);
  scene.add(board);
  parts.board = board;

  // 唱片柜
  const consoleGroup = makeConsole();
  consoleGroup.position.set(-0.44, FLOOR_Y, -2.6);
  scene.add(consoleGroup);
  blob(scene, 1.75, 0.24, [-0.44, 0, -2.55]);
  parts.music = consoleGroup;

  // 左墙梵高（无框）
  function painting(url, w, h, x, y, z, rotY) {
    const tex = new THREE.TextureLoader().load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const canvasBox = rbox(scene, w + 0.03, h + 0.03, 0.035, solid("#e8ddc9", 1),
      [x, y, z - 0.02], [0, rotY, 0], 0.004);
    canvasBox.receiveShadow = true;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 })
    );
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotY;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  parts.paintWheat = painting("./art/wheatfield.jpg", 0.9, 0.86, -2.73, 2.62, -2.795, 0);
  parts.paintAlmond = painting("./art/almond.jpg", 1.02, 0.8, -1.43, 2.26, -2.795, 0);

  // 沙发上方：中国地图
  const mapTex = new THREE.TextureLoader().load("./art/china-map.png");
  mapTex.colorSpace = THREE.SRGBColorSpace;
  mapTex.anisotropy = 8;
  rbox(scene, 1.62, 1.16, 0.03, solid("#e8ddc9", 1), [-3.795, 2.12, 0.62], [0, Math.PI / 2, 0], 0.004);
  const mapMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.56, 1.1),
    new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.95, color: "#d9c6a6" })
  );
  mapMesh.position.set(-3.77, 2.12, 0.62);
  mapMesh.rotation.y = Math.PI / 2;
  scene.add(mapMesh);
  parts.map = mapMesh;

  // 展示架
  const shelf = makeShelf();
  shelf.position.set(3.48, FLOOR_Y, -2.59);
  scene.add(shelf);
  blob(scene, 1.2, 0.24, [3.48, 0, -2.55]);
  parts.shelf = shelf;
  parts.knight = shelf.userData.knight;
  parts.movieBox = shelf.userData.movieBox;
  parts.sand = shelf.userData.sand;
  parts.frameTexture = shelf.userData.frameTexture;

  const libHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.86, 1.15, 0.4),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  libHit.position.set(3.48, 0.72, -2.48);
  scene.add(libHit);
  parts.libHit = libHit;

  // 无人机放书柜顶正中
  const drone = makeDroneModel();
  drone.position.set(3.48, FLOOR_Y + 2.24, -2.53);
  drone.rotation.y = 0.8;
  drone.scale.setScalar(1.4);
  scene.add(drone);
  parts.drone = drone;

  // 大植物：唱片柜左侧、架子鼓右侧
  const plant = makeBigPlant();
  plant.position.set(-1.36, FLOOR_Y, -2.58);
  plant.scale.setScalar(0.8);
  scene.add(plant);
  blob(scene, 1.0, 0.32, [-1.36, 0, -2.58]);
  parts.plant = plant;

  // 两个蒲团
  const poufA = makePouf();
  poufA.position.set(-1.95, FLOOR_Y, 1.72);
  scene.add(poufA);
  blob(scene, 0.95, 0.28, [-1.95, 0, 1.72]);

  const poufB = makePouf();
  poufB.position.set(-1.85, FLOOR_Y, -0.62);
  scene.add(poufB);
  blob(scene, 0.95, 0.28, [-1.85, 0, -0.62]);

  const crate = makeCrate();
  crate.position.set(-0.62, FLOOR_Y, -1.58);
  crate.rotation.y = 0.32;
  scene.add(crate);
  blob(scene, 0.85, 0.3, [-0.62, 0, -1.58]);
  parts.crate = crate;

  // 吉他：用原模型（在 world.js 里加载并改成墨绿）

  // 架子鼓：用原模型，贴图里把薄荷绿换成胡桃木（在 world.js 里处理）

  // 两把球拍交叉挂在左墙
  function hangRacket(z, tilt) {
    const pivot = new THREE.Group();
    pivot.position.set(-3.77, 1.98, z);
    pivot.rotation.y = Math.PI / 2;
    pivot.rotation.z = tilt;

    const r = makeRacket();
    r.scale.setScalar(1.2);
    r.position.set(0, -0.58, 0);
    r.rotation.set(0, 0, 0);
    pivot.add(r);
    scene.add(pivot);
    return pivot;
  }

  const racketA = hangRacket(1.94, 0.34);
  const racketB = hangRacket(2.06, -0.34);
  parts.racket = racketA;
  parts.racketB = racketB;

  // 拳击手套挂墙上（球拍左下，正对边几上方）
  const gloves = makeGloves();
  gloves.position.set(-3.78, 1.38, 2.32);
  gloves.rotation.set(0, Math.PI / 2, Math.PI);
  gloves.scale.setScalar(1.05);
  scene.add(gloves);
  parts.sports = gloves;
  add(scene, cylGeo(0.012, 0.012, 0.06, 8), solid("#8f8a80", 0.5, 0.4), [-3.79, 1.54, 2.32], [Math.PI / 2, 0, 0]);
  // 磁带（沙发上）
  const envelope = makeCassette();
  envelope.position.set(-3.14, FLOOR_Y + 0.55, 0.2);
  envelope.rotation.y = 0.55;
  envelope.scale.setScalar(1.15);
  scene.add(envelope);
  parts.letter = envelope;

  // 左墙海报（换成新的星际牛仔）
  const posterTex = new THREE.TextureLoader().load("./art/bebop-poster.png");
  posterTex.colorSpace = THREE.SRGBColorSpace;
  const poster = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 1.15),
    new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.95 })
  );
  poster.position.set(-3.79, 2.08, -1.45);
  poster.rotation.y = Math.PI / 2;
  poster.receiveShadow = true;
  scene.add(poster);
  parts.poster = poster;

  const posterFrame = new THREE.Group();
  rbox(posterFrame, 0.78, 0.03, 0.045, solid("#2b2b2b", 0.85), [0, 0.59, 0], [0, 0, 0], 0.004);
  rbox(posterFrame, 0.78, 0.03, 0.045, solid("#2b2b2b", 0.85), [0, -0.59, 0], [0, 0, 0], 0.004);
  rbox(posterFrame, 0.03, 1.21, 0.045, solid("#2b2b2b", 0.85), [-0.375, 0, 0], [0, 0, 0], 0.004);
  rbox(posterFrame, 0.03, 1.21, 0.045, solid("#2b2b2b", 0.85), [0.375, 0, 0], [0, 0, 0], 0.004);
  posterFrame.position.set(-3.78, 2.08, -1.45);
  posterFrame.rotation.y = Math.PI / 2;
  scene.add(posterFrame);

  return parts;
}
