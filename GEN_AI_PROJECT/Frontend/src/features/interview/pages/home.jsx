import React, { useRef, useState } from 'react';
import '../style/home.scss';
import { useInterview } from '../hooks/useInterview';
import { useNavigate, Link } from 'react-router';
import GeneratingOverlay from '../components/GeneratingOverlay';
import Navbar from '../../../components/Navbar';
import HistoryList from '../../history/components/HistoryList';

const MAX_JOB_DESC_CHARS = 5000;

const Home = () => {

  const {loading, generateReport} = useInterview();
   
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

 
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const canGenerate =
    jobDescription.trim().length > 0 &&
    (resumeFile !== null || selfDescription.trim().length > 0) &&
    !isSubmitting;

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value.slice(0, MAX_JOB_DESC_CHARS));
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleSubmit = async () => {
    if (!canGenerate) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const report = await generateReport({ jobDescription, selfDescription, resumeFile });
      navigate(`/interview/${report._id}`);
    } catch (err) {
      setSubmitError(
        typeof err === 'string'
          ? err
          : err?.response?.data?.message || 'Failed to generate interview strategy. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Navbar />
    <main className="home">
      {isSubmitting && <GeneratingOverlay />}
      <div className="home__container">
        <header className="home__header">
          <h1>
            Create Your Custom <span className="gradient-text">Interview Plan</span>
          </h1>
          <p>
            Let our AI analyze the job requirements and your unique profile to build a
            winning strategy.
          </p>
        </header>

        <div className="home__card">
          <div className="home__panel">
            <div className="panel-heading">
              <h2>
                <span className="icon-badge icon-badge--pink" aria-hidden="true">
                  <BriefcaseIcon />
                </span>
                Target Job Description
              </h2>
              <span className="badge badge--required">Required</span>
            </div>

            <div className="textarea-wrap">
              <textarea
                name="jobDescription"
                id="jobDescription"
                placeholder={
                  "Paste the full job description here...\n\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript and large-scale system design....'"
                }
                value={jobDescription}
                onChange={handleJobDescriptionChange}
                maxLength={MAX_JOB_DESC_CHARS}
              />
              <span className="char-count">
                {jobDescription.length} / {MAX_JOB_DESC_CHARS} chars
              </span>
            </div>
          </div>

          <div className="home__divider" aria-hidden="true" />

          <div className="home__panel">
            <div className="panel-heading">
              <h2>
                <span className="icon-badge icon-badge--pink" aria-hidden="true">
                  <UserIcon />
                </span>
                Your Profile
              </h2>
            </div>

            <div className="input-group">
              <p className="input-label">
                Upload Resume{' '}
                <small className="highlight">(Best Results)</small>
              </p>

              <label
                htmlFor="resume"
                className={`dropzone${isDragActive ? ' dropzone--active' : ''}${
                  resumeFile ? ' dropzone--filled' : ''
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
              >
                <span className="dropzone__icon" aria-hidden="true">
                  <UploadIcon />
                </span>
                {resumeFile ? (
                  <>
                    <span className="dropzone__title">{resumeFile.name}</span>
                    <span className="dropzone__hint">Click to choose a different file</span>
                  </>
                ) : (
                  <>
                    <span className="dropzone__title">Click to upload or drag &amp; drop</span>
                    <span className="dropzone__hint">PDF or DOCX (Max 5MB)</span>
                  </>
                )}
              </label>
              <input
                ref={fileInputRef}
                hidden
                type="file"
                name="resume"
                id="resume"
                accept=".pdf,.docx"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
            </div>

            <div className="or-divider">
              <span>OR</span>
            </div>

            <div className="input-group input-group--grow">
              <p className="input-label">Quick Self-Description</p>
              <textarea
                name="selfDescription"
                id="selfDescription"
                placeholder="Briefly describe your experience, key skills and years of experience if you don't have a resume handy...."
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
              />
            </div>

            <div className="info-banner">
              <span className="info-banner__icon" aria-hidden="true">
                <InfoIcon />
              </span>
              <p>
                Either a <strong>Resume</strong> or a <strong>Self Description</strong> is
                required to generate a personalized plan.
              </p>
            </div>
          </div>
        </div>

        <footer className="home__footer">
          {submitError && <p className="form-error">{submitError}</p>}
          <p className="home__footer-note">AI-Powered Strategy Generation &bull; Approx 30s</p>
          <button
            type="button"
            className="button gradient-button"
            disabled={!canGenerate}
            onClick={handleSubmit}
          >
            <SparkleIcon />
            {isSubmitting ? 'Generating…' : 'Generate My Interview Strategy'}
          </button>
        </footer>

        <section className="home__history">
          <div className="home__history-head">
            <h2>Your Previous Records</h2>
            <Link to="/history">View all →</Link>
          </div>
          <HistoryList limit={6} />
        </section>

        <nav className="home__legal">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/help">Help Center</a>
        </nav>
      </div>
    </main>
    </>
  );
};

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
    <path d="M7 9l5-5 5 5" />
    <path d="M12 4v12" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
  </svg>
);

export default Home;