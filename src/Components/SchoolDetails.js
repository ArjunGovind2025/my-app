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
import Modal from './Modal';

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
  const [showModal, setShowModal] = useState(false);


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
      botResponse = await getChatResponse(user.uid, instruction, "", setShowModal);
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
          const response = await getChatResponse(user.uid, `Give me info on merit scholarships (non need) i can apply for at ${school.Name} in a a CSV string but instead of commas to seperate values use semicolons. DONT SAY Sure, here is the requested information in CSV format! Just give string to be parsed and with headers The headers should be scholarship name, aid amount, criteria, deadline, and additional info`, "", setShowModal);
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
          const response = await getChatResponse(user.uid, `Give me info on other scholarships i can apply for at ${school.Name} in a a CSV string but instead of commas to seperate values use semicolons. DONT SAY Sure, here is the requested information in CSV format! Just give string to be parsed and with headers The headers should be scholarship name, aid amount, criteria, deadline, seperate applciation required, need based, and additional info `, "", setShowModal);
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
      const response = await getChatResponse(user.uid, fullPrompt,"", setShowModal);
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
    {showModal && <Modal message="API call limit exceeded. Please upgrade your plan." onClose={() => setShowModal(false)} />}
    <div className="school-details-container">
      <div className="school-details-content">
        
      <Card className="school-details h-[200px]">
        <CardHeader>
          <CardTitle>{school.Name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-pill badge-college">In-state: {school['Total price for in-state students 2022-23']}</span>
            <span className="badge badge-pill badge-college">Out-of-state: {school['Total price for out-of-state students 2022-23']}</span>
            <span className="badge badge-pill badge-college">Percent recieving merit award: {school['% Fresh w/out need Receiving Merit Aid']}%</span>
            <span className="badge badge-pill badge-college">Avg merit award: {school['Avg merit award for Freshman w/out need']}</span>
            <span className="badge badge-pill badge-college">4 yr Graduation Rate: {school['4 yr Graduation Rate']}%</span>
            <span className="badge badge-pill badge-college">Total Students: {school['Size (all students)']}</span>
            <span className="badge badge-pill badge-college">Mean Earnings After 10 Years: {school['Mean Earnings of Students Working After 10 Years']}</span>

          </div>
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
                {scholarshipData && <ScholarshipTable data={scholarshipData} ipedsId={ipedsId} />}
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
              <CardTitle>{school.Name} AI Advisor</CardTitle>
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
    </>
  );
  
};

export default SchoolDetails;
