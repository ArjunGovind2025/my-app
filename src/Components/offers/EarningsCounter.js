import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const EarningsCounter = () => {
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    const fetchEarnings = async () => {
      const userEarningsQuery = query(
        collection(db, "offerLetters"),
        where("uploadedBy", "==", "currentUserId")
      );
      const querySnapshot = await getDocs(userEarningsQuery);
      let total = 0;
      querySnapshot.forEach((doc) => {
        total += doc.data().earnings;
      });
      setEarnings(total);
    };

    fetchEarnings();
  }, []);

  return <div>Total Earnings: ${earnings.toFixed(2)}</div>;
};

export default EarningsCounter;
