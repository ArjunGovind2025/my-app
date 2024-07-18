import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useCombined } from './CollegeContext'; // Use the combined context
import './CollegeSearch.css';

const CollegeSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { user, addCollegeToUser } = useCombined(); // Use the context to get user and addCollegeToUser

  const fetchSuggestions = async (query) => {
    console.log('Fetching suggestions for:', query);
    try {
        const docRef = doc(db, 'searchData2', 'allData');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Extract the values from the object where keys are IPEDS IDs
            const colleges = Object.values(data);
            

            const filtered = colleges.filter(college => 
                college.Name && college.Name.toLowerCase().includes(query.toLowerCase())
            );

            setSuggestions(filtered);
        } else {
        }
    } catch (error) {
    }
};


  const handleChange = (e) => {
    const query = e.target.value;
    setQuery(query);
    if (query.length > 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddCollege = (college) => {
    addCollegeToUser(college); // Use the addCollegeToUser function from context
    setQuery(''); // Clear the input
    setSuggestions([]); // Clear the suggestions
  };

  return (
    <div className="college-search">
      <input
        placeholder="Search for a college..."
        className="chakra-input css-1pgcnou"
        value={query}
        onChange={handleChange}
        mr={2}
      />
      <ul className="college-suggestions">
        {suggestions.map(suggestion => (
          <li key={suggestion['IPEDS ID']} className="college-suggestion-item">
            {suggestion.Name}
            <button
              onClick={() => handleAddCollege(suggestion)} // Use the new handler function
              className="add-button"
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CollegeSearch;
