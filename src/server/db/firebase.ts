import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAbC6ncS6FQXo6WcmE4n9B-4oc9vJzcgSM",
  authDomain: "maca-deb33.firebaseapp.com",
  projectId: "maca-deb33",
  storageBucket: "maca-deb33.appspot.com",
  messagingSenderId: "299328119136",
  appId: "1:299328119136:web:8f38ddf1d6bf0d92c1fe05",
  measurementId: "G-FMTE1Z1WDC",
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const storage = getStorage(app);
