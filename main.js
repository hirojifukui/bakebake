import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' },
    audio: false
  });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      resolve();
    };
  });
}

async function runApp() {
  await setupCamera();

  const model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    { maxFaces: 1 }
  );

  async function detect() {
    const faces = await model.estimateFaces({ input: video });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (faces.length > 0) {
      const keypoints = faces[0].keypoints;

      // のっぺらぼう変換: 目、鼻、口を塗る
      const maskIndices = [
        [33, 133], // 右目
        [362, 263], // 左目
        [61, 291],  // 口
        [1]         // 鼻先
      ];

      for (const [start, end] of maskIndices) {
        ctx.beginPath();
        const pts = keypoints.slice(start, end + 1);
        pts.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 224, 189, 0.95)'; // 肌色
        ctx.fill();
      }
    }

    requestAnimationFrame(detect);
  }

  detect();
}

runApp();
