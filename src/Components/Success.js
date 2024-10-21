import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCombined } from './CollegeContext';

const Success = () => {
  const location = useLocation();
  const { user } = useCombined(); 
  const [tier, setTier] = useState(null);
  const [accessLevel, setAccessLevel] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tierValue = query.get('tier');
    const accessLevelValue = query.get('accessLevel'); 

    console.log('Access Level from URL:', accessLevelValue); // Debugging line

    if (accessLevelValue) {
      setAccessLevel(accessLevelValue);
    }

    if (tierValue) {
      setTier(tierValue);
    }

    if (accessLevelValue && user?.uid) {
      console.log('Updating subscription with access level:', accessLevelValue); // Debugging line
      const updateSubscription = async () => {
        try {
          await fetch('https://us-central1-ai-d-ce511.cloudfunctions.net/api/update-user-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid: user.uid, accessLevel: accessLevelValue }),
          });
        } catch (error) {
          console.error('Error updating user subscription:', error);
        }
      };

      updateSubscription();
    }
  }, [location, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Thank You for Your Purchase!</h1>
      {tier && <p>Your subscription to the {accessLevel} Plan has been successfully processed.</p>}
    </div>
  );
};

export default Success;
