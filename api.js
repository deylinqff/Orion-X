const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const gallery = document.getElementById('gallery');
const loadingMessage = document.getElementById('loading-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  gallery.innerHTML = '';
  loadingMessage.style.display = 'block';

  try {
    const res = await fetch(`/api/google-image?query=${encodeURIComponent(query)}`);
    const json = await res.json();
    loadingMessage.style.display = 'none';

    if (!json.images || json.images.length === 0) {
      gallery.innerHTML = '<p>No se encontraron imágenes.</p>';
      return;
    }

    json.images.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = query;
      img.addEventListener('click', () => descargarImagen(img.src));
      gallery.appendChild(img);
    });
  } catch (err) {
    console.error(err);
    loadingMessage.style.display = 'none';
    gallery.innerHTML = '<p>Error al obtener imágenes.</p>';
  }
});

function descargarImagen(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'imagen-google.jpg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}