const express = require('express');
const validate = require('../../middlewares/validate');
const contentValidation = require('../../validations/content.validation'); // Define this similar to authValidation
const contentController = require('../../controllers/content.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

// POST /content to create new content
// router.post('/content', auth(), validate(contentValidation.createOrUpdateContent), contentController.createContent);
router.post('/', contentController.createContent);

router.get('/', contentController.getContents);

// GET /content/:id to get a specific content by ID
router.get('/:id', auth(), contentController.getContentById);

// PUT /content/:id to update a specific content by ID
// router.put('/:id', auth(), validate(contentValidation.createOrUpdateContent), contentController.updateContentById);
router.put('/:id', contentController.updateContentById);

// DELETE /content/:id to delete a specific content by ID
// router.delete('/:id', auth(), contentController.deleteContentById);
router.delete('/:id', contentController.deleteContentById);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: Content
 * description: Content management and retrieval
 */
