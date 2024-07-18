import React, { useState, useEffect } from 'react';
import { getChatbotResponse } from './API';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({}); // Store user data
  const [currentStep, setCurrentStep] = useState('welcome'); // Track the current step

  useEffect(() => {
    // Initial message from the chatbot
    const welcomeMessage = `Welcome to [Website Name]!\nI'm here to help you navigate through the process of paying for college.\nLet's get started with some basic information.\nWhat is your name?`;
    setMessages([{ role: 'bot', content: welcomeMessage }]);
  }, []);

  const handleUserInput = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    let botResponse = '';

    try {
      switch (currentStep) {
        case 'welcome':
          setUserData({ ...userData, name: input });
          botResponse = `Nice to meet you, ${input}! The first step is to add at least one college to your college list. Which college are you interested in?`;
          setCurrentStep('addCollege');
          break;
        case 'addCollege':
          setUserData({ ...userData, colleges: [...(userData.colleges || []), input] });
          botResponse = `Great! ${input} has been added to your list. Do you think you qualify for financial aid? (Yes, No, Not Sure)`;
          setCurrentStep('financialAidQualification');
          break;
        case 'financialAidQualification':
          setUserData({ ...userData, financialAidQualification: input });
          if (input.toLowerCase() === 'yes') {
            botResponse = "Great! Let's start with the financial aid process. Please complete the simplified FAFSA form to determine your SAI. [Link to FAFSA tool]";
            setCurrentStep('completeFAFSA');
          } else if (input.toLowerCase() === 'not sure') {
            botResponse = "Let's determine if you might qualify for financial aid. What is your family's approximate annual income?";
            setCurrentStep('income');
          } else {
            botResponse = "No problem. Let's focus on merit aid to help you pay for college. Enter your GPA and SAT/ACT scores.";
            setCurrentStep('meritAid');
          }
          break;
        case 'income':
          setUserData({ ...userData, income: input });
          if (parseInt(input) < 60000) {
            botResponse = "Based on your income, you likely qualify for financial aid. Please complete the simplified FAFSA form to determine your SAI. [Link to FAFSA tool]";
            setCurrentStep('completeFAFSA');
          } else {
            botResponse = "Based on your income, you may not qualify for need-based financial aid, but it's still worth applying. Please complete the simplified FAFSA form to determine your SAI. [Link to FAFSA tool]";
            setCurrentStep('completeFAFSA');
          }
          break;
        case 'completeFAFSA':
          botResponse = "Have you submitted your FAFSA and state-specific financial aid applications? (Yes, No)";
          setCurrentStep('submitFAFSA');
          break;
        case 'submitFAFSA':
          if (input.toLowerCase() === 'yes') {
            botResponse = "Review your financial aid offers and deduct the aid from your college list costs. Have you reviewed your offers yet? (Yes, No)";
            setCurrentStep('reviewAidOffers');
          } else {
            botResponse = "Please make sure to submit your FAFSA and state-specific financial aid applications. Once done, review your financial aid offers and deduct the aid from your college list costs.";
            setCurrentStep('submitFAFSA');
          }
          break;
        case 'reviewAidOffers':
          if (input.toLowerCase() === 'yes') {
            botResponse = "Excellent! Let's move on to merit aid. Enter your GPA and SAT/ACT scores.";
            setCurrentStep('meritAid');
          } else {
            botResponse = "Please review your financial aid offers and deduct the aid from your college list costs. Have you reviewed your offers yet? (Yes, No)";
            setCurrentStep('reviewAidOffers');
          }
          break;
        case 'meritAid':
          setUserData({ ...userData, meritAid: input });
          botResponse = `Great! Based on your academic achievements, here are some merit scholarships you may qualify for: [List of scholarships]. Apply for these merit scholarships. Let me know when you're done.`;
          setCurrentStep('applyMeritAid');
          break;
        case 'applyMeritAid':
          botResponse = "Awesome! Finally, let's explore other scholarships you might qualify for. [Link to search tool]";
          setCurrentStep('otherScholarships');
          break;
        case 'otherScholarships':
          botResponse = "You have some other scholarships left to explore. Let's find more opportunities. [Link to search tool]";
          setCurrentStep('complete');
          break;
        default:
          botResponse = "Something went wrong. Please try again.";
      }
    } catch (error) {
      botResponse = 'Something went wrong. Please try again.';
    } finally {
      // Replace previous messages with the new bot message
      setMessages([{ role: 'user', content: userMessage.content }, { role: 'bot', content: botResponse }]);
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={handleUserInput} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
