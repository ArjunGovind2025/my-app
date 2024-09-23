import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import your Firebase config

// Main Tooltip component with logging
const UpgradeTooltipNoBlur = ({ children, uid, ipedsId, onUnlock }) => {
  const [canUnlock, setCanUnlock] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMouseEnter = async () => {
    if (!uid) {
      console.log('No UID provided.');
      return;
    }
    setLoading(true);
    console.log('Hovering over the tooltip, loading data...');

    try {
      const userDoc = await getDoc(doc(db, 'userData', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data fetched:', userData);

        const hasStandardAccess = userData.access === 'Standard';
        const hasPremiumAccess = userData.access === 'Premium';
        const visibleSchoolsCount = userData.visibleColleges?.length || 0;

        if (hasStandardAccess && visibleSchoolsCount < 15) {
          setCanUnlock(true);
          console.log('User has Standard access and can unlock up to 15 schools.');
        } else if (hasPremiumAccess && visibleSchoolsCount < 30) {
          setCanUnlock(true);
          console.log('User has Premium access and can unlock up to 30 schools.');
        } else {
          setCanUnlock(false);
          console.log('User cannot unlock: either access level is insufficient or limit reached.');
        }
      } else {
        console.log('No user document found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild onMouseEnter={handleMouseEnter}>
          <span
            style={{
              cursor: 'pointer',
              display: 'inline-block',
            }}
            onClick={canUnlock ? onUnlock : null} // Call the onUnlock function
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" style={{ fontSize: '14px', padding: '5px 10px' }}>
          {!loading && (
            canUnlock ? (
              <span style={{ color: 'black', textDecoration: 'underline' }}>Click to unlock</span>
            ) : (
              <Link to="/upgrade" style={{ color: 'black', textDecoration: 'underline' }}>
                Upgrade
              </Link>
            )
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Original UpgradeTooltip component for reference
const UpgradeTooltip = ({ children, uid, ipedsId }) => {
  const [canUnlock, setCanUnlock] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to check criteria when hovering
  const handleMouseEnter = async () => {
    if (!uid) return; // Ensure we have a valid uid before proceeding
    setLoading(true);

    try {
      const userDoc = await getDoc(doc(db, 'userData', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if user has standard access and fewer than 15 visible schools
        const hasStandardAccess = userData.access === 'Standard';
        const hasFewerThan15VisibleSchools = (userData.visibleColleges?.length || 0) < 15;

        

        if (hasStandardAccess && hasFewerThan15VisibleSchools) {
          setCanUnlock(true);
          console.log('User can unlock the school price.');
        } else {
          setCanUnlock(false);
          console.log('User cannot unlock the school price.');
        }
      } else {
        console.log('No user document found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to unlock the price
  const unlockPrice = async () => {
    if (!canUnlock) return;

    try {
      const userDocRef = doc(db, 'userData', uid);
      const userData = (await getDoc(userDocRef)).data(); // Fetch current user data

      await updateDoc(userDocRef, {
        visibleColleges: [...(userData.visibleColleges || []), ipedsId], // Add the school to visibleColleges
      });
      console.log('Price unlocked for school:', ipedsId);
    } catch (error) {
      console.error('Error unlocking price:', error);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild onMouseEnter={handleMouseEnter}>
          <span
            style={{
              filter: canUnlock ? 'none' : 'blur(3px)', // No blur if they can unlock
              cursor: 'pointer',
              display: 'inline-block',
            }}
            onClick={canUnlock ? unlockPrice : null} // Trigger unlock function if they can unlock
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" style={{ fontSize: '14px', padding: '5px 10px' }}>
          {!loading && (
            canUnlock ? (
              <span style={{ color: 'black', textDecoration: 'underline' }}>Click to unlock</span>
            ) : (
              <Link to="/upgrade" style={{ color: 'black', textDecoration: 'underline' }}>
                Upgrade
              </Link>
            )
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UpgradeTooltip;
export { UpgradeTooltip, UpgradeTooltipNoBlur };
