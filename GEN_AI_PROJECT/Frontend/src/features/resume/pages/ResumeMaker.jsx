import { useState } from 'react';
import { useNavigate } from 'react-router';
import Navbar from '../../../components/Navbar';
import { generateResume } from '../services/resume.api';
import '../style/resume.scss';

const MIN_CHARS = 30;

const ResumeMaker = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    selfDescription: '', targetRole: '', jobDescription: '',
    fullName: '', phone: '', location: '', links: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.selfDescription.trim().length >= MIN_CHARS && !busy;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    try {
      const { resume } = await generateResume({ ...form, resumeFile });
      navigate(`/resume/${resume._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate the resume. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="rm">
        <header className="rm__header">
          <h1>Build a <span className="grad">Job-Winning Resume</span></h1>
          <p>
            Describe yourself in your own words. We turn it into a polished, ATS-friendly resume —
            using only what you tell us, nothing invented.
          </p>
        </header>

        <form className="rm__form" onSubmit={submit}>
          <label className="rm__field rm__field--full">
            <span>Self Description <em>required</em></span>
            <textarea
              rows={9}
              value={form.selfDescription}
              onChange={set('selfDescription')}
              placeholder={"Your education, skills, internships/jobs, projects (what you built, with which tech, any results), certifications, achievements...\n\ne.g. I'm a final-year B.Tech CS student. Built a MERN e-commerce app with JWT auth and Razorpay, 200+ users. Intern at XYZ where I..."}
            />
            <small className={form.selfDescription.trim().length >= MIN_CHARS ? 'ok' : ''}>
              {form.selfDescription.trim().length} chars · more detail = better resume
            </small>
          </label>

          <label className="rm__field">
            <span>Target Role</span>
            <input value={form.targetRole} onChange={set('targetRole')} placeholder="e.g. Full Stack Developer" />
          </label>
          <label className="rm__field">
            <span>Full Name</span>
            <input value={form.fullName} onChange={set('fullName')} placeholder="Defaults to your username" />
          </label>
          <label className="rm__field">
            <span>Phone</span>
            <input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          </label>
          <label className="rm__field">
            <span>Location</span>
            <input value={form.location} onChange={set('location')} placeholder="Pune, India" />
          </label>
          <label className="rm__field rm__field--full">
            <span>Links (LinkedIn, GitHub, portfolio — comma or new line separated)</span>
            <input value={form.links} onChange={set('links')} placeholder="linkedin.com/in/you, github.com/you" />
          </label>

          <label className="rm__field rm__field--full">
            <span>Job Description <em className="opt">optional — tailors the resume to this job</em></span>
            <textarea rows={5} value={form.jobDescription} onChange={set('jobDescription')}
              placeholder="Paste the job posting to optimise keywords for it..." />
          </label>

          <label className="rm__field rm__field--full">
            <span>Existing Resume PDF <em className="opt">optional — used as extra material</em></span>
            <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
          </label>

          {error && <p className="rm__error">{error}</p>}

          <button className="rm__btn" disabled={!canSubmit}>
            {busy ? 'Crafting your resume… (~20s)' : '✦ Generate My Resume'}
          </button>
        </form>
      </main>
    </>
  );
};

export default ResumeMaker;
