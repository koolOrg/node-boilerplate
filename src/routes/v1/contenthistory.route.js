const express = require('express');
const validate = require('../../middlewares/validate');
const contentHistoryValidation = require('../../validations/contenthistory.validation'); // Define this according to your validation needs
const contentHistoryController = require('../../controllers/contenthistory.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

// auth(), validate(contentHistoryValidation.createOrUpdateContentHistory)

// POST /contentHistory to create new content history
router.post('/', contentHistoryController.createContentHistory);

// GET /contentHistory to retrieve all content histories
router.get('/', auth(), contentHistoryController.getContentHistories);

// GET /contentHistory/:id to get a specific content history by ID
router.get('/:id',  contentHistoryController.getContentHistoryById);

// PUT /contentHistory/:id to update a specific content history by ID
router.put('/:id', auth(), validate(contentHistoryValidation.createOrUpdateContentHistory), contentHistoryController.updateContentHistoryById);

// DELETE /contentHistory/:id to delete a specific content history by ID
router.delete('/:id', auth(), contentHistoryController.deleteContentHistoryById);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: ContentHistory
 * description: Content history management and retrieval
 */
