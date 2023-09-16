const express = require('express');
const app = express();
const PORT = 4000;
const shortid = require('shortid');
const mysql = require("mysql2/promise");
app.use(express.json());

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'my_project',
    waitForConnections: true
});
console.log('Connected to MySQL database');

pool.on('error', (err) => {
    console.error('MySQL pool error:', err);
});

app.get('/users', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows, fields] = await connection.query('SELECT * FROM users');
        connection.release();

        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Please provide both email and password.',
        });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        connection.release();

        if (rows.length === 1) {
            return res.status(200).json({
                email: rows[0].email,
                role: rows[0].role,
                code: 200,
            });
        } else {
            return res.status(401).json({
                message: 'Authentication failed. Invalid email or password.',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});


app.post('/register', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
        return res.status(400).json({
            message: 'Please provide email, password, and confirmPassword.',
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            message: 'Password and confirmPassword do not match.',
        });
    }

    try {
        const connection = await pool.getConnection();

        const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            connection.release();
            return res.status(400).json({
                message: 'Email already exists. Please choose a different one.',
            });
        }

        await connection.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, password, 'User']);

        connection.release();

        return res.status(200).json({
            message: 'Registration successful',
            code: 200
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/shortLink', (req, res) => {
    const longUrl = req.body.longUrl;

    if (!longUrl) {
        return res.status(400).json({
            message: 'Please provide a valid "link" property in the request body.',
        });
    }
    try {
        const shortLinkId = shortid.generate();
        const shortLinkUrl = `http://localhost:4000/${shortLinkId}`;

        return res.status(200).json({
            shortLink: shortLinkUrl,
            longLink: longUrl,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});