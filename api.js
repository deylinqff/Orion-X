// JavaScript principal
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const musicList = document.getElementById("music-list");
const loadingMessage = document.getElementById("loading-message");
const audioPlayer = document.getElementById("audio-player");

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
  audioPlayer.style.display = "none";

  try {
    const ytPromise = fetch(`https://api.neoxr.eu/api/yts?q=${encodeURIComponent(query)}&apikey=GataDios`)
      .then(res => res.json())
      .then(data => (data.status && data.data) ? data.data.map(video => ({
        type: "youtube",
        title: video.title,
        author: video.author.name,
        thumbnail: video.thumbnail,
        url: video.url,
        verified: video.author.verified
      })) : []);

    const spotifyPromise = fetch(`https://archive-ui.tanakadomp.biz.id/search/spotify?query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => data?.data?.length ? data.data.map(track => ({
        type: "spotify",
        title: track.title,
        author: track.artist,
        thumbnail: track.thumbnail,
        url: track.url
      })) : []);

    const [ytResults, spResults] = await Promise.all([ytPromise, spotifyPromise]);

    const allResults = [...ytResults, ...spResults].slice(0, 20);
    loadingMessage.style.display = "none";

    if (!allResults.length) {
      musicList.innerHTML = `<p>No se encontraron resultados.</p>`;
      return;
    }

    allResults.forEach((track) => {
      const card = document.createElement("div");
      card.className = "music-card";

      const image = document.createElement("img");
      image.src = track.thumbnail;

      const info = document.createElement("div");
      info.className = "music-info";

      const title = document.createElement("div");
      title.className = "music-title";
      title.textContent = track.title;

      const artist = document.createElement("div");
      artist.className = "music-artist";
      artist.textContent = track.author;

      info.appendChild(title);
      info.appendChild(artist);

      if (track.verified) {
        const verified = document.createElement("div");
        verified.textContent = "✔️ Canal verificado";
        info.appendChild(verified);
      }

      const playBtn = document.createElement("button");
      playBtn.className = "play-button";
      playBtn.textContent = "Reproducir audio";

      playBtn.onclick = async () => {
        playBtn.textContent = "Cargando...";
        try {
          let audioUrl = null;
          if (track.type === "youtube") {
            const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(track.url)}&type=audio&quality=128kbps&apikey=GataDios`);
            const audioData = await res.json();
            audioUrl = audioData?.data?.url;
          } else if (track.type === "spotify") {
            const res = await fetch(`https://archive-ui.tanakadomp.biz.id/download/spotify?url=${track.url}`);
            const audioData = await res.json();
            audioUrl = audioData?.result;
          }

          if (audioUrl) {
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = "block";
            audioPlayer.play();
            playBtn.textContent = "Reproducir audio";
          } else {
            playBtn.textContent = "Error";
            alert("No se pudo obtener el audio.");
          }
        } catch (err) {
          console.error(err);
          playBtn.textContent = "Error";
          alert("Ocurrió un error al reproducir.");
        }
      };

      card.appendChild(image);
      card.appendChild(info);
      card.appendChild(playBtn);
      musicList.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    loadingMessage.style.display = "none";
    musicList.innerHTML = `<p>Error en la búsqueda.</p>`;
  }
});