const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { contentService } = require('../services');

const createContent = catchAsync(async (req, res) => {
  const content = await contentService.createContent(req.body);
  res.status(httpStatus.CREATED).send(content);
});

const getContents = catchAsync(async (req, res) =>{
    const contents = await contentService.getContents();
    res.status(httpStatus.OK).send(contents);
})

const getContentById = catchAsync(async (req, res) => {
  const content = await contentService.getContentById(req.params.id);
  if (!content) {
    res.status(httpStatus.NOT_FOUND).send();
  } else {
    res.status(httpStatus.OK).send(content);
  }
});

const updateContentById = catchAsync(async (req, res) => {
  const content = await contentService.updateContentById(req.params.id, req.body);
  res.status(httpStatus.OK).send(content);
});

const deleteContentById = catchAsync(async (req, res) => {
  await contentService.deleteContentById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});




module.exports = {
  createContent,
  getContentById,
  updateContentById,
  deleteContentById,
    getContents
};
