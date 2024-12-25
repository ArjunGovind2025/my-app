import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebaseConfig";

const OfferLetterList = () => {
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "offerLetters"));
      setLetters(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const handleView = async (id, earnings) => {
    const docRef = doc(db, "offerLetters", id);
    await updateDoc(docRef, {
      views: increment(1),
      earnings: earnings + 0.1,
    });
    alert("View recorded!");
  };

  return (
    <div>
      {letters.map((letter) => (
        <div key={letter.id}>
          <a href={letter.fileUrl} target="_blank" rel="noopener noreferrer">
            View Offer Letter
          </a>
          <button onClick={() => handleView(letter.id, letter.earnings)}>Record View</button>
        </div>
      ))}
    </div>
  );
};

export default OfferLetterList;
