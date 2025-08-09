// db.js
import { createConnection } from 'mysql2';

console.log(process.env.DB_HOST);
const db = createConnection({
    host: process.env.DB_HOST, // your MySQL host
    user: process.env.DB_USER,       // your MySQL username
    password: process.env.DB_PASSWORD,       // your MySQL password
    database: process.env.DB_DATABASE,
    ssl:{
        ca: process.env.DB_CERT // path to your CA certificate
    } // your MySQL database name
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

export default db;
