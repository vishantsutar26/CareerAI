import React, { useEffect, useState } from 'react';
import '../style/generating.scss';

const STEPS = [
  'Reading your resume...',
  'Matching your profile against the job description...',
  'Identifying likely technical questions...',
  'Identifying likely behavioral questions...',
  'Spotting skill gaps...',
  'Building your day-by-day preparation plan...',
];

const STEP_INTERVAL_MS = 2200;

/**
 * Full-screen overlay shown while the AI generates the interview report.
 * The backend returns a single response with no progress events, so this
 * cycles through purely cosmetic status messages to keep the wait engaging.
 * It has no bearing on when the real result arrives - that's still driven
 * by the actual API call finishing.
 */
const GeneratingOverlay = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1 < STEPS.length ? prev + 1 : prev));
    }, STEP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="generating-overlay">
      <div className="generating-overlay__card">
        <div className="generating-overlay__spinner" aria-hidden="true" />
        <h2>Generating Your Interview Strategy</h2>
        <p className="generating-overlay__step">{STEPS[stepIndex]}</p>

        <div className="generating-overlay__progress">
          {STEPS.map((step, index) => (
            <span
              key={step}
              className={`generating-overlay__dot${
                index <= stepIndex ? ' generating-overlay__dot--active' : ''
              }`}
            />
          ))}
        </div>

        <p className="generating-overlay__note">This usually takes about 30 seconds.</p>
      </div>
    </div>
  );
};

export default GeneratingOverlay;
