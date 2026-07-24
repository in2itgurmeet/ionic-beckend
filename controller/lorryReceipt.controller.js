const mongoose = require("mongoose");
const LorryReceipt = require("../models/lorryReceipt.model");
const sendEmail = require("../utils/sendEmail");

exports.getLorryReceipts = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await LorryReceipt.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lorry Receipts Fetched Successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Lorry Receipt Failed",
      error: error.message
    });
  }
};

exports.getLorryReceiptByNo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lrNo } = req.params;

    let query = { userId };
    if (mongoose.Types.ObjectId.isValid(lrNo)) {
      query.$or = [{ orderId: lrNo }, { lrNo }];
    } else {
      query.lrNo = lrNo;
    }

    const data = await LorryReceipt.findOne(query);

    res.status(200).json({
      message: "Lorry Receipt Fetched Successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Lorry Receipt Failed",
      error: error.message
    });
  }
};

exports.shareLorryReceipt = async (req, res) => {
  try {
    const { email, pdfBase64, lrNo } = req.body;

    if (!email || !pdfBase64) {
      return res.status(400).json({
        success: false,
        message: "Email and PDF base64 string are required"
      });
    }

    const base64Data = pdfBase64.includes("base64,")
      ? pdfBase64.split("base64,")[1]
      : pdfBase64;

    const attachments = [{
      filename: `Lorry_Receipt_${lrNo || 'Document'}.pdf`,
      content: Buffer.from(base64Data, 'base64'),
      contentType: 'application/pdf'
    }];

    const subject = `Lorry Receipt Document: ${lrNo || 'Download'}`;
    const html = `
      <h3>Lorry Receipt Sharing</h3>
      <p>Hello,</p>
      <p>Please find attached the Lorry Receipt PDF document (LR No: <strong>${lrNo || 'N/A'}</strong>) shared with you from PLC Logistics App.</p>
      <br>
      <p>Regards,</p>
      <p>PLC Logistics Team</p>
    `;

    await sendEmail(email, subject, html, attachments);

    res.status(200).json({
      success: true,
      message: "Lorry Receipt PDF sent successfully to " + email
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message
    });
  }
};
