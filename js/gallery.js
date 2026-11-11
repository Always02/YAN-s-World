// 相册数据：只保留清晰的鸟片，封面用 b4（溪边那只）
export const birdSets = [
  { title: "观鸟 01", photos: ["b4_1"] },
  { title: "观鸟 02", photos: ["b2_1", "b2_2", "b2_3"] },
  { title: "观鸟 03", photos: ["b6_1"] },
  { title: "观鸟 04", photos: ["b8_1"] },
  { title: "观鸟 05", photos: ["b5_1"] }
];

export const cameraPhotos = ["c1", "c2", "c3", "c4", "c5"];

export const birdSrc = (name) => `./assets/birds/${name}.jpg`;
export const cameraSrc = (name) => `./assets/camera/${name}.jpg`;
