const express = require('express');
// const validate = require('../../middlewares/validate');
// const contentHistoryValidation = require('../../validations/contenthistory.validation'); // Define this according to your validation needs
const serialKillerController = require('../../controllers/serialkiller.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

// auth(), validate(contentHistoryValidation.createOrUpdateContentHistory)

// POST /contentHistory to create new content history
router.post('/', serialKillerController.createSerialKiller);

// GET /SerialKiller to retrieve all content histories
router.get('/', serialKillerController.getSerialKillers);

// GET /SerialKiller/:id to get a specific content history by ID
router.get('/:id',  serialKillerController.getSerialKillerById);

// PUT /SerialKiller/:id to update a specific content history by ID
router.put('/:id',  serialKillerController.updateSerialKillerById);

// DELETE /SerialKiller/:id to delete a specific content history by ID
router.delete('/:id', auth(), serialKillerController.deleteSerialKillerById);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: ContentHistory
 * description: Content history management and retrieval
 */
