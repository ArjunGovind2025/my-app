import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { updateAccessField } from './Access';
import { useCombined } from './CollegeContext';

const Success = () => {
  const location = useLocation();
  const [tier, setTier] = useState(null);
  const { user } = useCombined(); 


 
  
useEffect(() => {
      const query = new URLSearchParams(location.search);
      const tierValue = query.get('tier');
  
      if (tierValue && user?.uid) { // Ensure user object and uid are available
        setTier(tierValue); // Set the tier value to state
  
        // Update access field asynchronously
        const updateAccess = async () => {
          await updateAccessField(user.uid, tierValue);
        };
  
        updateAccess();
      }
    }, [location, user]);
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-8">Thank You for Your Purchase!</h1>
        {tier && <p>Your subscription to the {tier} plan has been successfully processed.</p>}
      </div>
    );
  };
  

export default Success;
