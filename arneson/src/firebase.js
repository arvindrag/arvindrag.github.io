import {
    initializeApp
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js'

import {
    getFirestore,
    collection,
    getDocs
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyDMrR634azeQi5Rs2eQGZ2aoChtITztLrU",
    authDomain: "arneson-cf671.firebaseapp.com",
    projectId: "arneson-cf671",
    storageBucket: "arneson-cf671.appspot.com",
    messagingSenderId: "107741599479",
    appId: "1:107741599479:web:66ebb0de790bedfaeda5f2"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore();

export const getWolfs = () => {
    return getDocs(collection(db, "Flakes"));
};