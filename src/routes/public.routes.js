const express = require('express');
const { serveImage } = require('../controllers/image.controller');

const router = express.Router();

router.get('/images/:id', serveImage);

module.exports = router;
