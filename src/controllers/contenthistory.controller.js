const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { contentHistoryService } = require('../services');

const createContentHistory = catchAsync(async (req, res) => {
  // console.log(req.body)
  const contentHistory = await contentHistoryService.createContentHistory(req.body);
  res.status(httpStatus.CREATED).send(contentHistory);
});

const getContentHistories = catchAsync(async (req, res) => {
  const filter = req.query || {};
  const options = {
    sortBy: req.query.sortBy,
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1
  };
  const result = await contentHistoryService.queryContentHistories(filter, options);
  res.status(httpStatus.OK).send(result);
});

const getContentHistoryById = catchAsync(async (req, res) => {
  const contentHistory = await contentHistoryService.getContentHistoryById(req.params.id);
  if (!contentHistory) {
    res.status(httpStatus.NOT_FOUND).send();
  } else {
    res.status(httpStatus.OK).send(contentHistory);
  }
});

const updateContentHistoryById = catchAsync(async (req, res) => {
  const contentHistory = await contentHistoryService.updateContentHistoryById(req.params.id, req.body);
  if (!contentHistory) {
    res.status(httpStatus.NOT_FOUND).send();
  } else {
    res.status(httpStatus.OK).send(contentHistory);
  }
});

const deleteContentHistoryById = catchAsync(async (req, res) => {
  await contentHistoryService.deleteContentHistoryById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createContentHistory,
  getContentHistories,
  getContentHistoryById,
  updateContentHistoryById,
  deleteContentHistoryById
};
