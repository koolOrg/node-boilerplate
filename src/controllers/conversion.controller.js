const { conversionService } = require('../services');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');


const submitConversionRequest = catchAsync(async (req, res) => {
  const conversionRequest = await conversionService.createConversionRequest(req.body);
  res.status(httpStatus.CREATED).send(conversionRequest);
});

const getConversionRequestById = catchAsync(async (req, res) => {
  const conversionRequest = await conversionService.getConversionRequestById(req.params.id);
  if (!conversionRequest) {
    res.status(httpStatus.NOT_FOUND).send();
  } else {
    res.status(httpStatus.OK).send(conversionRequest);
  }
});

const updateConversionRequestById = catchAsync(async (req, res) => {
  const conversionRequest = await conversionService.updateConversionRequestById(req.params.id, req.body);
  res.status(httpStatus.OK).send(conversionRequest);
});

const deleteConversionRequestById = catchAsync(async (req, res) => {
  await conversionService.deleteConversionRequestById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});


module.exports = {
  submitConversionRequest,
  getConversionRequestById,
  updateConversionRequestById,
  deleteConversionRequestById,
};