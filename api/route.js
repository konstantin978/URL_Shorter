const { Router } = require('express');
const mongoose = require('mongoose');
const Url = require('../models/url');
const redis = require('redis');

const mainRouter = Router();

const redisClient = redis.createClient({
    url: "redis://localhost:6379"
});

redisClient.connect().catch(console.error);

mongoose.connect('mongodb://localhost:27017/url_shorterer');

mainRouter.post('/short', async (req, res) => {
    let { originalUrl } = req.body;
    let shortUrl = Math.random().toString(36).substr(2, 6);

    const reg = new RegExp("^(http|https)://", "i");
    const match = reg.test(originalUrl);

    if (!match) {
        originalUrl = 'http://' + originalUrl;
    };

    const cacheKey = `short:${shortUrl}`;

    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
        return res.status(400).send(`This URL already has a short version: 'localhost:3000/${existingUrl.shortUrl}'`);
    }

    let shortUrlValidation = await Url.findOne({ shortUrl });
    while (shortUrlValidation) {
        shortUrl = Math.random().toString(36).substr(2, 6);
        shortUrlValidation = await Url.findOne({ shortUrl });
    }

    const newUrlObj = new Url({ originalUrl, shortUrl });
    await newUrlObj.save();

    await redisClient.set(cacheKey, JSON.stringify(newUrlObj));

    res.status(201).send(`Short URL created: 'localhost:3000/${shortUrl}'`);
});

mainRouter.get('/:url', async (req, res) => {
    const shortUrl = req.params.url.trim();
    const cacheKey = `short:${shortUrl}`;

    const cachedUrl = await redisClient.get(cacheKey);
    if (cachedUrl) {
        const { originalUrl } = JSON.parse(cachedUrl);
        return res.redirect(originalUrl);
    }

    const urlObject = await Url.findOne({ shortUrl });
    if (!urlObject) {
        return res.status(404).send('URL not found');
    }

    await redisClient.set(cacheKey, JSON.stringify(urlObject));

    res.redirect(302, urlObject.originalUrl);
});

module.exports = mainRouter;
