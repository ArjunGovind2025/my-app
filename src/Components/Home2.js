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
import { getChatResponse, getShortChatResponse } from './API'; 
import { useCombined } from './CollegeContext'; 
import WorkflowsBot from './WorkflowsBot';
import { calculateMeritAidEligibilityScore, fetchMeritAidData} from './meritAidCalculator'; 
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; 
import { Typewriter } from 'react-simple-typewriter';
import { updateSAI } from './SAI'; 
import retrieveCurrentStep from './retrieving';
import { updateCurrentStep } from './updating';
import Modal from './Modal';
import { FaSpinner } from "react-icons/fa";
import { useGenerateCollegeRecommendations } from './AIFeatures';
import { useCheapestOptionsForUser } from './Features';







const Home2 = () => {
  const { user, userDoc, myColleges, fetchUserDoc, addCollegeByIpedsId } = useCombined(); // Destructure myColleges from the context
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [botMessage, setBotMessage] = useState('');
  const [userData, setUserData] = useState({}); 
  const [currentStep, setCurrentStep] = useState('welcome'); // Track the current step
  const [loading, setLoading] = useState(false); 
  const [loadingFeatures, setLoadingFeatures] = useState(false); 

  const [gpa, setGpa] = useState(''); 
  const [testScores, setTestScores] = useState({}); 
  const [showModal, setShowModal] = useState(false);
  const [isTypewriterDone, setIsTypewriterDone] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0); 
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [matches, setMatches] = useState([]); // State persists across renders
  const { generateCollegeRecommendations } = useGenerateCollegeRecommendations();
  const { getCheapestOptionsForUser, getHighestMeritAid } = useCheapestOptionsForUser();



useEffect(() => {
  if (botMessage.length > 0) {
    setCurrentLineIndex(0); // Reset the line index when new botMessage is set
  }
}, [botMessage]);

useEffect(() => {
  if (currentLineIndex < botMessage.length) {
    const timer = setTimeout(() => {
      setCurrentLineIndex(prevIndex => prevIndex + 1);
    }, (botMessage[currentLineIndex].length * 20) + 10); // delay for typewriter settings

    return () => clearTimeout(timer); // clear the timeout if the component unmounts or updates
  }
}, [currentLineIndex, botMessage]);


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
    'Welcome': `Welcome to Pocketly!\nI'm here to help you navigate through the process of paying for college.\nThe first step is to add at least one college to your college list. Which colleges are you interested in?`,
    'Add College': `Which colleges are you interested in?`,
    'State Information': `What state are you from? List state abbreviation (e.g., NY)`,
    'Qualify for Financial Aid': `Do you think you qualify for financial aid? (Yes, No, Not Sure)`,
    'SAI': `Do you know your Student Aid Index? (Yes, No)`,
    'income': `Let's determine if you might qualify for financial aid. What is your family's approximate annual income?`,
    'Calculate SAI': `The Student Aid Index (SAI) determines how  much your family can afford to pay. To calculate it I will need you families income, assets, size and your income. Is this information you know?`,
    'completeSAI': `Here is how much money you can expect to receive from your schools:\n`,
    'submitFAFSA': `Please submit your FAFSA and state-specific financial aid applications. Once done, review your financial aid offers and deduct the aid from your college list costs.`,
    'reviewAidOffers': `Review your financial aid offers and deduct the aid from your college list costs. Have you reviewed your offers yet? (Yes, No)`,
    'Qualify for Merit Aid': `Let's determine if you qualify for merit aid! Please start by entering your GPA (e.g., 3.8).`,
    'applyMeritAid': `Great! Based on your academic achievements, let's explore other scholarships you might qualify for.`,
    'otherScholarships': `You have some other scholarships left to explore. Let's find more opportunities.`,
    'complete': `You've completed all the steps! Now you can ask me any questions you have.`,
    'Ask Questions': `You've completed all the steps! Click on each school to check out other schorlships offered. You can ask me any questions you have!`
  };
  


  useEffect(() => {
    if (user && user.uid) {
        handleResetMessages();
    }
}, [user]); // Run the effect only when `user` changes

useEffect(() => {
    const welcomeMessage = `Welcome to Pocketly!\nI'm here to help you navigate through the process of paying for college.\nLet's get started with some basic information.\nWhat is your name?`;
    setMessages([{ role: 'bot', content: welcomeMessage }]);

}, []);

