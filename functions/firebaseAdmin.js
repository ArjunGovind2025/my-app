const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  const serviceAccount = require("./ai-d-ce511-firebase-adminsdk-nl1bl-60c4d6b961.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
