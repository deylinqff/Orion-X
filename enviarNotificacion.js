// Requiere Node.js 18+ o usar node-fetch si es menor
const fetch = require('node-fetch');

const FCM_SERVER_KEY = 'AAAA...'; // <- tu Server Key secreta de Firebase
const DEVICE_TOKEN = 'BNRk3xccTQDDCTjysLDBbD_Gf-JAkjuLhj896zxM5HSB3pZ4n_HvG1Tndczycs6LC3L-TTOqXD_WrAtjzwzzdWo';

const mensaje = {
  to: DEVICE_TOKEN,
  notification: {
    title: '¡Hola!',
    body: 'Esta es una notificación enviada desde tu backend.',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968945.png'
  },
  data: {
    url: 'https://tuweb.com/alguna-ruta'
  }
};

fetch('https://fcm.googleapis.com/fcm/send', {
  method: 'POST',
  headers: {
    'Authorization': 'key=' + FCM_SERVER_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(mensaje)
})
  .then(res => res.json())
  .then(json => console.log('Respuesta de FCM:', json))
  .catch(err => console.error('Error al enviar notificación:', err));