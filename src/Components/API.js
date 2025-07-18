import axios from 'axios';
import { doc, updateDoc, setDoc, getDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import config from '../config.json';
import { checkApiCallCount } from './Access'; 
import { marked } from 'marked';


const OPENAI_API_KEY = config.OPENAI_API_KEY;

const incrementApiCallCount = async (userDocId) => {
  const userDocRef = doc(db, 'userData', userDocId);
  try {
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      if (!userData.apiCallCount) {
        // Initialize the field if it doesn't exist
        await updateDoc(userDocRef, { apiCallCount: 1 });
      } else {
        // Increment the existing field
        await updateDoc(userDocRef, { apiCallCount: increment(1) });
      }
    } else {
      console.error('User document does not exist!');
    }
  } catch (error) {
    console.error('Error incrementing API call count:', error);
  }
};


const logMessageToFirestore = async (userDocId, input, botMessage) => {
  try {
    const userDocRef = doc(db, 'recordedData', userDocId);

    // Check if the document exists
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      // Document exists; append the message to the messages array
      await updateDoc(userDocRef, {
        messages: arrayUnion(input),
        botMessages : arrayUnion(botMessage)
      });
    } else {
      // Document does not exist; create it with the messages array
      await setDoc(userDocRef, {
        messages: [input],
        botMessages: [botMessage]
      });
    }
  } catch (error) {
    console.error('Error logging message to Firestore:', error);
    throw new Error('Failed to log message to Firestore.');
  }
};


export const getChatResponse = async (userDocId, input, customMessage = '', setShowModal) => {
  try {
    const hasExceededLimit = await checkApiCallCount(userDocId);

    if (hasExceededLimit) {
      setShowModal(true); // Show the modal popup
      throw new Error('API call limit exceeded.');
    }


    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are an advisor for financing college. ${customMessage}` }, 
          { role: 'user', content: input }
        ],
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    await incrementApiCallCount(userDocId);
    await logMessageToFirestore(userDocId, input, (response.data.choices[0].message.content) )

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw new Error('Sorry, I could not process your request at this time.');
  }
};

export const getChatResponseFree = async (userDocId, input, customMessage = '', setShowModal) => {
  try {
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are an advisor for financing college. ${customMessage}` }, 
          { role: 'user', content: input }
        ],
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw new Error('Sorry, I could not process your request at this time.');
  }
};


const formatResponse = (response) => {
  const htmlContent = marked(response);
  const div = document.createElement('div');
  div.innerHTML = htmlContent;

  // Ensure innerText is being called on the created div element
  const textContent = div.innerText || '';

  // Split text content into lines by newline characters
  const lines = textContent.split('\n').filter(line => line.trim() !== '');

  return lines;
};



// Function to get the chat response
export const getShortChatResponse = async (userDocId, input, userDoc, myColleges, customMessage = '', setShowModal) => {
  const collegesObject = typeof myColleges === 'object' && myColleges !== null ? myColleges : {};
  const mySchools = Object.values(collegesObject).map(college => college.Name).filter(name => name).join(', ');

  try {
    const hasExceededLimit = await checkApiCallCount(userDocId);

    if (hasExceededLimit) {
      setShowModal(true); // Show the modal popup
      throw new Error('API call limit exceeded.');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a college advisor. Provide concise and accurate information. Here are the colleges the user is interested in: ${mySchools}. Here is the student's GPA: ${userDoc.GPA} and test score: ${userDoc['Test Score']}. Here is the student's financial situation, Student Aid Index (SAI)/EFC: ${userDoc.SAI}. Here is the state they are from: ${userDoc.stateAbbr}. Give specifics to the question: ${customMessage}` },
          { role: 'user', content: 'Based on my details ' + input }
        ],
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    await incrementApiCallCount(userDocId);
    await logMessageToFirestore(userDocId, input, (response.data.choices[0].message.content) )


    // Get the raw response text
    const rawResponse = response.data.choices[0].message.content.trim();

    // Format the response
    const formattedResponse = formatResponse(rawResponse);

    return rawResponse; // Return the formatted response as an array
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw new Error('Sorry, I could not process your request at this time.');
  }
};


export const getShorterChatResponse = async (userDocId, input, setShowModal) => {

  try {
    const hasExceededLimit = await checkApiCallCount(userDocId);

    if (hasExceededLimit) {
      setShowModal(true); // Show the modal popup
      throw new Error('API call limit exceeded.');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a college advisor` },
          { role: 'user', content: input }
        ],
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    await incrementApiCallCount(userDocId);
    await logMessageToFirestore(userDocId, input, (response.data.choices[0].message.content) )


    // Get the raw response text
    const rawResponse = response.data.choices[0].message.content.trim();

    // Format the response
    const formattedResponse = formatResponse(rawResponse);

    return rawResponse; // Return the formatted response as an array
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw new Error('Sorry, I could not process your request at this time.');
  }
};
