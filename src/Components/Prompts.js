import React from 'react';
import './Prompts.css';

function Prompts({ handleMeritAidClick, handleNeedAidClick }) {
  return (
    <div className="css-1q2fuvl">
      <div className="css-1ciqiz7" onClick={handleNeedAidClick}>
        Need Based Aid
      </div>
      <div className="css-1ciqiz7" onClick={handleMeritAidClick}>
        Merit Aid
      </div>
      <div className="css-1ciqiz7">
        Other Scholarships
      </div>
    </div>
  );
}

export default Prompts;
