import React from 'react';
import './StepTracker.css'

const StepTracker = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="step-tracker">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`step ${currentStep === step ? 'active' : ''}`}
          onClick={() => onStepClick(step)}
        >
          {step}
        </div>
      ))}
    </div>
  );
};

export default StepTracker;
