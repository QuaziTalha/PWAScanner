const startScanButton = document.getElementById("start-scan");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const resultDiv = document.getElementById("result");

startScanButton.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  video.srcObject = stream;
  video.hidden = false;

  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  function scan() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      fetchAPI(code.data);
      stopScan(stream);
    } else {
      requestAnimationFrame(scan);
    }
  }

  requestAnimationFrame(scan);
});

function stopScan(stream) {
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
  video.hidden = true;
}

async function fetchAPI(qrCode) {
  try {
    const response = await fetch("https://example.com/api/getDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: qrCode }),
    });

    const data = await response.json();
    displayResult(data);
  } catch (error) {
    console.error("Error fetching API:", error);
    resultDiv.innerHTML = "<p>Error fetching data.</p>";
  }
}

function displayResult(data) {
  resultDiv.innerHTML = `
    <h2>Enrollment Details</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Gender:</strong> ${data.gender}</p>
    <p><strong>Class:</strong> ${data.class}</p>
    <p><strong>Age:</strong> ${data.age}</p>
    <p><strong>School:</strong> ${data.school_name}</p>
    <p><strong>Contact:</strong> ${data.contact_number}</p>
    <p><strong>Order ID:</strong> ${data.order_id}</p>
  `;
  resultDiv.classList.remove("hidden");
}
