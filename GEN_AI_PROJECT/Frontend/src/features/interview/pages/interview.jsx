import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import '../style/interview.scss';
import { useInterview } from '../hooks/useInterview';
import Navbar from '../../../components/Navbar';

const SECTIONS = [
  { id: 'technical', label: 'Technical Questions', Icon: (props) => <CodeIcon {...props} /> },
  { id: 'behavioral', label: 'Behavioral Questions', Icon: (props) => <ChatIcon {...props} /> },
  { id: 'roadmap', label: 'Road Map', Icon: (props) => <MapIcon {...props} /> },
];

const severityLabel = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const Interview = (props) => {
  const { interviewId } = useParams();
  const { report, loading, getReportById } = useInterview();

  const [activeSection, setActiveSection] = useState('technical');
  const [expandedIndex, setExpandedIndex] = useState(0);

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  if (loading || !report) {
    return (
      <main className="interview">
        <p className="empty-state">Loading interview report...</p>
      </main>
    );
  }

  const handleSectionChange = (id) => {
    setActiveSection(id);
    setExpandedIndex(0);
  };

  const renderQuestionList = (questions, emptyLabel) => {
    if (!questions || questions.length === 0) {
      return <p className="empty-state">{emptyLabel}</p>;
    }

    return (
      <div className="question-list">
        {questions.map((q, index) => {
          const isOpen = expandedIndex === index;
          return (
            <div key={index} className={`question-card${isOpen ? ' question-card--open' : ''}`}>
              <button
                type="button"
                className="question-card__header"
                onClick={() => setExpandedIndex(isOpen ? -1 : index)}
              >
                <span className="question-card__index">Q{index + 1}</span>
                <span className="question-card__question-text">{q.question}</span>
                <ChevronIcon className="question-card__chevron" />
              </button>

              {isOpen && (
                <div className="question-card__body">
                  <div className="question-card__block">
                    <p className="question-card__label">
                      <LightbulbIcon className="question-card__label-icon" />
                      Why they ask this
                    </p>
                    <p>{q.intention}</p>
                  </div>
                  <div className="question-card__block">
                    <p className="question-card__label">
                      <TargetIcon className="question-card__label-icon" />
                      How to answer
                    </p>
                    <p>{q.answer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderRoadmap = () => {
    if (!report.preparationPlan || report.preparationPlan.length === 0) {
      return <p className="empty-state">No preparation plan yet.</p>;
    }

    return (
      <div className="roadmap">
        {report.preparationPlan.map((day) => (
          <div key={day.day} className="roadmap__day">
            <div className="roadmap__marker">
              <span className="roadmap__day-number">{day.day}</span>
              <span className="roadmap__line" aria-hidden="true" />
            </div>
            <div className="roadmap__content">
              <p className="roadmap__focus">
                <FlagIcon className="roadmap__focus-icon" />
                {day.focus}
              </p>
              <ul className="roadmap__tasks">
                {day.tasks.map((task, i) => (
                  <li key={i}>
                    <CheckIcon />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMainContent = () => {
    if (activeSection === 'technical') {
      return renderQuestionList(report.technicalQuestions, 'No technical questions generated yet.');
    }
    if (activeSection === 'behavioral') {
      return renderQuestionList(report.behavioralQuestions, 'No behavioral questions generated yet.');
    }
    return renderRoadmap();
  };

  return (
    <>
    <Navbar />
    <main className="interview">
      <div className="interview__container">
        <header className="interview__header">
          <div>
            <p className="interview__eyebrow">Interview Plan</p>
            <h1>{report.title}</h1>
          </div>
          <div className="match-score">
            <TrophyIcon className="match-score__icon" />
            <div>
              <span className="match-score__value">{report.matchScore}%</span>
              <span className="match-score__label">Match Score</span>
            </div>
          </div>
        </header>

        <div className="interview__card">
          <nav className="interview__nav">
            <p className="interview__nav-title">Sections</p>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`interview__nav-item${
                  activeSection === section.id ? ' interview__nav-item--active' : ''
                }`}
                onClick={() => handleSectionChange(section.id)}
              >
                <span className="interview__nav-icon">
                  <section.Icon />
                </span>
                {section.label}
              </button>
            ))}
          </nav>

          <div className="interview__divider" aria-hidden="true" />

          <div className="interview__main">{renderMainContent()}</div>

          <div className="interview__divider" aria-hidden="true" />

          <aside className="interview__skills">
            <p className="interview__skills-title">
              <AlertTriangleIcon className="interview__skills-icon" />
              Skill Gaps
            </p>
            <div className="skill-chips">
              {report.skillGaps && report.skillGaps.length > 0 ? (
                report.skillGaps.map((gap, index) => (
                  <span key={index} className={`skill-chip skill-chip--${gap.severity}`}>
                    <span className="skill-chip__dot" aria-hidden="true" />
                    {gap.skill}
                    <span className="skill-chip__severity">{severityLabel[gap.severity]}</span>
                  </span>
                ))
              ) : (
                <p className="empty-state empty-state--compact">No skill gaps found.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
    </>
  );
};

const ChevronIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const CodeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l-6-6 6-6" />
    <path d="M15 6l6 6-6 6" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const MapIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" />
    <path d="M9 4v14" />
    <path d="M15 6v14" />
  </svg>
);

const TrophyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
    <path d="M17 5h3a2 2 0 0 1-2 4h-1" />
    <path d="M7 5H4a2 2 0 0 0 2 4h1" />
  </svg>
);

const AlertTriangleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const LightbulbIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a6 6 0 0 0-4 10.47V15h8v-2.53A6 6 0 0 0 12 2z" />
  </svg>
);

const TargetIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const FlagIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22V4" />
    <path d="M4 4h14l-2 4 2 4H4" />
  </svg>
);

export default Interview;
