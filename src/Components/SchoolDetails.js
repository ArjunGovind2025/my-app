import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useCombined } from './CollegeContext'; 
import { getChatResponse, getChatResponseFree } from './API'; 
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { FaLock } from 'react-icons/fa'; 
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { Typewriter } from 'react-simple-typewriter';
import './SchoolDetails.css';
import '../global.css';
import ScholarshipTable from './ScholarshipTable';
import PieChartComponent from './PieChartComponent';
import Modal from './Modal';
import { UpgradeTooltip, UpgradeTooltipNoBlur } from './UpgradeTooltip';

const SchoolDetails = () => {
  const { ipedsId } = useParams();
  const { user, uid, myColleges} = useCombined();
  const [school, setSchool] = useState(null);
  const [messages, setMessages] = useState([]);
  const [botMessage, setBotMessage] = useState('');
  const [userData, setUserData] = useState({});
  const [currentStep, setCurrentStep] = useState('welcome');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [scholarshipData, setScholarshipData] = useState('');
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [visibleColleges, setVisibleColleges] = useState([]); // To store the list of visible colleges
  const [userDataLoaded, setUserDataLoaded] = useState(false); // To track if the user data is fully loaded

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      setLoading(true); // Set loading state
      try {
        const schoolDocRef = doc(db, 'collegeData', ipedsId);
        const schoolDocSnap = await getDoc(schoolDocRef);
  
        if (schoolDocSnap.exists()) {
          const schoolDetails = schoolDocSnap.data();
          setSchool(schoolDetails);
  
          const welcomeMessage = `Hi, I am an advisor for ${schoolDetails.Name}. Ask me any questions you have!`;
          setMessages([{ role: 'bot', content: welcomeMessage }]);
  
          console.log('School data fetched:', schoolDetails);
          
          if (schoolDetails.Name) {
            await fetchMeritData(false);
          }
        } 
         else {
          console.error('School data not found');
        }
      } catch (error) {
        console.error('Error fetching school details:', error);
      } finally {
        setLoading(false); // Stop loading state
      }
    };
  
    fetchSchoolDetails();
  }, [ipedsId]); // Add ipedsId as a dependency
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.uid) {
          const userDocRef = doc(db, 'userData', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData(data); // Store user data
            setVisibleColleges(data.visibleColleges || []); // Update visible colleges
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setUserDataLoaded(true); // Mark data as loaded
      }
    };
  
    fetchUserData();
  }, [user]);
