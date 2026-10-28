import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Navbar from '../../../components/Navbar';
import HistoryList from '../components/HistoryList';
import { getAllInterviewReports, getAllResumes } from '../../resume/services/resume.api';
import '../style/history.scss';

const History = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([getAllInterviewReports(), getAllResumes()])
      .then(([r, c]) => setStats({ plans: r.interviewReports?.length || 0, resumes: c.resumes?.length || 0 }))
      .catch(() => setStats(null));
  }, []);

  return (
    <>
      <Navbar />
      <main className="hp">
        <header className="hp__hero">
          <p className="hp__eyebrow">Your workspace</p>
          <h1>My <span>History</span></h1>
          <p className="hp__sub">
            Every interview plan and resume you've created — open, review or clean up anytime.
          </p>

          {stats && (
            <div className="hp__stats">
              <div><strong>{stats.plans}</strong><span>Interview plans</span></div>
              <div><strong>{stats.resumes}</strong><span>Resumes</span></div>
              <div><strong>{stats.plans + stats.resumes}</strong><span>Total records</span></div>
            </div>
          )}

          <div className="hp__actions">
            <Link to="/" className="hx__btn hx__btn--primary">+ New interview plan</Link>
            <Link to="/resume" className="hx__btn">+ New resume</Link>
          </div>
        </header>

        <HistoryList controls />
      </main>
    </>
  );
};

export default History;
