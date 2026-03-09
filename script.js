letsdocument.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  const uploadInput = document.getElementById("upload");
  const downloadBtn = document.getElementById("download");
  const twitterBtn = document.getElementById("twitter-btn");
  const discordBtn = document.getElementById("discord-btn");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const frame = new Image();
  frame.src = "possible.png";
  frame.onload = () => {
    canvas.width = frame.width;
    canvas.height = frame.height;
  };

  uploadInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*")) {
      alert("Please upload an image file");
      return;
    }

    showLoadingState(canvas, ctx);

    try {
      const processedBlob = await removeBackground(file);
      const userImg = await blobToImage(processedBlob);
      drawInsideFrame(ctx, frame, userImg);
      downloadBtn.classList.remove("hidden");
      twitterBtn.classList.remove("hidden");
      discordBtn.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      alert("Processing failed, showing original image instead.");
      const userImg = await blobToImage(file);
      drawInsideFrame(ctx, frame, userImg);
      downloadBtn.classList.remove("hidden");
      twitterBtn.classList.remove("hidden");
      discordBtn.classList.remove("hidden");
    }
  });

  downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "framed-pfp.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  twitterBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "framed-pfp.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setTimeout(() => {
      window.open("https://twitter.com/settings/profile", "_blank");
    }, 800);
  });


  discordBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "framed-pfp.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setTimeout(() => {
      window.open("https://discord.com/settings/profile", "_blank");
    }, 800);
  });
}

function showLoadingState(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Processing Image...", canvas.width / 2, canvas.height / 2);
}

async function removeBackground(file) {
  const fd = new FormData();
  fd.append("image_file", file);
  fd.append("size", "auto");
  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": "hUe14sr4twspEPizea56JZnR" },
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.blob();
}

function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function drawInsideFrame(ctx, frameImg, userImg) {
  ctx.canvas.width = frameImg.width;
  ctx.canvas.height = frameImg.height;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Adjust this value: smaller = smaller image, larger = bigger image
  const scaleFactor = 0.65;

  const scale = Math.min(
    (frameImg.width * scaleFactor) / userImg.width,
    (frameImg.height * scaleFactor) / userImg.height
  );

  const drawW = userImg.width * scale;
  const drawH = userImg.height * scale;
  const offsetX = (frameImg.width - drawW) / 2;
  const offsetY = (frameImg.height - drawH) / 2;

  ctx.drawImage(userImg, offsetX, offsetY, drawW, drawH);
  ctx.drawImage(frameImg, 0, 0, frameImg.width, frameImg.height);
}