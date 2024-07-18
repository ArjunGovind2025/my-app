// ProgressTracker.js

import React from 'react';

const ProgressTracker = () => {
  return (
    <div role="tablist" aria-orientation="horizontal" className="chakra-tabs__tablist css-1t0im7i">
      <button
        type="button"
        id="tabs-:r6n:--tab-0"
        role="tab"
        tabIndex="-1"
        aria-selected="false"
        aria-controls="tabs-:r6n:--tabpanel-0"
        className="chakra-tabs__tab css-ij7cwy"
        data-index="0"
      >
        <div className="css-3b73vj">
          <div className="css-ad9apl"></div>
          <p className="chakra-text css-u8fm1g">User Info</p>
        </div>
      </button>
      <button
        type="button"
        id="tabs-:r6n:--tab-1"
        role="tab"
        tabIndex="0"
        aria-selected="true"
        aria-controls="tabs-:r6n:--tabpanel-1"
        className="chakra-tabs__tab css-ij7cwy"
        data-index="1"
      >
        <div className="css-1qpme77">
          <div className="css-ad9apl"></div>
          <p className="chakra-text css-u8fm1g">Address</p>
        </div>
      </button>
      <button
        type="button"
        id="tabs-:r6n:--tab-2"
        role="tab"
        tabIndex="-1"
        aria-selected="false"
        aria-controls="tabs-:r6n:--tabpanel-2"
        className="chakra-tabs__tab css-ij7cwy"
        data-index="2"
      >
        <div className="css-l6ct9h">
          <div className="css-fgu5x0"></div>
          <p className="chakra-text css-rg2sdm">Profile</p>
        </div>
      </button>
    </div>
  );
};

export default ProgressTracker;
