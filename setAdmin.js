const admin = require('firebase-admin');

const serviceAccount = require('./places-to-stay-730e1-firebase-adminsdk-kyrv6-498f5dcce3.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const setAdmin = async () => {
    const email = 'admin@plc.com';
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        console.log(`Admin privileges granted to ${email}`);
    } catch (error) {
        console.error('Error setting admin privileges:', error);
    }
};

setAdmin();
