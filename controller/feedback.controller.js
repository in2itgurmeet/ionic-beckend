const Feedback = require("../models/feedback.model");

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;

    if (!rating) {
      return res.status(400).json({ error: "Rating is required" });
    }

    const feedback = new Feedback({
      rating,
      reviewText,
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
