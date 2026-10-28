import {getAllInterviewReports, generateInterviewReport, getInterviewReportById} from '../services/interview.api';
import { useContext } from 'react';
import { InterviewContext } from '../interview.context';

export const useInterview = () => {
    const context  = useContext(InterviewContext);

    if(!context){
        throw new Error('useInterview must be within an InterviewProvider');
    }
    
    const {loading,setLoading,report,setReport, reports, setReports} = context;

    const generateReport = async ({jobDescription, selfDescription, resumeFile}) => {
        setLoading(true);
        try{
            const response = await generateInterviewReport({jobDescription, selfDescription, resumeFile});
            setReport(response.interviewReport);
            return response.interviewReport;
        }catch(error){
            console.error('Error generating Interview Report:', error);
            throw error;
        }finally{
            setLoading(false);
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true);
        try{
            const response = await getInterviewReportById(interviewId);
            setReport(response.interviewReport);
            return response.interviewReport;
        } catch(error){
            console.error('Error fetching Interview Report:', error);
            throw error;
        }
        finally{
            setLoading(false);
        }
    }

    const getReports = async () => {
        setLoading(true);
        try{
            const response = await getAllInterviewReports();
            setReports(response.interviewReports);
            return response.interviewReports;
        } catch(error){
            console.error('Error fetching Interview Reports:', error);
            throw error;
        }
        finally{
            setLoading(false);
        }
    }

    return { loading, report, reports, generateReport, getReportById, getReports};
}
