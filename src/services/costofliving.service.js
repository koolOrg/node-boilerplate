const httpStatus = require('http-status');
const { CostOfLiving } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a cost of living entry
 * @param {Object} contentBody
 * @returns {Promise<CostOfLiving>}
 */
const createCostOfLiving = async (contentBody) => {
    return CostOfLiving.create(contentBody);
};

/**
 * Query for cost of living entries
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCostOfLiving = async (filter, options) => {
    const costOfLivingEntries = await CostOfLiving.paginate(filter, options);
    return costOfLivingEntries;
};

/**
 * Get cost of living entry by id
 * @param {ObjectId} id
 * @returns {Promise<CostOfLiving>}
 */
const getCostOfLivingById = async (id) => {
    return CostOfLiving.findById(id);
};

/**
 * Update cost of living entry by id
 * @param {ObjectId} costOfLivingId
 * @param {Object} updateBody
 * @returns {Promise<CostOfLiving>}
 */
const updateCostOfLivingById = async (costOfLivingId, updateBody) => {
    console.log(costOfLivingId);
    console.log(updateBody);
    const costOfLiving = await getCostOfLivingById(costOfLivingId);
    if (!costOfLiving) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cost of living entry not found');
    }
    Object.assign(costOfLiving, updateBody);
    await costOfLiving.save();
    return costOfLiving;
};

/**
 * Delete cost of living entry by id
 * @param {ObjectId} costOfLivingId
 * @returns {Promise<CostOfLiving>}
 */
const deleteCostOfLivingById = async (costOfLivingId) => {
    const costOfLiving = await getCostOfLivingById(costOfLivingId);
    if (!costOfLiving) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cost of living entry not found');
    }
    await costOfLiving.remove();
    return costOfLiving;
};

module.exports = {
    createCostOfLiving,
    queryCostOfLiving,
    getCostOfLivingById,
    updateCostOfLivingById,
    
    deleteCostOfLivingById,
};
