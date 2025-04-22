const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const musicList = document.getElementById("music-list");
const loadingMessage = document.getElementById("loading-message");
const audioPlayer = document.getElementById("audio-player");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  musicList.innerHTML = "";
  loadingMessage.style.display = "block";
  audioPlayer.style.display = "none";

  try {
    const searchResults = await fetch(`https://api.neoxr.eu/api/yts?query=${encodeURIComponent(query)}&apikey=GataDios`);
    const data = await searchResults.json();
    loadingMessage.style.display = "none";

    if (!data.status || !data.data || data.data.length === 0) {
      musicList.innerHTML = `<p>No se encontraron resultados.</p>`;
      return;
    }

    data.data.slice(0, 8).forEach(video => {
      const card = document.createElement("div");
      card.className = "music-card";

      const image = document.createElement("img");
      image.src = video.thumbnail;

      const info = document.createElement("div");
      info.className = "music-info";

      const title = document.createElement("div");
      title.className = "music-title";
      title.textContent = video.title;

      const artist = document.createElement("div");
      artist.className = "music-artist";
      artist.textContent = video.author.name;

      const playBtn = document.createElement("button");
      playBtn.className = "play-button";
      playBtn.textContent = "Reproducir";
      playBtn.onclick = async () => {
        playBtn.textContent = "Cargando...";
        try {
          const audioRes = await fetch(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(video.url)}&type=audio&quality=128kbps&apikey=GataDios`);
          const audioData = await audioRes.json();
          if (audioData && audioData.data && audioData.data.url) {
            audioPlayer.src = audioData.data.url;
            audioPlayer.style.display = "block";
            audioPlayer.play();
            playBtn.textContent = "Reproducir";
          } else {
            playBtn.textContent = "Error";
            alert("No se pudo obtener el audio.");
          }
        } catch (err) {
          console.error(err);
          playBtn.textContent = "Error";
          alert("Ocurrió un error al reproducir la música.");
        }
      };

      info.appendChild(title);
      info.appendChild(artist);
      card.appendChild(image);
      card.appendChild(info);
      card.appendChild(playBtn);
      musicList.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    loadingMessage.style.display = "none";
    musicList.innerHTML = `<p>Ocurrió un error al buscar.</p>`;
  }
});