import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/* ------------------------------------------------------------------
   配色：低饱和、暖纸感。想整体换色调，改这里就够了。
------------------------------------------------------------------- */
export const C = {
  paper: "#f7f2e8",
  floor: "#e4d3b8",
  plinth: "#d2bfa2",
  wallBack: "#f5ead8",
  wallSide: "#ece0c9",
  trim: "#d7c2a4",

  wood: "#c99b6d",
  woodDark: "#8a6748",
  woodLight: "#e2c59c",

  sage: "#7d8a6c",
  olive: "#66735a",
  cream: "#f0e3cd",
  clay: "#c07a5c",
  mustard: "#d3aa62",
  teal: "#6d8b86",
  rust: "#b96a4c",

  ink: "#2b2a26",
  coal: "#232323",
  white: "#fbf7ef",
  leaf: "#5f7a55",
  leafDark: "#4a6244"
};

export const FLOOR_Y = 0.09;

export function solid(color, roughness = 0.9, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

export function glassy(color, opacity = 0.3, roughness = 0.12) {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    roughness,
    metalness: 0,
    depthWrite: false
  });
}

export function rboxGeo(w, h, d, radius = 0.03, segments = 4) {
  const safe = Math.max(0.001, Math.min(radius, Math.min(w, h, d) * 0.48));
  return new RoundedBoxGeometry(w, h, d, segments, safe);
}

export function boxGeo(w, h, d) {
  return new THREE.BoxGeometry(w, h, d);
}

export function cylGeo(rTop, rBottom, h, segments = 24) {
  return new THREE.CylinderGeometry(rTop, rBottom, h, segments);
}

export function sphereGeo(r, w = 16, h = 12) {
  return new THREE.SphereGeometry(r, w, h);
}

/** 往父级里塞一个 mesh，自动开阴影 */
export function add(parent, geo, material, pos = [0, 0, 0], rot = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/** 圆角盒子，最常用的一个 */
export function rbox(parent, w, h, d, material, pos, rot = [0, 0, 0], radius = 0.03) {
  return add(parent, rboxGeo(w, h, d, radius), material, pos, rot);
}

export function group(parent, pos = [0, 0, 0], rot = [0, 0, 0]) {
  const g = new THREE.Group();
  g.position.set(pos[0], pos[1], pos[2]);
  g.rotation.set(rot[0], rot[1], rot[2]);
  if (parent) parent.add(g);
  return g;
}

/** 画一张 canvas 贴图 */
export function canvasTexture(w, h, draw, opts = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  draw(ctx, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (opts.repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  tex.needsUpdate = true;
  return tex;
}

/** 家具底下的假投影，比实时阴影更柔和，也省性能 */
let blobTexture = null;
export function softShadow(size = 1, opacity = 0.32) {
  if (!blobTexture) {
    blobTexture = canvasTexture(128, 128, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(60,45,30,1)");
      g.addColorStop(0.45, "rgba(60,45,30,0.55)");
      g.addColorStop(1, "rgba(60,45,30,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      map: blobTexture,
      transparent: true,
      opacity,
      depthWrite: false
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 1;
  return mesh;
}

/** 给整个 group 打开阴影 */
export function castAll(object3d) {
  object3d.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return object3d;
}

export const clamp = THREE.MathUtils.clamp;
