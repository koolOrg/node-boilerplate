const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { serialKillerService } = require('../services');

const createSerialKiller = catchAsync(async (req, res) => {
  // console.log(req.body)
  const serialKiller = await serialKillerService.createSerialKiller(req.body);
  res.status(httpStatus.CREATED).send(serialKiller);
});

const getSerialKillers = catchAsync(async (req, res) => {
  const filter = req.query || {};
  // const options = {
  //   sortBy: req.query.sortBy,
  //   limit: parseInt(req.query.limit, 10) || 10,
  //   page: parseInt(req.query.page, 10) || 1
  // };

  const options = {
    sortBy: req.query.sortBy,
    limit: 100,
    page: 1
  }
  const result = await serialKillerService.querySerialKiller(filter, options);
  res.status(httpStatus.OK).send(result);
});

const getSerialKillerById = catchAsync(async (req, res) => {
  const serialKiller = await serialKillerService.getSerialKillerById(req.params.id);
  if (!serialKiller) {
    res.status(httpStatus.NOT_FOUND).send();
  } else {
    res.status(httpStatus.OK).send(serialKiller);
  }
});

const updateSerialKillerById = catchAsync(async (req, res) => {
  const serialKiller = await serialKillerService.updateSerialKillerById(req.params.id, req.body);
  if (!serialKiller) {
    res.status(httpStatus.NOT_FOUND).send();
  } else {
    res.status(httpStatus.OK).send(serialKiller);
  }
});

const deleteSerialKillerById = catchAsync(async (req, res) => {
  await serialKillerService.deleteSerialKillerById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSerialKiller,
  getSerialKillers,
  getSerialKillerById,
  updateSerialKillerById,
  deleteSerialKillerById
};
