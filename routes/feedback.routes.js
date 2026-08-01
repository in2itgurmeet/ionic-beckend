const express = require("express");
const router = express.Router();
const feedbackController = require("../controller/feedback.controller");

router.post("/", feedbackController.submitFeedback);

module.exports = router;
