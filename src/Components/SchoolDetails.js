import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Header from '../Header';
import Prompts from './Prompts';
import { useCombined } from './CollegeContext'; // Import the custom hook to access context
import { getChatResponse } from './API'; // Import the API logic
import './SchoolDetails.css';
import ScholarshipTable from './ScholarshipTable';

const SchoolDetails = () => {
  const { ipedsId } = useParams();
  const { user, myColleges } = useCombined();
  const [school, setSchool] = useState(null);
  const [messages, setMessages] = useState([]);
  const [botMessage, setBotMessage] = useState('');
  const [userData, setUserData] = useState({});
  const [currentStep, setCurrentStep] = useState('welcome');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [scholarshipData, setScholarshipData] = useState('');
  const [error, setError] = useState(null);
  const [input, setInput] = useState(''); // Define input state

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      const schoolDocRef = doc(db, 'collegeData', ipedsId);
      const schoolDocSnap = await getDoc(schoolDocRef);

      if (schoolDocSnap.exists()) {
        const schoolDetails = schoolDocSnap.data();
        setSchool(schoolDetails);
      }
    };

    fetchSchoolDetails();
  }, [ipedsId]);

  useEffect(() => {
    const welcomeMessage = ``;
    setMessages([{ role: 'bot', content: welcomeMessage }]);
  }, []);

  const handleButtonClick = async (instruction) => {
    const userMessage = { role: 'user', content: instruction };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true);

    let botResponse = '';

    try {
      botResponse = await getChatResponse(instruction, myColleges);
    } catch (error) {
      botResponse = 'Something went wrong. Please try again.';
    } finally {
      const botMessage = {
        role: 'bot',
        content: botResponse,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setBotMessage(botMessage.content);
      setLoading(false);
    }
  };

  const handleResetMessages = (customMessage = '') => {
    const welcomeMessage = `You are an advisor for ${school?.Name}. ${customMessage}`;
    setMessages([{ role: 'bot', content: welcomeMessage }]);
    setBotMessage(welcomeMessage);
    setUserData({});
    setCurrentStep('welcome');
  };

  const fetchMeritData = async (refresh = false) => {
    setLoading(true);
    try {
      const schoolDocRef = doc(db, 'collegeData', ipedsId);
      const schoolDocSnap = await getDoc(schoolDocRef);

      if (schoolDocSnap.exists()) {
        const schoolDetails = schoolDocSnap.data();

        if (schoolDetails?.meritDataTable && !refresh) {
          setScholarshipData(schoolDetails.meritDataTable);
        } else {
          const response = await getChatResponse(`Give me merit aid scholarship information name, criteria, deadlines, amount,and more for ${school.Name} in a CSV string but instead of commas to seperate values use semicolons, dont say sure here it is just give relevant table!and more (NOT MERIT AID RELATED) I can apply for at ${school.Name} in a a CSV string but instead of commas to seperate values use semicolons. DONT SAY Sure, here is the requested information in CSV format! Just give string to be parsed `);
          console.log('GPT response: ', response);
          setScholarshipData(response);
          await updateDoc(schoolDocRef, {
            meritDataTable: response,
          });
        }
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchScholarshipData = async (refresh = false) => {
    setLoading(true);
    try {
      const schoolDocRef = doc(db, 'collegeData', ipedsId);
      const schoolDocSnap = await getDoc(schoolDocRef);

      if (schoolDocSnap.exists()) {
        const schoolDetails = schoolDocSnap.data();

        if (schoolDetails?.scholarshipDataTable && !refresh) {
          setScholarshipData(schoolDetails.scholarshipDataTable);
        } else {
          const response = await getChatResponse(`Give me information on other scholarships, name, criteria, deadlines, amount,and more (NOT MERIT AID RELATED) I can apply for at ${school.Name} in a a CSV string but instead of commas to seperate values use semicolons. DONT SAY Sure, here is the requested information in CSV format! Just give string to be parsed`);
          console.log('GPT response: ', response);
          setScholarshipData(response);
          await updateDoc(schoolDocRef, {
            scholarshipDataTable: response,
          });
        }
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithPrompt = async (prompt) => {
    setLoading2(true);
    try {
      const fullPrompt = `${prompt} ${input}`;
      console.log('Full prompt to API:', fullPrompt);
      const response = await getChatResponse(fullPrompt, myColleges);
      console.log('GPT response: ', response);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: input },
        { role: 'bot', content: response },
      ]);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading2(false);
    }
  };

  if (!school) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="school-details-container">
        <h1>{school.Name}</h1>
        <p>IPEDS ID: {school['IPEDS ID']}</p>
        <p>Total price for in-state students 2022-23: {school['Total price for in-state students 2022-23']}</p>
        <p>Total price for out-of-state students 2022-23: {school['Total price for out-of-state students 2022-23']}</p>
        <p>Merit Aid Cutoff Score: {school['Merit Aid Cutoff Score']}</p>
        <p>Avg merit award for Freshman w/out need: {school['Avg merit award for Freshman w/out need']}</p>
        {/* Add more details as needed */}

        <button onClick={() => fetchMeritData(false)} className="submit-button">
          Fetch Merit Aid Information
        </button>
        <button onClick={() => fetchMeritData(true)} className="submit-button">
          Refresh Merit Aid Information
        </button>

        <button onClick={() => fetchScholarshipData(false)} className="submit-button">
          Fetch Scholarship Information
        </button>
        <button onClick={() => fetchScholarshipData(true)} className="submit-button">
          Refresh Scholarship Information
        </button>

        <div className="screen-container">
          <div className="chat-container">
            <div className="chat-box">
              <div className="messages">
                {loading && <div>Loading...</div>}
                {error && <div>{error}</div>}
                {scholarshipData && <ScholarshipTable data={scholarshipData} />}
              </div>
            </div>
          </div>
          
          <div className="chat-container2">
            <div className="chat-box">
              <div className="messages">
                {loading2 && <div>Loading...</div>}
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="css-6n9yju">
                <input
                  placeholder="Type your message here..."
                  className="chakra-input css-1pgcnou"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  mr={2}
                />
                <button type="button" onClick={() => handleSubmitWithPrompt(`Be confident and concise in questions asked, you are an advisor for ${school.Name}`)} className="chakra-button css-gllksg">
                  Submit
                </button>
                <button type="button" onClick={() => handleResetMessages(setMessages)} className="chakra-button css-reset">
                  Reset Messages
                </button>
              </div>
              <div className="button-container">
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SchoolDetails;
