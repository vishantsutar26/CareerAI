const express = require('express');
const { authUser } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/file.middleware');
const resumeController = require('../controllers/resume.controller');

const resumeRouter = express.Router();

/** @route POST /api/resume - generate a resume from self description (optional pdf, role, job description) @access private */
resumeRouter.post('/', authUser, upload.single('resume'), resumeController.generateResumeController);

/** @route GET /api/resume - all resumes of logged in user @access private */
resumeRouter.get('/', authUser, resumeController.getAllResumesController);

/** @route GET /api/resume/:resumeId @access private */
resumeRouter.get('/:resumeId', authUser, resumeController.getResumeByIdController);

/** @route DELETE /api/resume/:resumeId @access private */
resumeRouter.delete('/:resumeId', authUser, resumeController.deleteResumeController);

module.exports = resumeRouter;
