const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const generateResume = require('../services/resume.service');
const resumeModel = require('../models/resume.model');
const userModel = require('../models/user.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @description Generate a resume from the user's self description (+ optional target role / job description / existing PDF)
 */
async function generateResumeController(req, res) {
    try {
        const { selfDescription, targetRole, jobDescription, fullName, phone, location, links } = req.body;

        if (!selfDescription || selfDescription.trim().length < 30) {
            return res.status(400).json({
                message: 'Please write a self description (at least a couple of sentences about your skills, education and experience)'
            });
        }

        let existingResume = '';
        if (req.file) {
            const parsedPdf = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
            existingResume = parsedPdf.text;
        }

        const user = await userModel.findById(req.user.id);
        const parsedLinks = (links || '')
            .split(/[\n,]+/)
            .map((l) => l.trim())
            .filter(Boolean)
            .slice(0, 6);

        const aiResume = await generateResume({
            selfDescription,
            targetRole,
            jobDescription,
            existingResume,
            contact: {
                fullName: (fullName || '').trim() || user?.username || '',
                email: user?.email || '',
                phone: (phone || '').trim(),
                location: (location || '').trim(),
                links: parsedLinks
            }
        });

        const resume = await resumeModel.create({
            user: req.user.id,
            title: targetRole?.trim() ? `${targetRole.trim()} Resume` : aiResume.title,
            targetRole: targetRole || '',
            jobDescription: jobDescription || '',
            selfDescription,
            atsScore: Math.max(0, Math.min(100, Math.round(aiResume.atsScore || 0))),
            improvementTips: aiResume.improvementTips || [],
            content: aiResume.content
        });

        res.status(201).json({ message: 'Resume generated successfully', resume });
    } catch (err) {
        console.error('generateResumeController error:', err);
        res.status(500).json({ message: 'Something went wrong while generating the resume' });
    }
}

/**
 * @description All resumes of the logged in user (history list)
 */
async function getAllResumesController(req, res) {
    try {
        const resumes = await resumeModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('title targetRole atsScore createdAt updatedAt');

        res.status(200).json({ message: 'Resumes fetched successfully', resumes });
    } catch (err) {
        console.error('getAllResumesController error:', err);
        res.status(500).json({ message: 'Something went wrong while fetching resumes' });
    }
}

async function getResumeByIdController(req, res) {
    try {
        const { resumeId } = req.params;
        if (!isValidId(resumeId)) return res.status(404).json({ message: 'Resume not found' });

        const resume = await resumeModel.findOne({ _id: resumeId, user: req.user.id });
        if (!resume) return res.status(404).json({ message: 'Resume not found' });

        res.status(200).json({ message: 'Resume fetched successfully', resume });
    } catch (err) {
        console.error('getResumeByIdController error:', err);
        res.status(500).json({ message: 'Something went wrong while fetching the resume' });
    }
}

async function deleteResumeController(req, res) {
    try {
        const { resumeId } = req.params;
        if (!isValidId(resumeId)) return res.status(404).json({ message: 'Resume not found' });

        const deleted = await resumeModel.findOneAndDelete({ _id: resumeId, user: req.user.id });
        if (!deleted) return res.status(404).json({ message: 'Resume not found' });

        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (err) {
        console.error('deleteResumeController error:', err);
        res.status(500).json({ message: 'Something went wrong while deleting the resume' });
    }
}

module.exports = {
    generateResumeController,
    getAllResumesController,
    getResumeByIdController,
    deleteResumeController
};
