import {
    initializeApp
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js'

import {
    getFirestore,
    collection,
    getDoc,
    getDocs,
    doc,
    setDoc,
    addDoc,
    deleteDoc,
    updateDoc,
    arrayUnion,
    query,
    where
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

const MAX_PAGE_SIZE = 200;
const COLLECTION_NAME = "Flakes"

const fcollection = collection(db, "Flakes")

function paginate_and_write(items, type, at) {
    const pages = []
    let page = 0
    for (let i = 0; i < items.length; i += MAX_PAGE_SIZE) {
        pages.push({
            type: type,
            page: page,
            at: at,
            items: items.slice(i, i + MAX_PAGE_SIZE)
        });
        page++
    }
    pages.forEach((p) => {
        addDoc(fcollection, p)
    })
}

const MAX_ATS = 6
export const readAts = () => {
    return getDoc(doc(db, "Flakes", "data-history"))
        .then((result) => {
            let ats = []
            if (result.exists()) {
                ats = result.data().ats.sort().reverse()
                if (ats.length > MAX_ATS) {
                    setDoc(doc(db, "Flakes", "data-history"), {
                        ats: ats.slice(0, MAX_ATS)
                    })
                }
            }
            return ats
        })
}

const writeAts = () => {
    return getDoc(doc(db, "Flakes", "data-history"));
}

export const writeData = (data) => {
    const at = Date.now()
    const flakes = data.items;
    paginate_and_write(data.groups, "characters", at);
    paginate_and_write(data.items, "flakes", at);
    updateDoc(doc(db, COLLECTION_NAME, "data-history"), {
        ats: arrayUnion(at)
    });
}

export const readData = (at) => {
    console.log(at)
    return getDocs(query(fcollection, where("at", "==", at)))
        .then((results) => {
            let data = {
                groups: [],
                items: []
            }
            results.forEach((result) => {
                if (result.data().type == "characters") {
                    data.groups = data.groups.concat(result.data().items)
                }
                if (result.data().type == "flakes") {
                    data.items = data.items.concat(result.data().items)
                }
            })
            return data;
        })
}