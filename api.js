const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const musicList = document.getElementById("music-list");
const loadingMessage = document.getElementById("loading-message");

async function searchSongs(query) {
  searchInput.value = query;
  musicList.innerHTML = "";
  loadingMessage.style.display = "block";

  const event = new Event("submit", { bubbles: true, cancelable: true });
  searchForm.dispatchEvent(event);
}

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

let currentVideoUrl = ""; // Guardar el URL del video seleccionado

// Para usar esto, llama setCurrentVideoUrl desde otro archivo
function setCurrentVideoUrl(url) {
  currentVideoUrl = url;
}

async function downloadSelected() {
  const selectedAudio = document.querySelector("input[name='audio_format']:checked")?.value;
  const selectedVideo = document.querySelector("input[name='video_format']:checked")?.value;

  if (!currentVideoUrl) {
    alert("No hay video seleccionado.");
    return;
  }

  let downloadUrl = null;

  if (selectedAudio) {
    for (let api of audioApis) {
      try {
        const res = await fetch(api(currentVideoUrl));
        const json = await res.json();
        downloadUrl = json?.result?.url || json?.data?.url || json?.data?.dl;
        if (downloadUrl) break;
      } catch (e) {
        console.warn("Error audio:", e.message);
      }
    }
  }

  if (!downloadUrl && selectedVideo) {
    for (let api of videoApis) {
      try {
        const res = await fetch(api(currentVideoUrl));
        const json = await res.json();
        downloadUrl = json?.data?.dl || json?.result?.download?.url || json?.downloads?.url || json?.data?.download?.url;
        if (downloadUrl) break;
      } catch (e) {
        console.warn("Error video:", e.message);
      }
    }
  }

  if (downloadUrl) {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "descarga";
    a.click();
  } else {
    alert("No se pudo obtener la descarga.");
  }
}

async function playCurrentMedia(audio = true) {
  const player = document.getElementById("audio-player") || document.createElement("audio");
  player.style.display = "block";

  let mediaUrl = null;
  const apis = audio ? audioApis : videoApis;

  for (let api of apis) {
    try {
      const res = await fetch(api(currentVideoUrl));
      const json = await res.json();
      mediaUrl = json?.result?.url || json?.data?.url || json?.data?.dl;
      if (mediaUrl) break;
    } catch (e) {
      console.warn("Error al reproducir:", e.message);
    }
  }

  if (mediaUrl) {
    player.src = mediaUrl;
    player.play();
  } else {
    alert("No se pudo reproducir el medio.");
  }
}

window.setCurrentVideoUrl = setCurrentVideoUrl;
window.downloadSelected = downloadSelected;
window.playCurrentMedia = playCurrentMedia;