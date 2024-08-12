import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Link } from 'react-router-dom';

const UpgradeTooltip = ({ children }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            style={{
              filter: 'blur(3px)',
              cursor: 'pointer',
              display: 'inline-block',
            }}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" style={{ fontSize: '14px', padding: '5px 10px' }}>
          <Link to="/upgrade" style={{ color: 'black', textDecoration: 'underline' }}>
            Upgrade 
          </Link> to View
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const UpgradeTooltipNoBlur = ({ children }) => {
  return (
    <TooltipProvider> 
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            style={{
              cursor: 'pointer',
              display: 'inline-block',
            }}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" style={{ fontSize: '14px', padding: '5px 10px' }}>
          <Link to="/upgrade" style={{ color: 'black', textDecoration: 'underline' }}>
            Upgrade 
          </Link> to View
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UpgradeTooltip
export { UpgradeTooltip, UpgradeTooltipNoBlur };
