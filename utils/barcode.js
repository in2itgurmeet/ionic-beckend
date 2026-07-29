const bwipjs = require('bwip-js');

/**
 * Generates a base64 encoded barcode image string.
 * @param {string} text - The text to encode in the barcode
 * @returns {Promise<string>} Base64 image data URI
 */
exports.generateBarcode = (text) => {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'code128',       // Barcode type
      text: text,            // Text to encode
      scale: 3,              // 3x scaling factor
      height: 10,            // Bar height, in millimeters
      includetext: true,     // Show human-readable text
      textxalign: 'center',  // Always good to set this
    }, function (err, png) {
      if (err) {
        reject(err);
      } else {
        const base64Data = png.toString('base64');
        resolve(`data:image/png;base64,${base64Data}`);
      }
    });
  });
};
