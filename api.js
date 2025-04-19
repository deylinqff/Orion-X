const loadBtn = document.getElementById('load-btn');
const gallery = document.getElementById('gallery');

loadBtn.addEventListener('click', async () => {
  loadBtn.disabled = true;
  loadBtn.textContent = 'Cargando...';

  try {
    const res = await fetch('https://id.pinterest.com/resource/BaseSearchResource/get/?source_url');
    const data = await res.json();

    data.forEach(img => {
      const image = document.createElement('img');
      image.src = img.urls.regular;
      image.alt = img.alt_description || 'Imagen aleatoria';
      image.addEventListener('click', () => descargarImagen(image.src));
      gallery.appendChild(image);
    });
  } catch (err) {
    alert('Ocurrió un error al cargar imágenes.');
  } finally {
    loadBtn.disabled = false;
    loadBtn.textContent = 'Buscar más imágenes';
  }
});

function descargarImagen(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'imagen.jpg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}