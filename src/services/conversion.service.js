const { ConversionRequest } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const createConversionRequest = async (conversionRequestBody) => {
  return ConversionRequest.create(conversionRequestBody);
};

const getConversionRequestById = async (id) => {
  const conversionRequest = await ConversionRequest.findById(id);
  if (!conversionRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Conversion request not found');
  }
  return conversionRequest;
};

const updateConversionRequestById = async (id, updateBody) => {
  const conversionRequest = await getConversionRequestById(id);
  Object.assign(conversionRequest, updateBody);
  await conversionRequest.save();
  return conversionRequest;
};

const deleteConversionRequestById = async (id) => {
  const conversionRequest = await getConversionRequestById(id);
  await conversionRequest.remove();
  return conversionRequest;
};


module.exports = {
  createConversionRequest,
  getConversionRequestById,
  updateConversionRequestById,
  deleteConversionRequestById,
};