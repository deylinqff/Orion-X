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

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  musicList.innerHTML = "";
  loadingMessage.style.display = "block";

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

    const normalizar = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const queryNorm = normalizar(query);

    const resultadosFiltrados = data.resultado
      .map(video => {
        const tituloNorm = normalizar(video.titulo);
        const canalNorm = normalizar(video.canal);

        let score = 0;
        if (tituloNorm.includes(queryNorm)) score += 2;
        if (canalNorm.includes(queryNorm)) score += 1;

        const keywords = queryNorm.split(/\s+/);
        for (let palabra of keywords) {
          if (tituloNorm.includes(palabra)) score += 1;
          if (canalNorm.includes(palabra)) score += 0.5;
        }

        return { video, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 1000);

    if (resultadosFiltrados.length === 0) {
      musicList.innerHTML = `<p>No se encontraron resultados relevantes.</p>`;
      return;
    }

    const truncate = (text, maxLength = 30) =>
      text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

    resultadosFiltrados.forEach(({ video }) => {
      const card = document.createElement("div");
      card.className = "music-card";
      card.style.cursor = "pointer"; // Indicate it's clickable

      const image = document.createElement("img");
      image.src = video.miniatura;
      image.style.cursor = "pointer"; // Indicate it's clickable

      const info = document.createElement("div");
      info.className = "music-info";

      const title = document.createElement("div");
      title.className = "music-title";
      title.textContent = truncate(video.titulo);

      const artist = document.createElement("div");
      artist.className = "music-artist";
      artist.textContent = truncate(video.canal);

      const channel = document.createElement("div");

      const openReproductor = async () => {
        let audioUrl;
        for (let api of audioApis) {
          try {
            const res = await fetch(api(video.url));
            const json = await res.json();
            audioUrl = json?.result?.url || json?.data?.url || json?.data?.dl;
            if (audioUrl) {
              window.open(`reproductor.html?audioUrl=${encodeURIComponent(audioUrl)}&title=${encodeURIComponent(video.titulo)}`, '_blank');
              return;
            }
          } catch (e) {
            console.warn("API audio falló:", e.message);
          }
        }
        alert("No se pudo obtener la URL del audio para reproducir.");
      };

      card.onclick = openReproductor;
      image.onclick = openReproductor;

      info.appendChild(title);
      info.appendChild(artist);
      info.appendChild(channel);
      card.appendChild(image);
      card.appendChild(info);
      musicList.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    loadingMessage.style.display = "none";
    musicList.innerHTML = `<p>Ocurrió un error al buscar.</p>`;
  }
});
