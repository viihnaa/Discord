const express = require('express');
const router = express.Router();
const { getChannels, createChannel } = require('../controllers/channelController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, getChannels);
router.post('/', auth, createChannel);

module.exports = router;