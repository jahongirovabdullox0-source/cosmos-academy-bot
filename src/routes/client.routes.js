const express = require('express');
const { telegramAuth } = require('../middlewares/auth.middleware');
const controller = require('../controllers/client.controller');

const router = express.Router();

router.use(telegramAuth);

router.get('/me', controller.getMe);
router.post('/language', controller.setLanguage);
router.get('/courses', controller.getCourses);
router.get('/achievements', controller.getAchievements);
router.get('/center-info', controller.getCenterInfo);
router.post('/register', controller.register);
router.get('/my-registrations', controller.getMyRegistrations);

module.exports = router;