/*
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleSelectStart = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's')) || // Prevent Ctrl+C, Ctrl+U, Ctrl+S
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Prevent Ctrl+Shift+I
        (e.metaKey && (e.key === 'c' || e.key === 'u' || e.key === 's')) || // Prevent Cmd+C, Cmd+U, Cmd+S (Mac)
        (e.metaKey && e.shiftKey && e.key === 'I') // Prevent Cmd+Shift+I (DevTools on Mac)
      ) {
        e.preventDefault();
      }
    };
  
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); */

  const isCollegeVisible = Array.isArray(visibleColleges) && visibleColleges.includes(Number(ipedsId));

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
          const response = await getChatResponseFree(user.uid, `Give me info on merit scholarships (non need) I can apply for at ${school.Name} in a CSV string but instead of commas to separate values use semicolons. DONT SAY "Sure, here is the requested information in CSV format!" Just give string to be parsed with headers. The headers should be scholarship name, aid amount, criteria, deadline, additional info, and link to scholarship.`, "", setShowModal);
          setScholarshipData(response);
          await updateDoc(schoolDocRef, {
            meritDataTable: response,
          });
        }
      }
    } catch (err) {
      //setError('Failed to fetch data');
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
          const response = await getChatResponseFree(user.uid, `Give me info on other scholarships I can apply for at ${school.Name} in a CSV string but instead of commas to separate values use semicolons. DONT SAY "Sure, here is the requested information in CSV format!" Just give string to be parsed with headers. The headers should be scholarship name, aid amount, criteria, deadline, separate application required, need-based, additional info, and link to scholarship.`, "", setShowModal);
          setScholarshipData(response);
          await updateDoc(schoolDocRef, {
            scholarshipDataTable: response,
          });
        }
      }
    } catch (err) {
      //setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithPrompt = async (prompt) => {
    setLoading2(true);
    try {
      const fullPrompt = `${prompt} ${input}`;
      const response = await getChatResponse(user.uid, fullPrompt, "", setShowModal);
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
            <div className="custom-flex-wrap">
                <span className="badge badge-pill badge-college">
                  In-state: {isNaN(Number(school['Total_price_for_in_state_students_2022_23']))
                    ? 'NA'
                    : school['Total_price_for_in_state_students_2022_23']}
                </span>
                <span className="badge badge-pill badge-college">
                  Out-of-state: {isNaN(Number(school['Total_price_for_out_of_state_students_2022_23']))
                    ? 'NA'
                    : school['Total_price_for_out_of_state_students_2022_23']}
                </span>
                <span className="badge badge-pill badge-college">
                  Percent receiving merit award: {isCollegeVisible ? (
                    `${school['% Fresh w/out need Receiving Merit Aid'] || '15'}%`
                  ) : (
                    <UpgradeTooltip>
                      <span className="blurred-text">
                        {`${school['Percent_Freshman_without_need_receiving_merit_aid'] || '15'}%`}
                      </span>
                    </UpgradeTooltip>
                  )}
                </span>
                <span className="badge badge-pill badge-college">
                  Avg merit award: {isCollegeVisible ? (
                    school['Avg_merit_award_for_Freshman_without_need'] || '$7,500'
                  ) : (
                    <UpgradeTooltip>
                      <span className="blurred-text">
                        {school['Avg merit award for Freshman w/out need'] || '$7,500'}
                      </span>
                    </UpgradeTooltip>
                  )}
                </span>
                <span className="badge badge-pill badge-college">
                  4 yr Graduation Rate: {school['4 yr Graduation Rate']}%
                </span>
                <span className="badge badge-pill badge-college">
                  Total Students: {school['Size (all students)']}
                </span>
                <span className="badge badge-pill badge-college">
                  Mean Earnings After 10 Years: {school['Mean Earnings of Students Working After 10 Years']}
                </span>
              </div>
            </CardContent>
          </Card>


      <div className="chat-container-wrapper">
          <Card className="chat-container">
            {/*
              <CardHeader>
                <CardTitle>School Scholarships</CardTitle>
              </CardHeader>
              */}
            <CardContent className="chat-box">
            <Tabs defaultValue="fetchMeritData" onValueChange={(value) => {
            if (value === 'fetchMeritData') fetchMeritData(false);
            else if (value === 'refreshMeritData') fetchMeritData(true);
            else if (value === 'fetchScholarshipData') fetchScholarshipData(false);
            else if (value === 'refreshScholarshipData') fetchScholarshipData(true);
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fetchMeritData">Merit Aid Scholarships</TabsTrigger>
              {/*<TabsTrigger value="refreshMeritData">Refresh Merit Aid Information</TabsTrigger>*/}


              {isCollegeVisible ? (
    <TabsTrigger value="fetchScholarshipData">School Specific Scholarships</TabsTrigger>
  ) : (
    <UpgradeTooltipNoBlur>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'not-allowed' }}>
        <TabsTrigger value="fetchScholarshipData" disabled>
          School Specific Scholarships
        </TabsTrigger>
        <div className="lock" style={{ position: 'absolute', right: '10px' }}>
          <FaLock style={{ fontSize: '.85em' }} />
        </div>
      </div>
    </UpgradeTooltipNoBlur>
  )}

              {/*<TabsTrigger value="refreshScholarshipData">Refresh Scholarship Information</TabsTrigger>*/}
            </TabsList>

        

            <TabsContent value="refreshMeritData">
              <Card>
                <CardHeader>
                  <CardTitle>Refresh Merit Aid Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Add any specific content or inputs for this tab here */}
                  <Button onClick={() => fetchMeritData(true)}>Refresh</Button>
                </CardContent>
              </Card>
            </TabsContent>

         
            <TabsContent value="refreshScholarshipData">
              <Card>
                <CardHeader>
                  <CardTitle>Refresh Scholarship Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Add any specific content or inputs for this tab here */}
                  <Button onClick={() => fetchScholarshipData(true)}>Refresh</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
              <div className="messages">
                {loading && <div>Loading...</div>}
                {error && <div>{error}</div>}
                {scholarshipData && <ScholarshipTable data={scholarshipData} ipedsId={ipedsId} />}
              </div>
              
            </CardContent>
          </Card>
        </div>

        
        
  
      </div>
  
      <div className="screen-container">
      <Card className="school-chart w-[400px]">
       {/*
          <CardHeader>
            <CardTitle>Financial Breakdown</CardTitle>
          </CardHeader>
          */}
          <CardContent className="p-0 no-outline">
            <PieChartComponent uid={uid} ipedsId={ipedsId} myColleges={myColleges} visibleColleges={visibleColleges} className="p-0"/>
          </CardContent>
        </Card>
        
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
                {/* <Button type="button" onClick={() => handleResetMessages(setMessages)}>Reset Messages</Button>*/}
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
