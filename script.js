const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');

async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }, // front-facing camera
      audio: false
    });
    video.srcObject = stream;
  } catch (err) {
    console.error("Error accessing camera:", err);
  }
}

async function loadModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js/models';
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
}

function drawLandmarks(landmarks) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const points = landmarks.positions;

  ctx.strokeStyle = 'lime';
  ctx.lineWidth = 2;

  // Draw facial points
  for (let pt of points) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

async function detectFaceParts() {
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 });

  setInterval(async () => {
    const result = await faceapi.detectSingleFace(video, options).withFaceLandmarks(true);
    if (result) {
      drawLandmarks(result.landmarks);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, 100);
}

(async () => {
  await loadModels();
  await setupCamera();

  video.addEventListener('play', () => {
    detectFaceParts();
  });
})();
