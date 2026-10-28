const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const generateInterviewReport = require('../services/ai.service');
const interviewReportModel = require('../models/interviewReport.model');

/**
 * @description Controller to generate interview report based on user self description, resume & job description.
 */

async function generateInterviewReportController(req,res){
    try{
        const { selfDescription, jobDescription } = req.body;

        if(!jobDescription){
            return res.status(400).json({ message: "Job description is required" });
        }
        if(!req.file && !selfDescription){
            return res.status(400).json({ message: "Please provide either a resume file or a self description" });
        }

        let resumeText = '';
        if(req.file){
            const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
            resumeText = resumeContent.text;
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })

        res.status(201).json({
            message:"Interview report generated successfully",
            interviewReport
        })
    } catch(err){
        console.error('generateInterviewReportController error:', err);
        res.status(500).json({ message: "Something went wrong while generating the interview report" });
    }
}


/**
 * @description Controller to get interview report by interviewId
 */

async function getInterviewReportByIdController(req,res){
    try{
        const { interviewId } = req.params;
        const interviewReport = await interviewReportModel.findOne({_id: interviewId, user: req.user.id});

        if(!interviewReport){
            return res.status(404).json({
                message: "Interview Report Not Found"
            })
        }

        res.status(200).json({
            message:"Interview Report Fetched Successfully",
            interviewReport
        })
    } catch(err){
        console.error('getInterviewReportByIdController error:', err);
        res.status(500).json({ message: "Something went wrong while fetching the interview report" });
    }
}


/**
 * @description Controller to get all interview reports of logged in user
 */

async function getAllInterviewReportsController(req,res){
    try{
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan');

        res.status(200).json({
            message: "Interview reports fetched successfully",
            interviewReports
        })
    } catch(err){
        console.error('getAllInterviewReportsController error:', err);
        res.status(500).json({ message: "Something went wrong while fetching interview reports" });
    }
}

/**
 * @description Delete one of the logged in user's interview reports
 */

async function deleteInterviewReportController(req,res){
    try{
        const { interviewId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(interviewId)){
            return res.status(404).json({ message: "Interview Report Not Found" });
        }
        const deleted = await interviewReportModel.findOneAndDelete({ _id: interviewId, user: req.user.id });
        if(!deleted){
            return res.status(404).json({ message: "Interview Report Not Found" });
        }
        res.status(200).json({ message: "Interview Report Deleted Successfully" });
    } catch(err){
        console.error('deleteInterviewReportController error:', err);
        res.status(500).json({ message: "Something went wrong while deleting the interview report" });
    }
}

module.exports = {generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, deleteInterviewReportController};
