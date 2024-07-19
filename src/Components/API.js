import axios from 'axios';
import { useCombined } from './CollegeContext.js'; // Import the custom hook to access context
import config from '../config.json';

const OPENAI_API_KEY = config.OPENAI_API_KEY;

export const getChatResponse = async (input, myColleges, customMessage = '') => {
  // Ensure myColleges is an array, or default to an empty array
  const collegesArray = Array.isArray(myColleges) ? myColleges : [];
  const mySchools = collegesArray.map(college => college.Name).join(', '); // Convert myColleges to a string of school names

  console.log('mySchools:', mySchools); // Log mySchools to check its value
  console.log('input: ', input)
  console.log('custom message: ', customMessage)
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are an advisor for financing college. ${customMessage}`  }, // Use mySchools in the system message
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

export const getShortChatResponse = async (input, userDoc, myColleges, customMessage = '') => {
  // Ensure myColleges is an object, or default to an empty object
  const collegesObject = typeof myColleges === 'object' && myColleges !== null ? myColleges : {};
  console.log('User Object: ', userDoc);
  console.log('User GPA: ', userDoc?.GPA);
  console.log('User SAT: ', userDoc?.SAT);

  // Extract the list of school names from myColleges
  const mySchools = Object.values(collegesObject).map(college => college.Name).filter(name => name).join(', ');

  console.log('mySchools:', mySchools); // Log mySchools to check its value
  console.log('input: ', input);
  console.log('custom message: ', customMessage);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a college advisor. Provide concise and accurate information. Here are the colleges the user is interested in: ${mySchools}.Here is the students GPA:${userDoc.GPA} and test score:${userDoc['Test Score']} . ${customMessage}` }, // Different system message
          { role: 'user', content: input }
        ],
        max_tokens: 300, // Limit of 500 tokens
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
