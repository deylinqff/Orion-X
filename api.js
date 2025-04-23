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

  const resultados = [];

  try {
    // Buscar en YouTube
    const ytRes = await fetch(`https://api.neoxr.eu/api/yts?q=${encodeURIComponent(query)}&apikey=GataDios`);
    const ytData = await ytRes.json();

    if (ytData.status && ytData.data?.length) {
      const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const queryNorm = normalizar(query);

      const filtrados = ytData.data
        .map(video => {
          const tituloNorm = normalizar(video.title);
          const autorNorm = normalizar(video.author.name);

          let score = 0;
          if (tituloNorm.includes(queryNorm)) score += 2;
          if (autorNorm.includes(queryNorm)) score += 1;

          const keywords = queryNorm.split(/\s+/);
          for (let palabra of keywords) {
            if (tituloNorm.includes(palabra)) score += 1;
            if (autorNorm.includes(palabra)) score += 0.5;
          }

          return { video, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      filtrados.forEach(({ video }) => {
        resultados.push({
          title: video.title,
          artist: video.author.name,
          channel: video.author.channel || video.author.name,
          verified: video.author.verified,
          thumbnail: video.thumbnail,
          source: "YouTube",
          url: video.url
        });
      });
    }

    // Buscar en Spotify
    const spRes = await fetch(`https://archive-ui.tanakadomp.biz.id/download/spotify?url=${encodeURIComponent(query)}`);
    const spData = await spRes.json();

    if (spData?.status && spData.data?.url) {
      resultados.push({
        title: spData.data.title,
        artist: spData.data.artists?.join(", ") || "Desconocido",
        channel: "Spotify",
        verified: false,
        thumbnail: spData.data.thumbnail,
        source: "Spotify",
        url: spData.data.url,
        isSpotify: true
      });
    }

    loadingMessage.style.display = "none";

    if (resultados.length === 0) {
      musicList.innerHTML = `<p>No se encontraron resultados relevantes.</p>`;
      return;
    }

    resultados.forEach((item) => {
      const card = document.createElement("div");
      card.className = "music-card";

      const image = document.createElement("img");
      image.src = item.thumbnail;

      const info = document.createElement("div");
      info.className = "music-info";

      const title = document.createElement("div");
      title.className = "music-title";
      title.textContent = item.title;

      const artist = document.createElement("div");
      artist.className = "music-artist";
      artist.textContent = item.artist;

      const channel = document.createElement("div");
      channel.className = "music-channel";
      channel.textContent = `Canal: ${item.channel}`;
      if (item.verified) channel.textContent += " ✔️";

      const playBtn = document.createElement("button");
      playBtn.className = "play-button";
      playBtn.textContent = "Reproducir audio";

      playBtn.onclick = async () => {
        playBtn.textContent = "Cargando...";
        try {
          if (item.isSpotify) {
            audioPlayer.src = item.url;
            audioPlayer.style.display = "block";
            audioPlayer.play();
            playBtn.textContent = "Reproducir audio";
          } else {
            const audioRes = await fetch(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(item.url)}&type=audio&quality=128kbps&apikey=GataDios`);
            const audioData = await audioRes.json();
            if (audioData?.data?.url) {
              audioPlayer.src = audioData.data.url;
              audioPlayer.style.display = "block";
              audioPlayer.play();
              playBtn.textContent = "Reproducir audio";
            } else {
              playBtn.textContent = "Error";
              alert("No se pudo obtener el audio.");
            }
          }
        } catch (err) {
          console.error(err);
          playBtn.textContent = "Error";
          alert("Ocurrió un error al reproducir la música.");
        }
      };

      const videoBtn = document.createElement("button");
      videoBtn.className = "download-button";
      videoBtn.textContent = "Descargar video";

      videoBtn.onclick = async () => {
        if (item.isSpotify) {
          alert("No se puede descargar desde Spotify.");
          return;
        }

        videoBtn.textContent = "Buscando...";
        for (let api of videoApis) {
          try {
            const res = await fetch(api(item.url));
            const json = await res.json();
            const videoUrl = json?.data?.dl || json?.result?.download?.url || json?.downloads?.url || json?.data?.download?.url;
            if (videoUrl) {
              const a = document.createElement("a");
              a.href = videoUrl;
              a.download = `${item.title}.mp4`;
              a.click();
              videoBtn.textContent = "Descargar video";
              return;
            }
          } catch (e) {
            console.warn("API falló:", e.message);
          }
        }
        videoBtn.textContent = "Error";
        alert("No se pudo obtener el video.");
      };

      info.appendChild(title);
      info.appendChild(artist);
      info.appendChild(channel);
      card.appendChild(image);
      card.appendChild(info);
      card.appendChild(playBtn);
      card.appendChild(videoBtn);
      musicList.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    loadingMessage.style.display = "none";
    musicList.innerHTML = `<p>Ocurrió un error al buscar.</p>`;
  }
});
