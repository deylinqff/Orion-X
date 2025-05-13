// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAGklawj-Vi7zugVTDoTobNTyK8TxE5O1U",
  authDomain: "orion-3e201.firebaseapp.com",
  projectId: "orion-3e201",
  storageBucket: "orion-3e201.firebasestorage.app",
  messagingSenderId: "203473415842",
  appId: "1:203473415842:web:e4bb8cdfd49c1c3ff731fb",
  measurementId: "G-PPCLGZNJ3S"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});