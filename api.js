const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const musicList = document.getElementById("music-list");
const loadingMessage = document.getElementById("loading-message");
const playerSection = document.getElementById("player-section");
const videoTitle = document.getElementById("video-title");
const audioPlayer = document.getElementById("audio-player");
const videoPlayer = document.getElementById("video-player");
const modal = document.getElementById("download-modal");
const modalOptions = document.getElementById("modal-options");
const closeModalBtn = document.getElementById("close-modal");

let currentVideo = null;

const audioApis = [
  (url) => `https://api.siputzx.my.id/api/d/ytmp3?url=${url}`,
  (url) => `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${url}`
];

const videoApis = [
  (url) => `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
  (url) => `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${url}`,
  (url) => `https://axeel.my.id/api/download/video?url=${encodeURIComponent(url)}`,
  (url) => `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`
];

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  musicList.innerHTML = "";
  loadingMessage.style.display = "block";
  playerSection.style.display = "none";

  try {
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = `https://Ytumode-api.vercel.app/api/search?q=${encodeURIComponent(query)}`;
    const searchResults = await fetch(proxyUrl + encodeURIComponent(apiUrl));
    const data = await searchResults.json();
    loadingMessage.style.display = "none";

    if (!data.status || !data.resultado || data.resultado.length === 0) {
      musicList.innerHTML = `<p>No se encontraron resultados.</p>`;
      return;
    }

    data.resultado.forEach(video => {
      const card = document.createElement("div");
      card.className = "music-card";

      const image = document.createElement("img");
      image.src = video.miniatura;

      const info = document.createElement("div");
      info.className = "music-info";

      const title = document.createElement("div");
      title.className = "music-title";
      title.textContent = video.titulo;

      const artist = document.createElement("div");
      artist.className = "music-artist";
      artist.textContent = video.canal;

      const playBtn = document.createElement("button");
      playBtn.className = "play-button";
      playBtn.textContent = "Reproducir";

      const downloadBtn = document.createElement("button");
      downloadBtn.className = "download-button";
      downloadBtn.textContent = "Descargar";

      playBtn.onclick = async () => {
        videoTitle.textContent = video.titulo;
        playerSection.style.display = "block";
        audioPlayer.style.display = "block";
        videoPlayer.style.display = "none";

        for (let api of audioApis) {
          try {
            const res = await fetch(api(video.url));
            const json = await res.json();
            const audioUrl = json?.result?.url || json?.data?.url || json?.data?.dl;
            if (audioUrl) {
              audioPlayer.src = audioUrl;
              audioPlayer.play();
              return;
            }
          } catch (e) {}
        }

        alert("No se pudo reproducir el audio.");
      };

      downloadBtn.onclick = () => {
        currentVideo = video;
        openDownloadModal(video.url, video.titulo);
      };

      info.appendChild(title);
      info.appendChild(artist);
      card.appendChild(image);
      card.appendChild(info);
      card.appendChild(playBtn);
      card.appendChild(downloadBtn);
      musicList.appendChild(card);
    });

  } catch (err) {
    loadingMessage.style.display = "none";
    musicList.innerHTML = `<p>Ocurrió un error al buscar.</p>`;
  }
});

function openDownloadModal(url, title) {
  modalOptions.innerHTML = `
    <h3>Descargar como:</h3>
    <div class="option">
      <button onclick="downloadFile('audio', '128K')">Rápido (128K)</button>
      <button onclick="downloadFile('audio', 'mp3')">MP3 clásico</button>
    </div>
    <div class="option">
      <button onclick="downloadFile('video', '360p')">Video (360p)</button>
      <button onclick="downloadFile('video', '720p')">Calidad alta (720p)</button>
    </div>
  `;
  modal.style.display = "block";
}

function downloadFile(type, quality) {
  if (!currentVideo) return;
  const url = currentVideo.url;
  const title = currentVideo.titulo;

  const apis = type === "audio" ? audioApis : videoApis;

  for (let api of apis) {
    fetch(api(url))
      .then(res => res.json())
      .then(json => {
        const fileUrl = json?.result?.url || json?.data?.url || json?.data?.dl || json?.downloads?.url;
        if (fileUrl) {
          const a = document.createElement("a");
          a.href = fileUrl;
          a.download = `${title}.${type === "audio" ? "mp3" : "mp4"}`;
          a.click();
          modal.style.display = "none";
          return;
        }
      })
      .catch(err => console.warn("Descarga fallida:", err));
  }
}

closeModalBtn.onclick = () => {
  modal.style.display = "none";
};