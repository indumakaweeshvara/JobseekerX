import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAfJxbL9L5f_wbIekfOVx9sv-XwTJS70Cw",
    authDomain: "assignment-8-bb726.firebaseapp.com",
    projectId: "assignment-8-bb726",
    storageBucket: "assignment-8-bb726.firebasestorage.app",
    messagingSenderId: "44029384291",
    appId: "1:44029384291:web:edbdaf04d6ff7c1b6d4a56",
    measurementId: "G-JKN291DERN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
