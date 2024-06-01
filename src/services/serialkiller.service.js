const httpStatus = require('http-status');
const { SerialKiller } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a content history
 * @param {Object} contentBody
 * @returns {Promise<SerialKiller>}
 */
const createSerialKiller = async (contentBody) => {
  return SerialKiller.create(contentBody);
};

/**
 * Query for content histories
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySerialKiller = async (filter, options) => {
  const serialKillers = await SerialKiller.paginate(filter, options);
  return serialKillers;
};

/**
 * Get content history by id
 * @param {ObjectId} id
 * @returns {Promise<SerialKiller>}
 */
const getSerialKillerById = async (id) => {
  return SerialKiller.findById(id);
};

/**
 * Update content history by id
 * @param {ObjectId} SerialKillerId
 * @param {Object} updateBody
 * @returns {Promise<SerialKiller>}
 */
const updateSerialKillerById = async (SerialKillerId, updateBody) => {
  console.log(SerialKillerId);
  console.log(updateBody);
  const serialKiller = await getSerialKillerById(SerialKillerId);
  if (!serialKiller) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Content history not found');
  }
  Object.assign(serialKiller, updateBody);
  await serialKiller.save();
  return serialKiller;
};

/**
 * Delete content history by id
 * @param {ObjectId} SerialKillerId
 * @returns {Promise<SerialKiller>}
 */
const deleteSerialKillerById = async (SerialKillerId) => {
  const serialKiller = await getSerialKillerById(SerialKillerId);
  if (!serialKiller) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Content history not found');
  }
  await serialKiller.remove();
  return serialKiller;
};

module.exports = {
  createSerialKiller,
  querySerialKiller,
  getSerialKillerById,
  updateSerialKillerById,
  deleteSerialKillerById,
};
