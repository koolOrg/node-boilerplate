const httpStatus = require('http-status');
// const { Content } = require('../models/content..model');
const Content = require('../models/content.model');
const ApiError = require('../utils/ApiError');

const createContent = async (contentBody) => {
    console.log("Inside service")
  return Content.create(contentBody);
};

const getContents = async () =>{
    console.log("Inside service")
    return Content.find();
}
const getContentById = async (id) => {
  const content = await Content.findById(id);
  if (!content) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Content not found');
  }
  return content;
};

const updateContentById = async (id, updateBody) => {
  const content = await getContentById(id);
  Object.assign(content, updateBody);
  await content.save();
  return content;
};

const deleteContentById = async (id) => {
  const content = await getContentById(id);
  await content.remove();
  return content;
};

module.exports = {
  createContent,
  getContentById,
  updateContentById,
  deleteContentById,
    getContents
};

// Path: src/services/user.service.js