const handleStepClick = (step) => {
  setCurrentStep(step);
  setBotMessage(stepMessages[step]); 
};


  const handlePromptClick = async (prompt) => {

       
    console.log('Prompt clicked:', prompt);
    setLoading(true);
    try {
      const response = await getShortChatResponse(user.uid, prompt, userDoc, myColleges, 'Provide short and concise answers.', setShowModal);
      console.log('API Response:', response);
      const botMessage = {
        role: 'bot',
        content: response,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setBotMessage(response); // updats the botMessage state to trigger Typewriter
    } catch (error) {
      console.error('Error handling prompt click:', error);
    } finally {
      setLoading(false);
    }
  };

  const storeUserData = async (gpa, testScore, testType) => {
    try {
      const userDocRef = doc(db, 'userData', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      console.log("Firestore document snapshot:", userDocSnap.exists() ? "Document exists" : "Document does not exist");
  
      if (userDocSnap.exists()) {

        console.log("Updating existing document with GPA and Test Score");
   
        await updateDoc(userDocRef, {
          GPA: gpa,
          [testType]: testScore,
        });
        console.log("Document updated successfully");
      } else {

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
      console.log('🔍 Starting search for:', collegeName); // Log input
      const docRef = doc(db, 'nameToID', 'collegeNametoIPEDSID');
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
  
        const normalizedInput = collegeName.toLowerCase().trim();
  
        const matches = Object.entries(data).filter(([name]) => {
          const normalizedName = name.toLowerCase().trim();
          return normalizedName.includes(normalizedInput); // Check for partial match
        });
  
        console.log('🎯 Matches Found:', matches); // Log matches found
        return matches.map(([name, id]) => ({ name, id })); // Return formatted matches
      } else {
        console.warn('⚠️ No document found in Firestore!');
      }
    } catch (error) {
      console.error('❌ Error finding college ID:', error);
    }
    return [];
  };
  
  
  const handleGenerateRecommendations = async () => {
    if (!user?.uid) {
      console.warn('User ID not available.');
      return;
    }
    setLoadingFeatures(true);
    try {
      await generateCollegeRecommendations(user.uid, findCollegeIdByName, 5);
      console.log('Recommendations generated successfully!');
    } catch (error) {
      if (error) {
        setShowModal(true); // Show modal if API limit is reached or error occurs
      }
    } finally {
      setLoadingFeatures(false);
    }
  };

  
 
 
  
  const renderGenerateCheapButton = () => (
    <button
      onClick={async () => {
        if (!user?.uid) {
          console.warn('User ID not available.');
          return;
        }
        setLoading(true);
        try {
          console.log('Calling getCheapestOptionsForUser...');
          const recommendations = await getCheapestOptionsForUser(user.uid); // Ensure this is the function from your hook
          console.log('Cheapest options generated successfully!', recommendations);
        } catch (error) {
          console.error('Error generating cheap recommendations:', error);
        } finally {
          setLoading(false);
        }
      }}
      className="bg-[--color-chrome] hover:bg-[--color-chrome] text-[#000] py-1 px-2 text-xs rounded shadow-md mb-4 ml-4"
      disabled={loading}
    >
      {'Cheapest Schools'}
    </button>
  );

  const renderGenerateMeritButton = () => (
    <button
      onClick={async () => {
        if (!user?.uid) {
          console.warn('User ID not available.');
          return;
        }
        setLoadingFeatures(true);
        try {
          console.log('Calling getHighestMeritAid...');
          const recommendations = await getHighestMeritAid(user.uid); // Ensure this is the function from your hook
          console.log('Highest merit options generated successfully!', recommendations);
        } catch (error) {
          console.error('Error generating merit recommendations:', error);
        } finally {
          setLoadingFeatures(false);
        }
      }}
      className="bg-[--color-chrome] hover:bg-[--color-chrome] text-[#000] py-1 px-2 text-xs rounded shadow-md mb-4 ml-4"
      disabled={loadingFeatures}
    >
      {loadingFeatures ? 'Thinking...' : '★ Top Merit Qualified'}
    </button>
  );
 
 
  


  const updateCollegePricesWithNeedAid = async (SAI) => {
    try {

      const userDocRef = doc(db, 'userData', user.uid); 
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const colleges = userData.myColleges || {};
  
        console.log('User data retrieved:', userData); 
        console.log('Colleges data:', colleges); 
  
        const parsedSAI = parseFloat(SAI); // Convert SAI to a number
  
        if (isNaN(parsedSAI)) {
          console.error(`Invalid SAI value: ${SAI}`);
          return null; // stop processing if SAI is not a valid number
        }
  
        console.log(`Parsed SAI: ${parsedSAI} (type: ${typeof parsedSAI})`); 
  
        for (const collegeId in colleges) {
          const college = colleges[collegeId];
  
          console.log(`Processing college ID: ${collegeId}`); 
  
          if (college.myPrice && college['Avg % of Need met for Freshman']) {
            const myPriceString = college.myPrice.replace(/[^0-9.]/g, '');
            const myPrice = parseFloat(myPriceString);
            const avgNeedMet = parseFloat(college['Avg % of Need met for Freshman']) / 100;
  

            console.log(`Raw myPrice: ${college.myPrice}, Converted myPrice: ${myPrice}`);
            console.log(`Raw Avg % of Need met for Freshman: ${college['Avg % of Need met for Freshman']}, Converted avgNeedMet: ${avgNeedMet}`);
            console.log(`SAI: ${parsedSAI}`);
  
            // Check if the conversions were successful
            if (isNaN(myPrice) || isNaN(avgNeedMet)) {
              console.error(`Invalid number conversion for college ID: ${collegeId}`);
              console.error(`myPrice: ${myPrice}, avgNeedMet: ${avgNeedMet}, SAI: ${parsedSAI}`);
              continue; 
            }
  
       
            let priceDifference = myPrice - parsedSAI;
            if(priceDifference <= 0) {
              priceDifference = 0;
              continue
            }
            const adjustedDifference = priceDifference * avgNeedMet;
            const newPrice = adjustedDifference;
            const finalPrice = Math.round((myPrice - newPrice) / 100) * 100;
  

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
            await updateSAI(user.uid, parsedSAI); 

          } else {
            console.log(`Skipping college ID: ${collegeId} - Missing myPrice or Avg % of Need met for Freshman`);
          }
        }
  

        
  
        console.log('Updated college prices with need aid successfully.');
        return colleges; 
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error updating college prices with need aid:', error);
    }
    return null; 
  };

  const handleStateAbbreviation = async (stateAbbr) => {
    const userDocRef = doc(db, 'userData', user.uid);
  
    await setDoc(userDocRef, { stateAbbr }, { merge: true });
  
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
            // update myPrice for in-state colleges
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
    setLoading(true); 

    let botResponse = '';

    try {
      if (currentStep === 'Ask Questions') {
        updateCurrentStep(user, "Ask Questions")
        // call OpenAI API to handle users questions in final step
        try{
          setIsLoading(true);
          botResponse = await getShortChatResponse(user.uid, message, userDoc, myColleges, 'Provide short and concise answers.', setShowModal);
        } finally{
          setIsLoading(false);
        }
        
        
      } else {
        switch (currentStep) {
          case 'Welcome':
            
  updateCurrentStep(user, "Welcome");
  
  
  let collegeNames = message.split(',').map(name => name.trim()); // Split input
  let addedColleges = [];
  let clarificationNeeded = false;

  console.log('College names extracted from user input:', collegeNames);

  for (const collegeName of collegeNames) {
    console.log('Searching for matches for:', collegeName);
    const result = await findCollegeIdByName(collegeName);

    if (result.length === 1) {
      // Single match found: Proceed to add the college
      const { id, name } = result[0];
      console.log('Found match:', name, id);
      await addCollegeByIpedsId(id);
      addedColleges.push(name);
    } else if (result.length > 1) {
      setMatches(result);
      // Multiple matches found: Prompt user to clarify
      botResponse += `Multiple matches found for "${collegeName}":\n`;
      result.forEach((match, index) => {
        botResponse += `${index + 1}. ${match.name}\n`;
      });
      botResponse += `Please reply with the number of your preferred choice.\n`;
      setCurrentStep('Clarify College'); // Update step for clarification
      clarificationNeeded = true;
      break; // Stop processing further until clarification
    } else {
      // No matches found
      console.log('No match for:', collegeName);
      botResponse += `Could not find a match for "${collegeName}".\n`;
    }
  }

  if (!clarificationNeeded) {
    if (addedColleges.length > 0) {
      botResponse += `Great! ${addedColleges.join(', ')} ha${addedColleges.length > 1 ? 've' : 's'} been added to your list.\n`;
      botResponse += `What state are you from? List state abbreviation (e.g., NY)`;
      setCurrentStep('State Information');
    } else {
      botResponse += `Please try adding colleges again.`;
      setCurrentStep('Welcome');
    }
  }
  break;
  case 'Clarify College':
  const clarificationIndex = parseInt(message.trim(), 10) - 1;

  if (!isNaN(clarificationIndex) && clarificationIndex >= 0 && clarificationIndex < matches.length) {
    const { id, name } = matches[clarificationIndex];
    console.log('User selected:', name, id);
    await addCollegeByIpedsId(id);
    botResponse = `${name} has been added to your list.\n`;
    botResponse += `What state are you from? List state abbreviation (e.g., NY)`;
    setMatches([]);
    setCurrentStep('State Information');
  } else {
    botResponse = `Invalid choice. Please reply with a number between 1 and ${matches.length}.`;
  }
  break;


          break;
          case 'Add College':
            
            console.log("IN ADD COLLEGE")
            updateCurrentStep(user, "Add College");
            console.log("IN ADD COLLEGE2")
            let collegeNames2 = message.split(',').map(name => name.trim()); // Split and trim the user input to get individual college names
            console.log("IN ADD COLLEGE3")
            let addedColleges2 = [];
            console.log('College names extracted from user input:', collegeNames2);
  
            for (const collegeName2 of collegeNames2) {
              console.log('Searching for IPEDS ID for:', collegeName2);
              const ipedsId = await findCollegeIdByName(collegeName2);
              if (ipedsId) {
                console.log('Found IPEDS ID:', ipedsId, 'for college:', collegeName2);
                await addCollegeByIpedsId(ipedsId);
                addedColleges2.push(collegeName2);
              } else {
                console.log('Could not find a match for:', collegeName2);
                botResponse += `Could not find a match for "${collegeName2}".\n`;
              }
            }
  
            if (addedColleges2.length > 0) {
              botResponse += `Great! ${addedColleges2.join(', ')} ha${addedColleges2.length > 1 ? 've' : 's'} been added to your list.\n`;
              botResponse += `What state are you from? List state abbreviation (e.g., NY)`;
              setCurrentStep('State Information');
            } else {
              botResponse += `Please try adding colleges again.`;
              setCurrentStep('Add College');
            }
            break;

        case 'State Information':
          updateCurrentStep(user, "State Information");
          const updatedCollegesState = await handleStateAbbreviation(message.toUpperCase());
          botResponse = '';
          if (updatedCollegesState.length > 0) {
            botResponse += `The following colleges have updated to in-state prices: ${updatedCollegesState.join(', ')}\n\n`;
          }
          botResponse += `Do you think you qualify for financial aid? (Yes, No, Not Sure)`;
          setCurrentStep('Qualify for Financial Aid');
          break;
          case 'Qualify for Financial Aid':
            updateCurrentStep(user, "Qualify for Financial Aid")
            setUserData({ ...userData, financialAidQualification: message });
            if (message.toLowerCase() === 'yes') {
              botResponse = "Great! Do you know you Student Aid Index? (Yes, No)";
              setCurrentStep('SAI');
            } else if (message.toLowerCase() === 'not sure') {
              botResponse = "Let's determine if you might qualify for financial aid. What is your family's approximate annual income?";
              setCurrentStep('income');
            } else {
              botResponse = "No problem! Would you like to see if you qualify for merit aid?";
              setCurrentStep('Qualify for Merit Aid');
            }
            break;
          case 'SAI':
              updateCurrentStep(user, "SAI")
              setUserData({ ...userData, income: message });
              if (message.toLowerCase() === 'yes') {
                botResponse = "What is your Student Aid Index? (ie 60,000)";
                setCurrentStep('completeSAI');
              } else {
                botResponse = "Lets calculate it! I will need your family's income, assets, size, and your income. Are you ready to provide this information? (Yes/No)";
                setCurrentStep('Calculate SAI');
              }
            break;
          case 'income':
            updateCurrentStep(user, "income")
          
            setUserData({ ...userData, income: message });
            const income2 = message.match(/\$?\s*([\d,]+(\.\d{1,2})?)/);

            if (income2 < 300000) {
              botResponse = "Based on your income, you likely qualify for financial aid. Would you like to complete the simplified FAFSA form to determine how much aid? It takes less than a minute";
              setCurrentStep('Calculate SAI');
            } else {
              botResponse = "Based on your income, you may not qualify for need-based financial aid, but it's still worth applying. Would you like to see if you qualify for merit aid?";
              setCurrentStep('Qualify for Merit Aid');
            }
            break;
            case 'Calculate SAI': {
              console.log("[DEBUG] Entering Calculate SAI case");
          
              // Check if user is ready to proceed
              if (message.toLowerCase().trim() === 'no') {
                  botResponse = "No worries! You can come back to this another time. Would you like to see if you qualify for merit aid?";
                  setCurrentStep('Qualify for Merit Aid'); // Move to merit aid
                  console.log("[DEBUG] Transitioning to Qualify for Merit Aid");
                  break;
              }
          
              if (message.toLowerCase().trim() === 'yes') {
                  botResponse = "Great! Let's start. Please provide your family's income (e.g., Income: $150,000).";
                  setCurrentStep('Income'); // Move to Income step
                  console.log("[DEBUG] Transitioning to Income step");
                  break;
              }
          
              botResponse = "The Student Aid Index (SAI) determines how much your family can afford to pay. To calculate it, I will need your family's income, assets, size, and your income. Are you ready to provide this information? (Yes/No)";
              console.log("[DEBUG] Prompting user to confirm readiness");
              break;
          }
          
          case 'Income': {
              console.log("[DEBUG] Entering Income step");
          
              const incomeMatch = message.match(/\$?\s*([\d,]+(\.\d{1,2})?)/);
              if (incomeMatch) {
                  const income = parseFloat(incomeMatch[1].replace(/,/g, ''));
                  user.tempSAIData = { income };
                  botResponse = "Got it! Now, please provide your total assets (e.g., Assets: $60,000).";
                  setCurrentStep('Assets'); // Move to Assets step
                  console.log("[DEBUG] Valid income received:", income);
                  console.log("[DEBUG] Transitioning to Assets step");
              } else {
                  botResponse = "Please provide your family's income in a valid format (e.g., Income: $150,000).";
                  console.log("[DEBUG] Invalid income format received");
              }
              break;
          }
          
          case 'Assets': {
              console.log("[DEBUG] Entering Assets step");
          
              const assetsMatch = message.match(/\$?\s*([\d,]+(\.\d{1,2})?)/);
              if (assetsMatch) {
                  const assets = parseFloat(assetsMatch[1].replace(/,/g, ''));
                  user.tempSAIData.assets = assets;
                  botResponse = "Thank you! How many people are in your family? (e.g., Family Size: 5)";
                  setCurrentStep('Family Size'); // Move to Family Size step
                  console.log("[DEBUG] Valid assets received:", assets);
                  console.log("[DEBUG] Transitioning to Family Size step");
              } else {
                  botResponse = "Please provide your assets in a valid format (e.g., Assets: $60,000).";
                  console.log("[DEBUG] Invalid assets format received");
              }
              break;
          }
          
          case 'Family Size': {
              console.log("[DEBUG] Entering Family Size step");
          
              const sizeMatch = message.match(/(\d+)/);
              if (sizeMatch) {
                  const familySize = parseInt(sizeMatch[1], 10);
                  user.tempSAIData.familySize = familySize;
                  botResponse = "Almost done! What is the student's income? (e.g., Student Income: $200)";
                  setCurrentStep('Student Income'); // Move to Student Income step
                  console.log("[DEBUG] Valid family size received:", familySize);
                  console.log("[DEBUG] Transitioning to Student Income step");
              } else {
                  botResponse = "Please provide your family size as a number (e.g., Family Size: 5).";
                  console.log("[DEBUG] Invalid family size format received");
              }
              break;
          }
          
          case 'Student Income': {
            console.log("[DEBUG] Entering Student Income step");
        
            const studentIncomeMatch = message.match(/\$?\s*([\d,]+(\.\d{1,2})?)/);
            if (studentIncomeMatch) {
                const studentIncome = parseFloat(studentIncomeMatch[1].replace(/,/g, ''));
                user.tempSAIData.studentIncome = studentIncome;
        
                // Perform SAI Calculation
                const { income, assets, familySize } = user.tempSAIData;
                const familySizeAllowance = familySize * 10000;
                const PAI = income - familySizeAllowance - 4750;
                const PCA = assets * 0.12;
                const PAAI = PAI + PCA;
        
                let predictedLabel = 0.398 * PAAI - 18405.66;
                predictedLabel = Math.round(predictedLabel / 100) * 100;
                predictedLabel = Math.max(0, predictedLabel);

              
              
              const userDocRef = doc(db, 'userData', user.uid);

              await updateDoc(userDocRef, {
                SAI: predictedLabel, // Existing field
                income, // Add income as a field
                assets, // Add assets as a field
                familySize // Add familySize as a field
              });
            
        
                console.log("[DEBUG] SAI Calculation Inputs:", user.tempSAIData);
                console.log("[DEBUG] Predicted Label:", predictedLabel);
        
                // Update college prices with need aid
                try {
                    const updatedCollegesSAI = await updateCollegePricesWithNeedAid(predictedLabel);
        
                    if (updatedCollegesSAI) {
                        botResponse = "Here is how much money you can expect to receive from your schools:\n";
                        let anyQualifiedSchools = false;
        
                        for (const collegeId in updatedCollegesSAI) {
                            const college = updatedCollegesSAI[collegeId];
                            console.log('Processing College ID:', collegeId);
                            console.log('Colelge:', college);
                            console.log('IPEDS ID:', college['IPEDS ID']);
                            console.log('User Data:', userData);
                            console.log('User Doc:', userDoc);
                            console.log('Visible Colleges:', userDoc.visibleColleges);
                            if (
                              college.myPrice_need !== undefined &&
                              college.myPrice !== college.myPrice_need &&
                              userDoc.visibleColleges.includes(college['IPEDS ID']) // Check if the IPEDS ID is in visibleColleges
                            ) {
                                const myPrice = parseFloat(college.myPrice.replace(/[^0-9.]/g, ''));
                                const myPriceNeed = parseFloat(college.myPrice_need.replace(/[^0-9.]/g, ''));
                                const difference = myPrice - myPriceNeed;
                                if (!isNaN(myPrice) && !isNaN(myPriceNeed && difference > 0)) {
                                    anyQualifiedSchools = true;
                                    const formattedDifference = difference.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                                    botResponse += `${college.Name}: ${formattedDifference} \n`;
                                }
                            }
                        }
                        if (!anyQualifiedSchools) {
                          botResponse += "Unfortunately, you don’t qualify for financial aid at the schools on your list. ";
                        }
                        botResponse += "Would you like to see if you qualify for merit aid?";
                        setCurrentStep('Qualify for Merit Aid'); // Transition to Merit Aid step
                        console.log("[DEBUG] Transitioning to Merit Aid step");
                    } else {
                        botResponse = "There was an error updating your college prices. Please try again.";
                        console.error("[ERROR] Failed to update college prices with need aid");
                    }
                } catch (error) {
                    botResponse = "There was an error calculating your SAI. Please try again.";
                    console.error("[ERROR] Exception during SAI calculation:", error);
                }
        
                // Clear temporary data
                user.tempSAIData = null;
            } else {
                botResponse = "Please provide the student's income in a valid format (e.g., Student Income: $200).";
                console.log("[DEBUG] Invalid student income format received:", message);
            }
            break;
        }
        
          
        case 'completeSAI':
          updateCurrentStep(user, "completeSAI");
        
          // Remove non-numeric characters (except the decimal point) and parse as float
          const sanitizedMessage = message.replace(/[^0-9.]/g, '');
          const parsedSAI = parseFloat(sanitizedMessage);
        
          if (isNaN(parsedSAI)) {
            botResponse = "Invalid input. Please provide a valid number for your SAI.";
            break;
          }
        
          setUserData({ ...userData, SAI: parsedSAI });
          const updatedColleges = await updateCollegePricesWithNeedAid(parsedSAI);
        
          if (updatedColleges) {
            botResponse = "Here is how much money you can expect to receive from your schools:\n";
            console.log('userDocVisibleCollege' + userDoc.visibleColleges);

            for (const collegeId in updatedColleges) {
              const college = updatedColleges[collegeId];
              console.log('userDocVisibleCollege' + userDoc.visibleColleges);
              console.log('collegeId' + collegeId);
              const difference = parseFloat(college.myPrice.replace(/[$,]/g, '')) - Number(college.myPrice_need) ;
              console.log('norm:' + college.myPrice);
              console.log('need:' + college.myPrice_need);
              console.log('diff:' + difference);
              if (college.myPrice_need !== undefined && !isNaN(college.myPrice_need)
                && userDoc.visibleColleges.includes(Number(collegeId))
              ) {
                botResponse += `${college.Name}: $${difference.toLocaleString()}\n`;

              }
            }
          } else {
            botResponse = "There was an error updating your college prices. Please try again.";
          }
        
          setCurrentStep('Qualify for Merit Aid');
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
              botResponse = "Excellent! Let's move on to merit aid. Enter your GPA and SAT/ACT scores (ie GPA: 3.7 ACT: 34).";
              setCurrentStep('meritAid');
            } else {
              botResponse = "Please review your financial aid offers and deduct the aid from your college list costs. Have you reviewed your offers yet? (Yes, No)";
              setCurrentStep('reviewAidOffers');
            }
            break;
            case 'Qualify for Merit Aid': {
              console.log("[DEBUG] Entering Qualify for Merit Aid case");
          
              // Check if GPA is already included in the initial message
              const gpaMatch = message.match(/\s*([\d.]+)/i);
              if (gpaMatch) {
                  const gpa = parseFloat(gpaMatch[1]);
                  user.tempMeritAidData = { gpa }; // Store GPA
                  botResponse = "Got it! Now, please enter your test score. You can provide either SAT (e.g., 1400) or ACT (e.g., 32).";
                  setCurrentStep('Enter Test Score'); // Move to Enter Test Score step
                  console.log("[DEBUG] GPA received in Qualify for Merit Aid step:", gpa);
                  console.log("[DEBUG] Transitioning to Enter Test Score step");
              } else {
                  botResponse = "Let's determine if you qualify for merit aid! Please start by entering your GPA (e.g., 3.8).";
                  setCurrentStep('Enter GPA'); // Move to Enter GPA step
                  console.log("[DEBUG] Prompting for GPA in Qualify for Merit Aid step");
              }
              break;
          }
          
          case 'Enter GPA': {
              console.log("[DEBUG] Entering Enter GPA step");
          
              const gpaMatch = message.match(/\s*([\d.]+)/i);
              if (gpaMatch) {
                  const gpa = parseFloat(gpaMatch[1]);
                  user.tempMeritAidData = { gpa }; // Store GPA
                  botResponse = "Got it! Now, please enter your test score. You can provide either SAT (e.g., 1400) or ACT (e.g., 32).";
                  setCurrentStep('Enter Test Score'); // Move to Enter Test Score step
                  console.log("[DEBUG] GPA received:", gpa);
                  console.log("[DEBUG] Transitioning to Enter Test Score step");
              } else {
                  botResponse = "Please enter your GPA in the format '3.8'.";
                  console.log("[DEBUG] Invalid GPA format received:", message);
              }
              break;
          }
          
          case 'Enter Test Score': {
            console.log("[DEBUG] Entering Enter Test Score step");
        
            const testScore = parseFloat(message.trim());
        
            // Determine test type based on score range
            let testType = null;
            if (testScore >= 1 && testScore <= 36) {
                testType = 'ACT';
            } else if (testScore >= 100 && testScore <= 1600) {
                testType = 'SAT';
            }
        
            if (testType) {
                user.tempMeritAidData = {
                    ...user.tempMeritAidData,
                    testScore,
                    testType,
                };
        
                console.log("[DEBUG] Test score received:", testScore, "Test type:", testType);
        
                const { gpa } = user.tempMeritAidData;
        
                try {
                    // Perform calculation
                    const score = await calculateMeritAidEligibilityScore(user.uid, gpa, testScore, testType);
        
                    // Fetch user data
                    const userDocRef = doc(db, 'userData', user.uid);
                    const userDoc = await getDoc(userDocRef);
        
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const myColleges = userData.myColleges || {};
                        const ipedsIds = Object.keys(myColleges);
        
                        await updateDoc(userDocRef, {
                            GPA: gpa,
                            'Test Score': testScore,
                            'Test Type': testType,
                        });
        
                        console.log(`[DEBUG] IPEDS IDs: ${ipedsIds}`);
        
                        // Fetch Merit Aid Results
                        const meritAidResults = await fetchMeritAidData(user.uid, score, ipedsIds);
        
                        if (meritAidResults && meritAidResults.length > 0) {
                          botResponse = `Based on your academic achievements, you qualify for aid at the following schools:\n` +
                              meritAidResults.join('\n') +
                              "\nClick on each school to checkout other scholarships they offer. Feel free to ask me any questions you have!!";
                          setCurrentStep('Ask Questions'); // Transition to Ask Questions step
                          console.log("[DEBUG] Merit aid results calculated:", meritAidResults);
                      } else if (meritAidResults && meritAidResults.length === 0) {
                          botResponse = "Unfortunately, you do not qualify for merit aid at any of the schools on your list. Consider adding more safety schools to increase your chances. Let me know if you have any questions!";
                          setCurrentStep('Add More Schools'); // Optional: Suggest adding schools
                          console.log("[DEBUG] Merit aid results are empty. Suggesting to add more schools.");
                      } else {
                          botResponse = "There was an error fetching your merit aid results. Please try again.";
                          console.error("[ERROR] Failed to fetch merit aid results");
                      }
                    } else {
                        botResponse = "No user data found. Please ensure your profile is set up correctly.";
                        console.error("[ERROR] User document does not exist");
                    }
        
                    // Clear temporary data
                    user.tempMeritAidData = null;
                } catch (error) {
                    botResponse = "There was an error calculating your merit aid. Please try again.";
                    console.error("[ERROR] Exception during merit aid calculation:", error);
                }
            } else {
                botResponse = "Please enter a valid test score. For ACT, enter a number between 1 and 36. For SAT, enter a number between 100 and 1600.";
                console.log("[DEBUG] Invalid test score received:", message);
            }
            break;
        }
        
          
          case 'applyMeritAid':
            botResponse = "Awesome! Finally, let's explore other scholarships you might qualify for. [Link to search tool]";
            setCurrentStep('otherScholarships');
            break;
          case 'otherScholarships':
            botResponse = "You have some other scholarships left to explore. Let's find more opportunities. [Link to search tool]";
            setCurrentStep('complete');
            break;
          case 'complete':
            updateCurrentStep(user, "complete")
            botResponse = "You've completed all the steps! Click on each school to check out other schorlships offered. You can ask me any questions you have!";
            setCurrentStep('Ask Questions');
            break;
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
      setBotMessage(botMessage.content); // Directly set the botMessage state
      setLoading(false); 
    }
    
  };

  const handleMeritAid = (gpa, testScore, testType) => {
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

  const handleResetMessages = async () => {
    if (!user || !user.uid) {
        console.error('User is null or undefined!!!!');
        return;
    }

    try {
        const currStep = await retrieveCurrentStep(user); 
        console.log('currStep: ', currStep);
        setCurrentStep(currStep);

        if (currStep === 'Ask Questions') {
            const message = 'Click on each school to checkout other scholarships they offer. Feel free to ask me any questions you have!';
            setMessages([{ role: 'bot', content: message }]);
            setBotMessage(message);
            setInput('');
            setUserData({});
            setCurrentStep('Ask Questions');
        } else {
            const welcomeMessage = `Welcome to Pocketly!\nI'm here to help you navigate through the process of paying for college.\nLet's get started with some basic information.\nList schools you are intrested in.`;
            setMessages([{ role: 'bot', content: welcomeMessage }]);
            setBotMessage(welcomeMessage);
            setInput('');
            setUserData({});
            setCurrentStep('Welcome');
        }
    } catch (error) {
        console.error('Error retrieving current step:', error);
    }
};


  return (
    <>
      <div className="row">
        <div className="column-left">
          <a className="chakra-link css-1hngipw" href="#">My Schools</a>
          <CollegeSearch />
          <div>
          <button
        onClick={handleGenerateRecommendations}
        className="bg-[--color-chrome] hover:bg-[--color-chrome] text-[#000] py-1 px-2 text-xs rounded shadow-md mb-4 ml-4"
        disabled={loadingFeatures}
      >
        {loadingFeatures ? 'Thinking...' : '★ AI Suggestions'}
        
      </button>

      {/* Modal Component */}
      {showModal && (
        <Modal
          message="AI credits exceeded. Please upgrade your plan."
          onClose={() => setShowModal(false)}
        />
      )}
           {/*{renderGenerateCheapButton()}*/}
           {renderGenerateMeritButton()}
        </div>
          <div className="school-container">
            <MySchools />
          </div>
        </div>
        <div className="column-right">
          <div className="css-16ld5u0">
            <div className="css-1k6m9o">
              <div className="css-1799jpi">
                {/* 
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
                */}

                <div className="css-hboir5">
                  {/* 
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
                  */}
                  <div className="css-adkx0o">
                  <StepTracker currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />
                  <div className="text-container">
  <p style={{ textAlign: 'left', width: '100%' }}>
    {isLoading ? (
      // Show "Loading..." when isLoading is true
      <span>Thinking...</span>
    ) : (
      // Show Typewriter animation when isLoading is false
      <Typewriter
        key={botMessage} // Ensures the component remounts and re-runs the animation
        words={[botMessage]}
        loop={1}
        typeSpeed={10}
        deleteSpeed={50}
        delaySpeed={1000}
      />
    )}
  </p>
</div>
                    </div>
                    
                  </div>
                 
                </div>
                <div className="prompts-container">
                  <Prompts onPromptClick={handlePromptClick} />

                    </div>
                
                    <div className="css-6n9yju">
  <input
    placeholder="Type your message here..."
    className="chakra-input css-1pgcnou"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
    }}
    mr={2}
  />
  

<button
  type="button"
  onClick={handleSubmit}
  className="chakra-button css-gllksg"
  disabled={isLoading}
>
  {isLoading ? (
    <FaSpinner
      style={{
        fontSize: "14px",
        animation: "spin 1s linear infinite",
      }}
    />
  ) : (
    <span style={{ fontSize: "14px" }}>&#8593;</span>
  )}


</button>

<style>
  {`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}
</style>

</div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default Home2;