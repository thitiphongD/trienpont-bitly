const express = require('express');
const app = express();
const PORT = 4000;
const shortid = require('shortid');
const mysql = require("mysql2/promise");
const cors = require('cors');
const fetch = require('node-fetch');
const { parse } = require('node-html-parser');
app.use(express.json());
app.use(cors());

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

function checkURL(url) {
    return /^https?:\/\//i.test(url);
}

app.post('/shortLink', async (req, res) => {

    const { longUrl, email, newTitle, newBackHalf } = req.body;

    checkURL(longUrl);

    if (!checkURL(longUrl)) {
        return res.status(400).json({
            code: 400,
            message: 'URL is not in the correct pattern',
        });
    }

    if (!longUrl || !email) {
        return res.status(400).json({
            code: 400,
            message: 'Please provide a valid "link" or "email" property in the request body.',
        });
    }
    try {

        const shortLinkId = shortid.generate();
        const queryBackHalf = newBackHalf || shortLinkId;
        const shortLinkUrl = queryBackHalf;

        const domain = 'http://localhost:4000/';

        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email]);
        connection.release();

        if (rows[0].count === 0) {
            return res.status(400).json({
                code: 400,
                message: 'Email address does not exist in the database.',
            });
        }

        const response = await fetch(longUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch the web page');
        }

        const htmlContent = await response.text();
        const root = parse(htmlContent);
        const titleElement = root.querySelector('title');
        const title = titleElement ? titleElement.text : 'No Title Found';

        const faviconLink = root.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        const faviconHref = faviconLink ? faviconLink.getAttribute('href') : null;
        const icon = faviconHref ? new URL(faviconHref, longUrl).toString() : null;

        const queryTitle = newTitle || title;

        await connection.query(`
            INSERT INTO link (email, original_link, domain, short_link, title, icon, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), '+00:00', '+00:00'))`, [email, longUrl, domain, shortLinkUrl, queryTitle, icon]
        );

        return res.status(200).json({
            code: 200,
            email: email,
            domain: domain,
            shortLink: shortLinkUrl,
            longLink: longUrl,
            title: queryTitle,
            icon: icon
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/getLink', async (req, res) => {
    const email = req.body.email;

    try {
        const connection = await pool.getConnection();
        const rows = await connection.query('SELECT * FROM link WHERE email = ? ORDER BY id DESC', [email]);
        connection.release();

        return res.status(200).json({
            code: 200,
            data: rows[0]
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/getLinkByID', async (req, res) => {
    const id = req.body.id;

    try {
        const connection = await pool.getConnection();
        const rows = await connection.query('SELECT id, title, short_link FROM link WHERE id = ?', [id]);
        connection.release();

        return res.status(200).json({
            code: 200,
            data: rows[0]
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/updateLink', async (req, res) => {
    const { id, editTitle, editBackHalf } = req.body;
    try {
        const connection = await pool.getConnection();

        const result = await connection.query(
            'UPDATE link SET title = ?, short_link = ? WHERE id = ?',
            [editTitle, editBackHalf, id]
        );
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Link not found or not updated.',
            });
        }
        return res.status(200).json({
            code: 200,
            message: 'Link updated successfully.',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/deleteLink', async (req, res) => {
    const id = req.body.id;
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM link WHERE id = ?', [id]);
        connection.release();
        return res.status(200).json({
            code: 200,
            message: 'Link deleted successfully',
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