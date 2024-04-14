// class Store {
//     constructor() {
//         this.db = new Dexie("arneson_db");
//         this.db.version(1).stores({
//             chunks: `
//             uid,
//             order_id,
//             txt`,
//         });
//         console.log("check")
//         this.db.chunks.each((chunk)=>{console.log(chunk)})
//     }
// }
// STORE = new Store()