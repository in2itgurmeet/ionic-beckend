const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure to add the GOOGLE_APPLICATION_CREDENTIALS path to your .env file
// or initialize with a serviceAccount key object directly if you prefer.
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    console.log("Firebase Admin initialized successfully.");
  } else {
    console.warn("WARNING: GOOGLE_APPLICATION_CREDENTIALS not found. Firebase Push Notifications will not work.");
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!admin.apps.length || !fcmToken) return false;

  const message = {
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK', 
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent push notification:', response);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

module.exports = {
  sendPushNotification
};
