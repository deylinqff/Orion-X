const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const gallery = document.getElementById('gallery');
const loadingMessage = document.getElementById('loading-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = encodeURIComponent(input.value.trim());
  if (!query) return;

  gallery.innerHTML = '';
  loadingMessage.style.display = 'block';

  try {
    const url = `https://corsproxy.io/?https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${query}&data=%7B%22options%22%3A%7B%22query%22%3A%22${query}%22%2C%22scope%22%3A%22pins%22%2C%22page_size%22%3A20%7D%2C%22context%22%3A%7B%7D%7D`;
    const res = await fetch(url);
    const json = await res.json();
    const results = json.resource_response.data.results;

    gallery.innerHTML = '';
    loadingMessage.style.display = 'none';

    results.forEach(item => {
      const img = document.createElement('img');
      img.src = item.images['474x'].url;
      img.alt = item.title || 'Imagen de Pinterest';
      img.addEventListener('click', () => descargarImagen(img.src));
      gallery.appendChild(img);
    });

    if (results.length === 0) {
      gallery.innerHTML = '<p>No se encontraron imágenes.</p>';
    }
  } catch (err) {
    console.error(err);
    loadingMessage.style.display = 'none';
    gallery.innerHTML = '<p>Error al obtener imágenes.</p>';
  }
});

function descargarImagen(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'imagen-pinterest.jpg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}