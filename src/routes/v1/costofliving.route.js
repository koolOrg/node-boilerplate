const express = require('express');
const costOfLivingController = require('../../controllers/costofliving.controller');
const auth = require('../../middlewares/auth');

// const validate = require('../../middlewares/validate');
// const contentHistoryValidation = require('../../validations/contenthistory.validation'); // Define this according to your validation needs

const router = express.Router();

// auth(), validate(contentHistoryValidation.createOrUpdateContentHistory)

// POST /contentHistory to create new content history
router.post('/', costOfLivingController.createCostOfLiving);

// GET /CostOfLiving to retrieve all content histories
router.get('/', costOfLivingController.getCostOfLivings);

// GET /CostOfLiving/:id to get a specific content history by ID
router.get('/:id',  costOfLivingController.getCostOfLivingById);

// PUT /CostOfLiving/:id to update a specific content history by ID
router.put('/:id',  costOfLivingController.updateCostOfLivingById);

// DELETE /CostOfLiving/:id to delete a specific content history by ID
router.delete('/:id', auth(), costOfLivingController.deleteCostOfLivingById);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: ContentHistory
 * description: Content history management and retrieval
 */
