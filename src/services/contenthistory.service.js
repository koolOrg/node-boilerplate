const httpStatus = require('http-status');
const { ContentHistory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a content history
 * @param {Object} contentBody
 * @returns {Promise<ContentHistory>}
 */
const createContentHistory = async (contentBody) => {
  return ContentHistory.create(contentBody);
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
const queryContentHistories = async (filter, options) => {
  const contentHistories = await ContentHistory.paginate(filter, options);
  return contentHistories;
};

/**
 * Get content history by id
 * @param {ObjectId} id
 * @returns {Promise<ContentHistory>}
 */
const getContentHistoryById = async (id) => {
  return ContentHistory.findById(id);
};

/**
 * Update content history by id
 * @param {ObjectId} contentHistoryId
 * @param {Object} updateBody
 * @returns {Promise<ContentHistory>}
 */
const updateContentHistoryById = async (contentHistoryId, updateBody) => {
  const contentHistory = await getContentHistoryById(contentHistoryId);
  if (!contentHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Content history not found');
  }
  Object.assign(contentHistory, updateBody);
  await contentHistory.save();
  return contentHistory;
};

/**
 * Delete content history by id
 * @param {ObjectId} contentHistoryId
 * @returns {Promise<ContentHistory>}
 */
const deleteContentHistoryById = async (contentHistoryId) => {
  const contentHistory = await getContentHistoryById(contentHistoryId);
  if (!contentHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Content history not found');
  }
  await contentHistory.remove();
  return contentHistory;
};

module.exports = {
  createContentHistory,
  queryContentHistories,
  getContentHistoryById,
  updateContentHistoryById,
  deleteContentHistoryById,
};
