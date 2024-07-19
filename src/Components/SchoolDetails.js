import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useCombined } from './CollegeContext'; // Import the custom hook to access context
import { getChatResponse } from './API'; // Import the API logic
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Typewriter } from 'react-simple-typewriter';
import './SchoolDetails.css';
import '../global.css';
import ScholarshipTable from './ScholarshipTable';
import PieChartComponent from './PieChartComponent';

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
    <div className="school-details-container">
      <div className="school-details-content">
        
        <Card className="school-details h-[200px]">
          <CardHeader>
            <CardTitle>{school.Name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>IPEDS ID: {school['IPEDS ID']}</p>
            <p>Total price for in-state students 2022-23: {school['Total price for in-state students 2022-23']}</p>
            <p>Total price for out-of-state students 2022-23: {school['Total price for out-of-state students 2022-23']}</p>
            <p>Merit Aid Cutoff Score: {school['Merit Aid Cutoff Score']}</p>
            <p>Avg merit award for Freshman w/out need: {school['Avg merit award for Freshman w/out need']}</p>
          </CardContent>
        </Card>
        
        <Card className="school-chart w-[400px]">
          <CardHeader>
            <CardTitle>Financial Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent ipedsId={ipedsId} myColleges={myColleges} />
          </CardContent>
        </Card>
  
      </div>
  
      <div className="screen-container">
        <div className="chat-container-wrapper">
          <Card className="chat-container">
            <CardHeader>
              <CardTitle>School Scholarships</CardTitle>
            </CardHeader>
            <CardContent className="chat-box">
              <div className="messages">
                {loading && <div>Loading...</div>}
                {error && <div>{error}</div>}
                {scholarshipData && <ScholarshipTable data={scholarshipData} />}
              </div>
              <div className="button-container">
                <Button onClick={() => fetchMeritData(false)} variant="secondary">Fetch Merit Aid Information</Button>
                <Button onClick={() => fetchMeritData(true)} variant="secondary">Refresh Merit Aid Information</Button>
                <Button onClick={() => fetchScholarshipData(false)} variant="secondary">Fetch Scholarship Information</Button>
                <Button onClick={() => fetchScholarshipData(true)} variant="secondary">Refresh Scholarship Information</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="chat-container2-wrapper">
          <Card className="chat-container2">
            <CardHeader>
              <CardTitle>Assistant</CardTitle>
            </CardHeader>
            <CardContent className="chat-box">
              <div className="messages">
                {loading2 && <div>Loading...</div>}
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <Typewriter
                      words={[msg.content]}
                      loop={1}
                      typeSpeed={20}
                      deleteSpeed={50}
                      delaySpeed={1000}
                    />
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
                <Button type="button" onClick={() => handleSubmitWithPrompt(`Be confident and concise in questions asked, you are an advisor for ${school.Name}`)}>Submit</Button>
                <Button type="button" onClick={() => handleResetMessages(setMessages)}>Reset Messages</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  
};

export default SchoolDetails;
