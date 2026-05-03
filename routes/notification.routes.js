const router = require("express").Router();
const { sendNotification, getNotifications, markAsRead } = require("../controller/notification.controller");
const auth = require("../middleware/authMiddleware");
router.post("/send", sendNotification);
router.get("/list", auth, getNotifications);
router.put("/read/:id", auth, markAsRead);

module.exports = router;
