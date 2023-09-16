const express = require('express');
const app = express();
const PORT = 4000;
const bodyParser = require('body-parser');
const shortid = require('shortid');
const crypto = require('crypto');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.json());

app.post('/shortLink', (req, res) => {
    const longUrl = req.body.longUrl;

    if (!longUrl) {
        return res.status(400).json({
            message: 'Please provide a valid "link" property in the request body.',
        });
    }
    try {
        const shortLinkId = shortid.generate();
        const shortLinkUrl = `http://dm.co/${shortLinkId}`;

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