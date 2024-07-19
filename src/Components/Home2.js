import './Home2.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Colleges2 from './Colleges2';
import CollegeSearch from './CollegeSearch';
import Prompts from './Prompts'
import Header from '../Header.js';
import MySchools from './MySchools.js';
import testMySchools from './testMySchools.js';
import ProgressTracker from './ProgressTracker.js';
import StepTracker from './StepTracker';
import { getChatResponse, getShortChatResponse } from './API'; // Import the API logic
import { useCombined } from './CollegeContext'; // Import the custom hook to access context
import WorkflowsBot from './WorkflowsBot';
import { calculateMeritAidEligibilityScore, fetchMeritAidData } from './meritAidCalculator'; // Import the functions
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { Typewriter } from 'react-simple-typewriter';



const Home2 = () => {
  const { user, userDoc, myColleges, fetchUserDoc, addCollegeByIpedsId } = useCombined(); // Destructure myColleges from the context
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [botMessage, setBotMessage] = useState('');
  const [userData, setUserData] = useState({}); // Store user data
  const [currentStep, setCurrentStep] = useState('welcome'); // Track the current step
  const [loading, setLoading] = useState(false); // Add loading state
  const [gpa, setGpa] = useState(''); // State for GPA
  const [testScores, setTestScores] = useState({}); // State for test scores

  const steps = [
    'Welcome',
    'Add College',
    'Qualify for Financial Aid',
    //'SAI',
    //'income',
    'Calculate SAI',
    //'completeSAI',
    //'submitFAFSA',
    //'reviewAidOffers',
    'Qualify for Merit Aid',
    //'applyMeritAid',
    //'otherScholarships',
    //'complete',
    'Ask Questions',
  ];

  const stepMessages = {
    'Welcome': `Welcome to [Website Name]!\nI'm here to help you navigate through the process of paying for college.\nLet's get started with some basic information.\nWhat state are you from? List state abreviation(ie NY)`,
    'Add College': `The first step is to add at least one college to your college list. Which colleges are you interested in?`,
    'Qualify for Financial Aid': `Do you think you qualify for financial aid? (Yes, No, Not Sure)`,
    'SAI': `Do you know your Student Aid Index? (Yes, No)`,
    'income': `Let's determine if you might qualify for financial aid. What is your family's approximate annual income?`,
    'Calculate SAI': `Please provide the following information to calculate your SAI: 1. Income 2. Assets 3. Family Size 4. Student Income`,
    'completeSAI': `Here is how much money you can expect to receive from your schools:\n`,
    'submitFAFSA': `Please submit your FAFSA and state-specific financial aid applications. Once done, review your financial aid offers and deduct the aid from your college list costs.`,
    'reviewAidOffers': `Review your financial aid offers and deduct the aid from your college list costs. Have you reviewed your offers yet? (Yes, No)`,
    'Qualify for Merit Aid': `Enter your GPA and SAT/ACT scores to calculate merit aid eligibility (ie GPA: 3.5 SAT: 1400 ).`,
    'applyMeritAid': `Great! Based on your academic achievements, let's explore other scholarships you might qualify for.`,
    'otherScholarships': `You have some other scholarships left to explore. Let's find more opportunities.`,
    'complete': `You've completed all the steps! Now you can ask me any questions you have.`,
    'Ask Questions': `You've completed all the steps! Now you can ask me any questions you have.`
  };


  useEffect(() => {
    // Initial message from the chatbot
    const welcomeMessage = `Welcome to [Website Name]!\nI'm here to help you navigate through the process of paying for college.\nLet's get started with some basic information.\nWhat is your name?`;
    setMessages([{ role: 'bot', content: welcomeMessage }]);
    {handleResetMessages()}
  }, []);

  const handleStepClick = (step) => {
    setCurrentStep(step);
    setBotMessage(stepMessages[step]); // Update bot message to reflect the step change
  };
  
  const calculateMeritAidEligibilityScore = (gpa, testScore, testType = 'SAT') => {
    // Normalize GPA
    const normalizedGpa = (gpa - 2.5) / (4.0 - 2.5);

    // Normalize test score based on the test type
    let normalizedTestScore;
    if (testType === 'SAT') {
      normalizedTestScore = testScore / 1600;
    } else if (testType === 'ACT') {
      normalizedTestScore = testScore / 36;
    } else {
      throw new Error("Invalid test type. Please use 'SAT' or 'ACT'.");
    }
    

    // Calculate combined score
    const combinedScore = (normalizedGpa + normalizedTestScore) / 2;

    return combinedScore;
  };

  const storeUserData = async (gpa, testScore, testType) => {
    try {
      const userDocRef = doc(db, 'userData', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      console.log("Firestore document snapshot:", userDocSnap.exists() ? "Document exists" : "Document does not exist");
  
      if (userDocSnap.exists()) {
        // Update the existing document
        console.log("Updating existing document with GPA and Test Score");
   
        await updateDoc(userDocRef, {
          GPA: gpa,
          [testType]: testScore,
        });
        console.log("Document updated successfully");
      } else {
        // Create a new document if it doesn't exist
        console.log("Creating a new document with GPA and Test Score");
        await setDoc(userDocRef, {
          GPA: gpa,
          [testType]: testScore,
        });
        console.log("Document created successfully");
      }
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  const findCollegeIdByName = async (collegeName) => {
    try {
      const docRef = doc(db, 'nameToID', 'collegeNametoIPEDSID');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        for (const [name, id] of Object.entries(data)) {
          if (name.toLowerCase().includes(collegeName.toLowerCase())) {
            return id;
          }
        }
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error finding college ID:', error);
    }
    return null;
  };


  const updateCollegePricesWithNeedAid = async (SAI) => {
    try {
      // Get the current user's document
      const userDocRef = doc(db, 'userData', user.uid); // Replace 'user.uid' with your user identifier logic if different
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const colleges = userData.myColleges || {};
  
        console.log('User data retrieved:', userData); // Log the entire user data
        console.log('Colleges data:', colleges); // Log the initial colleges data
  
        const parsedSAI = parseFloat(SAI); // Convert SAI to a number
  
        if (isNaN(parsedSAI)) {
          console.error(`Invalid SAI value: ${SAI}`);
          return null; // Stop processing if SAI is not a valid number
        }
  
        console.log(`Parsed SAI: ${parsedSAI} (type: ${typeof parsedSAI})`); // Log the parsed SAI value and its type
  
        for (const collegeId in colleges) {
          const college = colleges[collegeId];
  
          console.log(`Processing college ID: ${collegeId}`); // Log the college ID being processed
  
          if (college.myPrice && college['Avg % of Need met for Freshman']) {
            const myPriceString = college.myPrice.replace(/[^0-9.]/g, '');
            const myPrice = parseFloat(myPriceString);
            const avgNeedMet = parseFloat(college['Avg % of Need met for Freshman']) / 100;
  
            // Add more detailed logging
            console.log(`Raw myPrice: ${college.myPrice}, Converted myPrice: ${myPrice}`);
            console.log(`Raw Avg % of Need met for Freshman: ${college['Avg % of Need met for Freshman']}, Converted avgNeedMet: ${avgNeedMet}`);
            console.log(`SAI: ${parsedSAI}`);
  
            // Check if the conversions were successful
            if (isNaN(myPrice) || isNaN(avgNeedMet)) {
              console.error(`Invalid number conversion for college ID: ${collegeId}`);
              console.error(`myPrice: ${myPrice}, avgNeedMet: ${avgNeedMet}, SAI: ${parsedSAI}`);
              continue; // Skip this college and move to the next one
            }
  
            // Break down the calculation into steps and log each part
            const priceDifference = myPrice - parsedSAI;
            if(priceDifference <= 0) {
              continue
            }
            const adjustedDifference = priceDifference * avgNeedMet;
            const newPrice = adjustedDifference;
            const finalPrice = myPrice - newPrice ;
  
            // Log intermediate and final values
            console.log(`Price Difference (myPrice - parsedSAI): ${priceDifference}`);
            console.log(`Adjusted Difference (priceDifference * avgNeedMet): ${adjustedDifference}`);
            console.log(`New Price (myPrice_need) for college ${college['Name'] || collegeId}: ${newPrice}`);
  
            // Update the college map with the new field
            colleges[collegeId]['myPrice_need'] = String(finalPrice);

            const formattedPrice = `$${finalPrice.toLocaleString()}`;

            const collegeFieldPathNeed = `myColleges.${collegeId}.myPrice_need`;
            const collegeFieldPath = `myColleges.${collegeId}.myPrice`;
            await updateDoc(userDocRef, { [collegeFieldPathNeed]: String(formattedPrice)});
            await updateDoc(userDocRef, { [collegeFieldPath]: String(formattedPrice)});

          } else {
            console.log(`Skipping college ID: ${collegeId} - Missing myPrice or Avg % of Need met for Freshman`);
          }
        }
  
        // Update the user's document with the modified colleges map
        
  
        console.log('Updated college prices with need aid successfully.');
        return colleges; // Return the updated colleges data
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error updating college prices with need aid:', error);
    }
    return null; // Return null if something goes wrong
  };

  const handleStateAbbreviation = async (stateAbbr) => {
    // Get the reference to the user's document
    const userDocRef = doc(db, 'userData', user.uid);
  
    // Create or update the stateAbbr field in the user's document
    await setDoc(userDocRef, { stateAbbr }, { merge: true });
  
    // Fetch the user's document to get the current colleges
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const colleges = userData.myColleges || {};
      
      let updatedCollegesState = [];
      

      for (const collegeId in colleges) {
        const college = colleges[collegeId];
  
        if (college['State Abbr'] === stateAbbr && college['Total price for in-state students 2022-23']!= college['Total price for out-of-state students 2022-23']) {
          const totalPriceInState = college['Total price for in-state students 2022-23'];
          if (totalPriceInState) {
            // Update myPrice for in-state colleges
            const collegeFieldPath = `myColleges.${collegeId}.myPrice`;
            await updateDoc(userDocRef, { [collegeFieldPath]: totalPriceInState });
            updatedCollegesState.push(college['Name'] || collegeId);
            console.log(`Updated myPrice for college ID: ${collegeId} to ${totalPriceInState}`);
          }
        }
      }
      return updatedCollegesState;
    } else {
      console.log('No such document!');
    }
  };
  
  


  

  const handleMessageSubmit = async (message) => {
    if (message.trim() === '') return;

    const userMessage = { role: 'user', content: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true); // Set loading to true when processing the message

    let botResponse = '';

    try {
      if (currentStep === 'Ask Questions') {
        // Call OpenAI API to handle user questions in the final step

        botResponse = await getShortChatResponse(message, userDoc, myColleges, 'Provide short and concise answers.');
      } else {
        switch (currentStep) {
          case 'Welcome':
          setUserData({ ...userData, name: message });
          const updatedCollegesState = await handleStateAbbreviation(message);
          botResponse = ''
          if (updatedCollegesState.length > 0) {
            botResponse += `The following colleges have updated to in-state prices: ${updatedCollegesState.join(', ')}\n\n`;
          }
          botResponse += `\nThe first step is to add at least one college to your college list. Which colleges are you interested in?`;


          setCurrentStep('Add College');
          break;
          case 'Add College':
              const collegeNames = message.split(',').map(name => name.trim()); // Split and trim the user input to get individual college names
              const addedColleges = [];
              console.log('College names extracted from user input:', collegeNames);
    
              for (const collegeName of collegeNames) {
                console.log('Searching for IPEDS ID for:', collegeName);
                const ipedsId = await findCollegeIdByName(collegeName);
                if (ipedsId) {
                  console.log('Found IPEDS ID:', ipedsId, 'for college:', collegeName);
                  await addCollegeByIpedsId(ipedsId);
                  addedColleges.push(collegeName);
                } else {
                  console.log('Could not find a match for:', collegeName);
                  botResponse += `Could not find a match for "${collegeName}".\n`;
                }
              }
    
              if (addedColleges.length > 0) {
                botResponse += `Great! ${addedColleges.join(', ')} ha${addedColleges.length > 1 ? 've' : 's'} been added to your list. Do you think you qualify for financial aid? (Yes, No, Not Sure)`;
                setCurrentStep('Qualify for Financial Aid');
              } else {
                botResponse += `Please try adding colleges again.`;
                setCurrentStep('Add College');
              }
          break;
          case 'Qualify for Financial Aid':
            setUserData({ ...userData, financialAidQualification: message });
            if (message.toLowerCase() === 'yes') {
              botResponse = "Great! Do you know you Student Aid Index? (Yes, No)";
              setCurrentStep('SAI');
            } else if (message.toLowerCase() === 'not sure') {
              botResponse = "Let's determine if you might qualify for financial aid. What is your family's approximate annual income?";
              setCurrentStep('income');
            } else {
              botResponse = "No problem. Let's focus on merit aid to help you pay for college. Enter your GPA and SAT/ACT scores.";
              setCurrentStep('meritAid');
            }
            break;
          case 'SAI':
              setUserData({ ...userData, income: message });
              if (message.toLowerCase() === 'yes') {
                botResponse = "What is your Student Aid Index? (ie 60,000)";
                setCurrentStep('completeSAI');
              } else {
                botResponse = "No worries! Lets calculate it. I will need the following information: ";
                botResponse += "1. Income: (e.g., Income: $150,000)\n";
                botResponse += "2. Assets: (e.g., Assets: $60,000)\n";
                botResponse += "3. Family Size: (e.g., Family Size: 5)\n";
                botResponse += "4. Student Income: (e.g., Student Income: $200)\n";
                setCurrentStep('calculateSAI');
              }
            break;
          case 'income':
            setUserData({ ...userData, income: message });
            if (parseInt(message) < 300000) {
              botResponse = "Based on your income, you likely qualify for financial aid. Would you like to complete the simplified FAFSA form to determine how much aid?";
              setCurrentStep('SAI');
            } else {
              botResponse = "Based on your income, you may not qualify for need-based financial aid, but it's still worth applying. Would you like to see if you qualify for merit aid?";
              setCurrentStep('Qualify for Merit Aid');
            }
            break;
            case 'calculateSAI':
              try {
                const incomeMatch = message.match(/Income:\s*\$?([\d,.]+)/i);
                const assetsMatch = message.match(/Assets:\s*\$?([\d,.]+)/i);
                const sizeMatch = message.match(/Family Size:\s*(\d+)/i);
                const studentIncomeMatch = message.match(/Student Income:\s*\$?([\d,.]+)/i);
                
                  // Logging parsed values
                  console.log('Parsed values:', {
                      incomeMatch,
                      assetsMatch,
                      sizeMatch,
                      studentIncomeMatch,
                  });

                  if (!incomeMatch || !assetsMatch || !sizeMatch || !studentIncomeMatch) {
                      throw new Error('Missing or invalid input values');
                  }

                  // Parsing and converting the matched strings to numbers
                  const famIncome = parseFloat(incomeMatch[1].replace(/,/g, ''));
                  const famAssets = parseFloat(assetsMatch[1].replace(/,/g, ''));
                  const famSize = parseInt(sizeMatch[1], 10);
                  const studentIncome = parseFloat(studentIncomeMatch[1].replace(/,/g, ''));

                  // Calculating PAI
                  const familySizeAllowance = famSize * 10000;
                  const PAI = famIncome - familySizeAllowance - 4750;

                  // Calculating PCA
                  const PCA = famAssets * 0.12;

                  // Calculating PAAI
                  const PAAI = PAI + PCA;

                  // Calculating the predicted label using the equation of the line
                  let predictedLabel = 0.398 * PAAI - 18405.66;
                  predictedLabel = Math.round(predictedLabel / 100) * 100;
                  console.log('predicted label: ',predictedLabel)
                  
                  const updatedCollegesSAI = await updateCollegePricesWithNeedAid(predictedLabel);

                  if (updatedCollegesSAI) {
                      botResponse = "Here is how much money you can expect to receive from your schools:\n";

                      for (const collegeId in updatedCollegesSAI) {
                          const college = updatedCollegesSAI[collegeId];
                          if (college.myPrice_need !== undefined) {
                              botResponse += `${college.Name}: ${college.myPrice_need}\n`;
                          }
                      }
                  } else {
                      botResponse = "There was an error updating your college prices. Please try again.";
                  }

                  setCurrentStep('Qualify for Merit Aid');
              } catch (error) {
                  console.error('Error in calculateSAI:', error);
                  botResponse = "It looks like some information is missing or incorrect. Please provide the following information:\n";
                  botResponse += "1. Income: (e.g., Income: $150,000)\n";
                  botResponse += "2. Assets: (e.g., Assets: $60,000)\n";
                  botResponse += "3. Family Size: (e.g., Family Size: 5)\n";
                  botResponse += "4. Student Income: (e.g., Student Income: $200)\n";
                  setCurrentStep('Calculate SAI');
              }
              break;
          case 'completeSAI':
                setUserData({ ...userData, SAI: message });
                const updatedColleges = await updateCollegePricesWithNeedAid(parseFloat(message));
              
                if (updatedColleges) {
                  botResponse = "Here is how much money you can expect to receive from your schools:\n";
              
                  for (const collegeId in updatedColleges) {
                    const college = updatedColleges[collegeId];
                    if (college.myPrice_need !== undefined) {
                      botResponse += `${college.Name}: ${college.myPrice_need}\n`;
                    }
                  }
                } else {
                  botResponse = "There was an error updating your college prices. Please try again.";
                }
              
                setCurrentStep('submitFAFSA');
              break;              
          case 'submitFAFSA':
            if (message.toLowerCase() === 'yes') {
              botResponse = "Review your financial aid offers and deduct the aid from your college list costs. Have you reviewed your offers yet? (Yes, No)";
              setCurrentStep('reviewAidOffers');
            } else {
              botResponse = "Please make sure to submit your FAFSA and state-specific financial aid applications. Once done, review your financial aid offers and deduct the aid from your college list costs.";
              setCurrentStep('submitFAFSA');
            }
            break;
          case 'reviewAidOffers':
            if (message.toLowerCase() === 'yes') {
              botResponse = "Excellent! Let's move on to merit aid. Enter your GPA and SAT/ACT scores.";
              setCurrentStep('meritAid');
            } else {
              botResponse = "Please review your financial aid offers and deduct the aid from your college list costs. Have you reviewed your offers yet? (Yes, No)";
              setCurrentStep('reviewAidOffers');
            }
            break;
            case 'Qualify for Merit Aid':
              const gpaMatch = message.match(/GPA:\s*([\d.]+)/i);
              const satMatch = message.match(/SAT:\s*(\d+)/i);
              const actMatch = message.match(/ACT:\s*(\d+)/i);

              console.log('gpaMatch: ', gpaMatch)

              if (gpaMatch) {
                setGpa(gpaMatch[1]);
              }
              if (satMatch) {
                setTestScores({ type: 'SAT', score: satMatch[1] });
              } else if (actMatch) {
                setTestScores({ type: 'ACT', score: actMatch[1] });
              }

              if (gpaMatch && (satMatch || actMatch)) {
                const score = calculateMeritAidEligibilityScore(
                  parseFloat(gpaMatch[1]),
                  satMatch ? parseFloat(satMatch[1]) : parseFloat(actMatch[1]),
                  satMatch ? 'SAT' : 'ACT'
                );


                const userDocRef = doc(db, 'userData', user.uid);
                const userDoc = await getDoc(userDocRef);

                console.log('GPA: ', parseFloat(gpaMatch[1]),)
                console.log('TEST SCORE: ', satMatch ? parseFloat(satMatch[1]) : parseFloat(actMatch[1]))

                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  const myColleges = userData.myColleges || {};
                  const ipedsIds = Object.keys(myColleges);
                  await updateDoc(userDocRef, {
                    ['GPA']: parseFloat(gpaMatch[1]),
                    ['Test Score']: satMatch ? parseFloat(satMatch[1]) : parseFloat(actMatch[1]),
                  });


                  console.log(`IPED IDs: ${ipedsIds}`);

                  const meritAidResults = await fetchMeritAidData(user.uid, score, ipedsIds); // Pass ipedsIds as an array

                  if (meritAidResults) {
                    fetchUserDoc(user);
                    botResponse = `Great! Based on your academic achievements, your merit aid eligibility score is ${score.toFixed(2)}.\n` + meritAidResults.join('\n');
                    setCurrentStep('Ask Questions');
                  } else {
                    botResponse = "There was an error updating your college prices. Please try again.";
                  }
                } else {
                  botResponse = "No such document exists.";
                }
              } else {
                botResponse = "Please enter both your GPA and either SAT or ACT scores in the format 'GPA: 3.8, SAT: 1400' or 'GPA: 3.8, ACT: 32'.";
              }
            break;
          case 'applyMeritAid':
            botResponse = "Awesome! Finally, let's explore other scholarships you might qualify for. [Link to search tool]";
            setCurrentStep('otherScholarships');
            break;
          case 'otherScholarships':
            botResponse = "You have some other scholarships left to explore. Let's find more opportunities. [Link to search tool]";
            setCurrentStep('complete');
            break;
          case 'complete':
            botResponse = "You've completed all the steps! Now you can ask me any questions you have.";
            setCurrentStep('Ask Questions');
            break;
          default:
            botResponse = "Something went wrong. Please try again.";
        }
      }
    } catch (error) {
      botResponse = 'Something overall went wrong. Please try again.';
    } finally {
      const botMessage = {
        role: 'bot',
        content: botResponse,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setBotMessage(botMessage.content);
      setLoading(false); // Set loading to false after processing
    }
  };

  const handleMeritAid = (gpa, testScore, testType) => {
    // Your function logic here
    console.log(`GPA: ${gpa}, Test Score: ${testScore} (${testType})`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleMessageSubmit(input);
  };

  const handleMeritAidClick = () => {
    const otherMessage = 'Prompt the user to provide their GPA and SAT or ACT in order to calculate merit aid eligibility';
    handleMessageSubmit(otherMessage);
  };

  const handleNeedAidClick = () => {
    const otherMessage = 'Give me a series of questions so you can calculate my SAI';
    handleMessageSubmit(otherMessage);
  };

  const handleResetMessages = () => {
    const welcomeMessage = `Welcome to aiD!\nI'm here to help you navigate through the process of paying for college.\nLet's get started with some basic information.\nWhat state are you from?`;
    setMessages([{ role: 'bot', content: welcomeMessage }]);
    setBotMessage(welcomeMessage);
    setInput('');
    setUserData({});
    setCurrentStep('Welcome');
  };

  return (
    <>
      <div className="row">
        <div className="column-left">
          <a className="chakra-link css-1hngipw" href="#">My Schools</a>
          <CollegeSearch />
          <div className="school-container">
            <MySchools />
          </div>
        </div>
        <div className="column-right">
          <div className="css-16ld5u0">
            <div className="css-1k6m9o">
              <div className="css-1799jpi">
                <div className="css-cyklgb">
                  <div className="css-9bephp">
                    <div className="css-1h62d89">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        focusable="false"
                        className="chakra-icon css-1ie6an7"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                      </svg>
                    </div>
                    <div className="css-wybkwz">
                      <p className="chakra-text css-ml871w">{input}</p>
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        focusable="false"
                        className="chakra-icon css-uuq0e0"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="css-hboir5">
                  <div className="css-1oo0gu1">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 24 24"
                      focusable="false"
                      className="chakra-icon css-1rgvbqi"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"></path>
                    </svg>
                  </div>
                  <div className="css-adkx0o">
                  <StepTracker currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />
                    <div className="font-medium">
                      <div className="text-container"> {/* Apply the new class here */}
                      <p style={{ textAlign: 'left', width: '100%' }}>
                        <Typewriter
                          key={botMessage} // This ensures the component remounts and re-runs the animation
                          words={[botMessage]}
                          loop={1}
                          typeSpeed={20}
                          deleteSpeed={50}
                          delaySpeed={1000}
                        />
                      </p>
                      </div>
                    </div>
                    <div className="prompts-container">
                      
                    </div>
                  </div>
                </div>
                
                <div className="css-6n9yju">
                  <input
                    placeholder="Type your message here..."
                    className="chakra-input css-1pgcnou"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    mr={2}
                  />
                  <button type="button" onClick={handleSubmit} className="chakra-button css-gllksg">
                    Submit
                  </button>
                  <button type="button" onClick={handleResetMessages} className="chakra-button css-reset">
                    Reset Messages
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home2;
