const express = require('express');
const { adminLoginHandler, adminAuth, blockRemoteIfNotAllowed } = require('../middlewares/auth.middleware');
const controller = require('../controllers/admin.controller');

const router = express.Router();

router.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Robots-Tag', 'noindex');
  next();
});

router.use(blockRemoteIfNotAllowed);

router.post('/login', adminLoginHandler);

router.use(adminAuth);

router.get('/dashboard/stats', controller.getDashboardStats);

router.get('/registrations', controller.listRegistrations);
router.get('/registrations/export', controller.exportRegistrations);
router.patch('/registrations/:id', controller.updateRegistration);
router.delete('/registrations/:id', controller.deleteRegistration);

router.get('/users', controller.listUsers);
router.patch('/users/:id/block', controller.setUserBlocked);

router.get('/courses', controller.listCourses);
router.post('/courses', controller.createCourse);
router.patch('/courses/:id', controller.updateCourse);
router.delete('/courses/:id', controller.deleteCourse);

router.get('/achievements', controller.listAchievements);
router.post('/achievements', controller.createAchievement);
router.patch('/achievements/:id', controller.updateAchievement);
router.delete('/achievements/:id', controller.deleteAchievement);

router.get('/center-info', controller.getCenterInfo);
router.put('/center-info', controller.updateCenterInfo);

router.post('/broadcast', controller.sendBroadcast);
router.get('/broadcast/history', controller.getBroadcastHistory);

module.exports = router;
