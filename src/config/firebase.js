const admin = require('firebase-admin');

let firebaseEnabled = false;

function initFirebase() {
  if (firebaseEnabled) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase credentials not set. Push notifications will be skipped.');
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey })
  });

  firebaseEnabled = true;
}

function getMessaging() {
  if (!firebaseEnabled) initFirebase();
  if (!firebaseEnabled) return null;
  return admin.messaging();
}

module.exports = { initFirebase, getMessaging };
