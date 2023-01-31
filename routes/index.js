const express = require('express');
const router = express.Router();


const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
});

const promisePool = pool.promise();

router.get('/', async function (req, res, next) {
    const [rows] = await promisePool.query("SELECT * FROM lo28forum ORDER BY createdAt DESC");
res.render('index.njk', {
    rows: rows,
    title: 'Forum',
});
});

router.get('/signin', async function (req, res, next) {
    const [rows] = await promisePool.query("SELECT * FROM lo28forum");
res.render('signin.njk', {
    rows: rows,
    title: 'Forum',
});
});

router.get('/subscribe', async function (req, res, next) {
    const [rows] = await promisePool.query("SELECT * FROM lo28forum");
res.render('subscribe.njk', {
    rows: rows,
    title: 'Forum',
});
});


router.get('/new', async function (req, res, next) {
    const [users] = await promisePool.query('SELECT * FROM lo28users');
    res.render('new.njk', {
        title: 'Nytt inlägg',
        users,
    });
});

router.post('/new', async function (req, res, next) {
    const { author, title, content } = req.body;

    // Skapa en ny författare om den inte finns men du behöver kontrollera om användare finns!
    let [user] = await promisePool.query('SELECT * FROM lo28users WHERE id = ?', [author]);
    if (!user) {
        user = await promisePool.query('INSERT INTO lo28users (name) VALUES (?)', [author]);
    }

    // user.insertId bör innehålla det nya ID:t för författaren

    const userId = user.insertId || user[0].id;

    // kör frågan för att skapa ett nytt inlägg
    const [rows] = await promisePool.query('INSERT INTO lo28forum (authorId, title, content) VALUES (?, ?, ?)', [userId, title, content]);
    res.redirect('/'); // den här raden kan vara bra att kommentera ut för felsökning, du kan då använda tex. res.json({rows}) för att se vad som skickas tillbaka från databasen
});

module.exports = router;
