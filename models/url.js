const { Schema, default: mongoose } = require('mongoose');

const urlSchema = Schema({
    originalUrl: String,
    shortUrl: String
});

const Url = mongoose.model('url', urlSchema);
module.exports = Url;