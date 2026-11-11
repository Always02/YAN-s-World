/* ------------------------------------------------------------------
   所有贴图都是 canvas 现画的，没有外部图片依赖。
   想换成真照片：把对应函数换成 drawImage(img, ...) 即可。
------------------------------------------------------------------- */

const SANS = '"PingFang SC","Microsoft YaHei","Segoe UI",sans-serif';
const SERIF = '"Songti SC","STSong","SimSun",Georgia,serif';

function grain(ctx, w, h, amount = 0.05) {
  const data = ctx.getImageData(0, 0, w, h);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(data, 0, 0);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ---------------- 显示器画面：黄昏航拍 ---------------- */
export function screenArt(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#2c3a4d");
  sky.addColorStop(0.42, "#7d6a70");
  sky.addColorStop(0.62, "#d99a72");
  sky.addColorStop(0.78, "#f0c08c");
  sky.addColorStop(1, "#8a6a58");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sun = ctx.createRadialGradient(w * 0.62, h * 0.63, 0, w * 0.62, h * 0.63, w * 0.2);
  sun.addColorStop(0, "rgba(255,240,208,0.95)");
  sun.addColorStop(0.35, "rgba(255,206,150,0.55)");
  sun.addColorStop(1, "rgba(255,190,130,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#f7e3c2";
  ctx.beginPath();
  ctx.arc(w * 0.62, h * 0.63, w * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // 远山三层
  const layers = [
    ["rgba(58,58,70,0.55)", 0.70, 0.055],
    ["rgba(44,44,54,0.75)", 0.76, 0.04],
    ["rgba(30,30,38,0.92)", 0.84, 0.03]
  ];
  layers.forEach(([color, base, amp], idx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 6) {
      const y = h * base - Math.sin(x * 0.012 + idx * 2.1) * h * amp - Math.sin(x * 0.031 + idx) * h * amp * 0.45;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  });

  // 鸟群
  ctx.strokeStyle = "rgba(36,32,34,0.6)";
  ctx.lineWidth = 2;
  [[0.2, 0.26], [0.26, 0.22], [0.32, 0.28], [0.4, 0.2]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(w * x - 10, h * y);
    ctx.quadraticCurveTo(w * x - 4, h * y - 6, w * x, h * y);
    ctx.quadraticCurveTo(w * x + 4, h * y - 6, w * x + 10, h * y);
    ctx.stroke();
  });

  ctx.fillStyle = "rgba(247,240,228,0.9)";
  ctx.font = `500 ${Math.round(w * 0.028)}px ${SANS}`;
  ctx.textAlign = "right";
  ctx.fillText("20:41  ·  FLIGHT 047", w - w * 0.06, h - h * 0.08);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(247,240,228,0.55)";
  ctx.font = `400 ${Math.round(w * 0.022)}px ${SANS}`;
  ctx.fillText("ALT 300M", w * 0.06, h - h * 0.08);
}

/* ---------------- 地毯 ---------------- */
export function rugArt(ctx, w, h) {
  ctx.fillStyle = "#d9c3a3";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(160,96,66,0.55)";
  ctx.fillRect(0, 0, w, 18);
  ctx.fillRect(0, h - 18, w, 18);
  ctx.fillRect(0, 0, 18, h);
  ctx.fillRect(w - 18, 0, 18, h);

  ctx.strokeStyle = "rgba(160,96,66,0.35)";
  ctx.lineWidth = 6;
  ctx.strokeRect(34, 34, w - 68, h - 68);

  ctx.strokeStyle = "rgba(160,96,66,0.2)";
  ctx.lineWidth = 3;
  ctx.strokeRect(54, 54, w - 108, h - 108);

  // 中央菱形
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.strokeStyle = "rgba(154,94,66,0.4)";
  ctx.lineWidth = 6;
  for (let i = 0; i < 3; i++) {
    const s = 160 - i * 44;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.62);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s * 0.62);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(170,108,78,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 62, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 织纹
  ctx.globalAlpha = 0.12;
  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = y % 8 === 0 ? "#8a6748" : "#f6ead8";
    ctx.fillRect(0, y, w, 1);
  }
  ctx.globalAlpha = 1;
  grain(ctx, w, h, 0.08);
}

/* ---------------- 左墙大海报：See You Space Cowboy ---------------- */
export function posterArt(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#1d2a3c");
  g.addColorStop(0.55, "#3d4054");
  g.addColorStop(1, "#8a5a4a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 星
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h * 0.55;
    ctx.fillStyle = `rgba(255,246,226,${0.15 + Math.random() * 0.5})`;
    ctx.fillRect(x, y, 1.6, 1.6);
  }

  // 落日
  const sun = ctx.createRadialGradient(w / 2, h * 0.62, 0, w / 2, h * 0.62, w * 0.42);
  sun.addColorStop(0, "rgba(255,226,170,0.95)");
  sun.addColorStop(0.4, "rgba(240,160,110,0.5)");
  sun.addColorStop(1, "rgba(240,160,110,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#f6ddb2";
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.62, w * 0.19, 0, Math.PI * 2);
  ctx.fill();

  // 前景地面
  ctx.fillStyle = "#241f26";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.78);
  ctx.quadraticCurveTo(w * 0.5, h * 0.7, w, h * 0.8);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // 一个站着的人影
  ctx.fillStyle = "#1b1720";
  const px = w * 0.34;
  const py = h * 0.78;
  ctx.beginPath();
  ctx.ellipse(px, py - 118, 20, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(px - 22, py - 96, 44, 96);
  ctx.beginPath();
  ctx.ellipse(px, py - 160, 13, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(246,238,222,0.92)";
  ctx.textAlign = "center";
  ctx.font = `400 ${Math.round(w * 0.052)}px ${SERIF}`;
  ctx.fillText("SEE YOU", w / 2, h * 0.14);
  ctx.fillText("SPACE COWBOY", w / 2, h * 0.205);
  ctx.fillStyle = "rgba(246,238,222,0.45)";
  ctx.font = `400 ${Math.round(w * 0.026)}px ${SANS}`;
  ctx.fillText("SOMETIMES THE ONLY WAY HOME", w / 2, h * 0.26);
  ctx.fillText("IS TO KEEP DRIFTING", w / 2, h * 0.29);

  grain(ctx, w, h, 0.04);
}

/* ---------------- 毛毡板小卡 ---------------- */

export function cardNightHeron(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#7f8b94");
  g.addColorStop(0.45, "#c9b79c");
  g.addColorStop(1, "#a5825f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,240,212,0.5)";
  ctx.beginPath();
  ctx.arc(w * 0.72, h * 0.3, w * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // 水面
  ctx.fillStyle = "rgba(140,150,140,0.5)";
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  ctx.strokeStyle = "rgba(255,245,225,0.4)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.1 + i * 12, h * (0.78 + i * 0.035));
    ctx.lineTo(w * 0.55 + i * 20, h * (0.78 + i * 0.035));
    ctx.stroke();
  }

  // 芦苇
  ctx.strokeStyle = "#6c6a52";
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const x = w * (0.06 + i * 0.035);
    ctx.beginPath();
    ctx.moveTo(x, h * 0.95);
    ctx.quadraticCurveTo(x + 6, h * 0.6, x + 2, h * 0.4 + i * 6);
    ctx.stroke();
  }

  // 夜鹭剪影（矮壮身体、细长颈、粗喙）
  const bx = w * 0.56;
  const by = h * 0.64;
  ctx.fillStyle = "#3b3833";
  ctx.beginPath();
  ctx.ellipse(bx, by, w * 0.15, h * 0.115, -0.18, 0, Math.PI * 2);
  ctx.fill();
  // 细长颈
  ctx.beginPath();
  ctx.moveTo(bx - w * 0.05, by - h * 0.02);
  ctx.quadraticCurveTo(bx - w * 0.13, by - h * 0.12, bx - w * 0.115, by - h * 0.2);
  ctx.lineTo(bx - w * 0.075, by - h * 0.205);
  ctx.quadraticCurveTo(bx - w * 0.085, by - h * 0.12, bx - w * 0.01, by - h * 0.03);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(bx - w * 0.095, by - h * 0.205, w * 0.045, h * 0.05, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // 喙
  ctx.beginPath();
  ctx.moveTo(bx - w * 0.135, by - h * 0.205);
  ctx.lineTo(bx - w * 0.25, by - h * 0.17);
  ctx.lineTo(bx - w * 0.135, by - h * 0.16);
  ctx.closePath();
  ctx.fill();
  // 腿
  ctx.strokeStyle = "#3b3833";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bx + w * 0.03, by + h * 0.09);
  ctx.lineTo(bx + w * 0.02, h * 0.82);
  ctx.moveTo(bx + w * 0.08, by + h * 0.09);
  ctx.lineTo(bx + w * 0.09, h * 0.82);
  ctx.stroke();

  ctx.fillStyle = "rgba(40,38,34,0.8)";
  ctx.font = `400 ${Math.round(w * 0.045)}px ${SANS}`;
  ctx.fillText("夜鹭 · 26.11.11", w * 0.06, h * 0.14);
}

export function cardSunflower(ctx, w, h) {
  ctx.fillStyle = "#f0e2c4";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#5f7a55";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h);
  ctx.quadraticCurveTo(w * 0.46, h * 0.75, w * 0.5, h * 0.55);
  ctx.stroke();

  ctx.fillStyle = "#6f8a5e";
  ctx.beginPath();
  ctx.ellipse(w * 0.3, h * 0.78, w * 0.13, h * 0.05, -0.5, 0, Math.PI * 2);
  ctx.fill();

  const cx = w * 0.5;
  const cy = h * 0.42;
  const petals = 16;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.fillStyle = i % 2 ? "#e2b455" : "#d7a747";
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.15, w * 0.045, h * 0.085, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#7a5433";
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(40,28,18,0.45)";
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * w * 0.085;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function cardTequila(ctx, w, h) {
  ctx.fillStyle = "#f5e7cd";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(226,180,85,0.28)";
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.36, w * 0.28, 0, Math.PI * 2);
  ctx.fill();

  const gx = w * 0.44;
  const gw = w * 0.26;
  const gy = h * 0.3;
  const gh = h * 0.46;

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(gx, gy, gw, gh);

  const drink = ctx.createLinearGradient(0, gy + gh * 0.15, 0, gy + gh);
  drink.addColorStop(0, "#f6c74f");
  drink.addColorStop(0.45, "#ef8f3a");
  drink.addColorStop(1, "#c1442c");
  ctx.fillStyle = drink;
  ctx.fillRect(gx + 3, gy + gh * 0.16, gw - 6, gh * 0.84 - 3);

  ctx.strokeStyle = "rgba(120,110,95,0.45)";
  ctx.lineWidth = 3;
  ctx.strokeRect(gx, gy, gw, gh);

  // 柠檬片
  ctx.fillStyle = "#d9c25a";
  ctx.beginPath();
  ctx.arc(gx + gw * 0.86, gy + 2, w * 0.075, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f7efc9";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(gx + gw * 0.86, gy + 2);
    ctx.lineTo(gx + gw * 0.86 + Math.cos(a) * w * 0.065, gy + 2 + Math.sin(a) * w * 0.065);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(60,50,40,0.75)";
  ctx.font = `400 ${Math.round(w * 0.042)}px ${SANS}`;
  ctx.fillText("tequila sunrise", w * 0.08, h * 0.9);
}

export function cardBebop(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#1d2a3c");
  g.addColorStop(1, "#4a3a42");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = `rgba(255,246,226,${0.2 + Math.random() * 0.6})`;
    ctx.fillRect(Math.random() * w, Math.random() * h * 0.5, 2, 2);
  }

  ctx.fillStyle = "rgba(246,214,160,0.9)";
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.52, w * 0.17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#121018";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.72);
  ctx.lineTo(w, h * 0.78);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(246,238,222,0.9)";
  ctx.textAlign = "center";
  ctx.font = `400 ${Math.round(w * 0.07)}px ${SERIF}`;
  ctx.fillText("SEE YOU", w / 2, h * 0.16);
  ctx.fillText("SPACE COWBOY", w / 2, h * 0.235);
  ctx.font = `400 ${Math.round(w * 0.04)}px ${SANS}`;
  ctx.fillStyle = "rgba(246,238,222,0.55)";
  ctx.fillText("3, 2, 1, LET'S JAM", w / 2, h * 0.9);
}

export function cardAerial(ctx, w, h) {
  ctx.fillStyle = "#7f8a5f";
  ctx.fillRect(0, 0, w, h);

  const fields = ["#8c9a68", "#77865c", "#a0a06b", "#6d7d55", "#b0a273"];
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = fields[i % fields.length];
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    for (let p = 0; p < 4; p++) {
      ctx.lineTo(Math.random() * w, Math.random() * h);
    }
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = "#c8c2a4";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-10, h * 0.25);
  ctx.bezierCurveTo(w * 0.35, h * 0.32, w * 0.4, h * 0.75, w + 10, h * 0.82);
  ctx.stroke();

  ctx.strokeStyle = "rgba(240,235,215,0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, h * 0.25);
  ctx.bezierCurveTo(w * 0.35, h * 0.32, w * 0.4, h * 0.75, w + 10, h * 0.82);
  ctx.stroke();

  ctx.fillStyle = "#f2ede0";
  ctx.beginPath();
  ctx.arc(w * 0.62, h * 0.55, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(242,237,224,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.62, h * 0.55);
  ctx.lineTo(w * 0.82, h * 0.4);
  ctx.stroke();

  ctx.fillStyle = "rgba(250,247,238,0.9)";
  ctx.font = `400 ${Math.round(w * 0.045)}px ${SANS}`;
  ctx.fillText("300m · 河湾", w * 0.07, h * 0.12);
}

export function noteSeeds(ctx, w, h) {
  ctx.fillStyle = "#f3e3a8";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(0, 0, w, h * 0.12);

  ctx.fillStyle = "rgba(70,60,40,0.8)";
  ctx.font = `400 ${Math.round(w * 0.12)}px ${SERIF}`;
  ctx.fillText("瓜子", w * 0.1, h * 0.38);

  ctx.fillStyle = "rgba(70,60,40,0.5)";
  ctx.font = `400 ${Math.round(w * 0.05)}px ${SANS}`;
  ctx.fillText("一小把，慢慢嗑", w * 0.1, h * 0.55);

  for (let i = 0; i < 7; i++) {
    ctx.save();
    ctx.translate(w * (0.15 + i * 0.1), h * (0.75 + (i % 2) * 0.09));
    ctx.rotate(-0.5 + i * 0.3);
    ctx.fillStyle = "#4a3a28";
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.028, w * 0.013, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ---------------- 锈湖明信片 ---------------- */
export function postcardArt(ctx, w, h) {
  ctx.fillStyle = "#1c2726";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(214, 197, 160, 0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, w - 36, h - 36);

  ctx.fillStyle = "rgba(214, 197, 160, 0.75)";
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.32, w * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#efe3c8";
  ctx.textAlign = "center";
  ctx.font = `italic 400 ${Math.round(w * 0.055)}px Georgia, "Songti SC", serif`;
  ctx.fillText("The past is never dead.", w / 2, h * 0.58);
  ctx.fillText("It's not even past.", w / 2, h * 0.66);

  ctx.fillStyle = "rgba(214, 197, 160, 0.5)";
  ctx.font = `400 ${Math.round(w * 0.03)}px "PingFang SC", sans-serif`;
  ctx.fillText("RUSTY LAKE · 1964", w / 2, h * 0.82);

  ctx.strokeStyle = "rgba(214, 197, 160, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.72);
  ctx.lineTo(w * 0.7, h * 0.72);
  ctx.stroke();
}

/* ---------------- 雾林明信片 ---------------- */
export function postcardForest(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#c8cec6");
  sky.addColorStop(0.55, "#aab4ac");
  sky.addColorStop(1, "#7f8c82");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(w * (0.15 + i * 0.18), h * (0.3 + (i % 2) * 0.08), w * 0.22, h * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function pine(x, y, scale, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < 4; i++) {
      const s = scale * (1 - i * 0.16);
      ctx.beginPath();
      ctx.moveTo(x, y - s * (1.1 - i * 0.22));
      ctx.lineTo(x - s * 0.52, y - s * (0.5 - i * 0.1));
      ctx.lineTo(x + s * 0.52, y - s * (0.5 - i * 0.1));
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "rgba(60,60,52,0.75)";
    ctx.fillRect(x - 2, y - 2, 4, h * 0.02);
  }

  const layers = [
    ["rgba(120,132,120,0.55)", 0.78, 0.55],
    ["rgba(85,98,86,0.75)", 0.86, 0.72],
    ["rgba(52,64,56,0.9)", 0.95, 0.9]
  ];
  layers.forEach(([color, base, scale], li) => {
    for (let i = 0; i < 9; i++) {
      pine(w * (0.05 + i * 0.11) + li * 8, h * base, h * 0.16 * scale, color);
    }
  });

  ctx.fillStyle = "rgba(247, 240, 226, 0.92)";
  ctx.font = `400 ${Math.round(w * 0.07)}px "Songti SC", Georgia, serif`;
  ctx.fillText("雾 林", w * 0.08, h * 0.2);
  ctx.font = `400 ${Math.round(w * 0.036)}px "PingFang SC", sans-serif`;
  ctx.fillStyle = "rgba(247, 240, 226, 0.7)";
  ctx.fillText("助君出重围", w * 0.08, h * 0.28);
}

/* ---------------- 黑胶封套 ---------------- */
export function sleeveArt(title, artist, bg, fg) {
  return (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88);

    ctx.fillStyle = fg;
    ctx.font = `400 ${Math.round(w * 0.13)}px ${SERIF}`;
    ctx.textAlign = "center";
    ctx.fillText(title, w / 2, h * 0.44);

    ctx.font = `400 ${Math.round(w * 0.055)}px ${SANS}`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(artist, w / 2, h * 0.56);

    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.66);
    ctx.lineTo(w * 0.7, h * 0.66);
    ctx.stroke();

    grain(ctx, w, h, 0.05);
  };
}
