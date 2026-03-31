const ProgressBar = ({ progress = 0, label = '', stage = '', complete = false }) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-label">
        <span className="progress-bar-label-text">{label || stage || 'Processing'}</span>
        <span className="progress-bar-label-value">{Math.round(progress)}%</span>
      </div>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${complete || progress >= 100 ? 'complete' : ''}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
