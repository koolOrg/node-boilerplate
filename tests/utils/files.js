const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const unlink = promisify(fs.unlink);

const readTestFile = async () => {
  const imagePath = path.join(__dirname, '..', 'fixtures', 'testImage.jpg');
  // Use any image file you have for testing
  return fs.createReadStream(imagePath);
};

const deleteTestFile = async (filePath) => {
  await unlink(filePath);
};

module.exports = {
  readTestFile,
  deleteTestFile,
};
