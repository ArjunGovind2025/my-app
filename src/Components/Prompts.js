import React, { useState, useEffect } from 'react';
import { Button } from './ui/button'; // Import the Button component from ShadCN UI

const promptsList = [
  { name: 'Top Merit Schools', prompt: 'What are the top merit schools?' },
  { name: '3rd Party Scholarships', prompt: 'What are some third-party scholarships I may qualify for?' },
  { name: 'Performance Scholarships', prompt: 'Are there any performance-based scholarships?' },
  { name: 'State Scholarships', prompt: 'What state-based scholarships can I apply for?' },
  { name: 'Admission Chances', prompt: 'How likely am I to get into my chosen schools?' },
  { name: 'Maximize Need Aid', prompt: 'How can I maximize my need-based aid?' },
  { name: 'Full Ride Schools', prompt: 'Which schools offer full-ride scholarships?' },
  { name: 'Athletic Scholarships', prompt: 'What athletic scholarships are available?' },
  { name: 'Community Service Scholarships', prompt: 'Are there scholarships for community service?' },
  { name: 'STEM Scholarships', prompt: 'What scholarships are available for STEM majors?' },
  { name: 'Minority Scholarships', prompt: 'What scholarships are available for minority students?' },
  { name: 'Women in STEM', prompt: 'What scholarships are available for women in STEM?' },
  { name: 'Arts Scholarships', prompt: 'Are there scholarships for arts and humanities?' },
  { name: 'Scholarship Deadlines', prompt: 'What are the upcoming scholarship deadlines?' },
  { name: 'Application Tips', prompt: 'What tips do you have for scholarship applications?' },
  { name: 'Interview Preparation', prompt: 'How can I prepare for scholarship interviews?' },
  { name: 'College Essay Help', prompt: 'Can you help me with my college essay?' },
  { name: 'Financial Aid Overview', prompt: 'What is the difference between grants, loans, and work-study?' },
  { name: 'FAFSA Tips', prompt: 'What tips do you have for completing the FAFSA?' },
  { name: 'Reducing College Costs', prompt: 'How can I reduce my overall college costs?' },
  { name: 'Graduate School Aid', prompt: 'Are there scholarships for graduate school?' }
];

function Prompts({ onPromptClick }) {
  console.log('onPromptClick prop:', onPromptClick);
  const [currentPrompts, setCurrentPrompts] = useState([]);

  useEffect(() => {
    const cyclePrompts = () => {
      const shuffled = promptsList.sort(() => 0.5 - Math.random());
      setCurrentPrompts(shuffled.slice(0, 3));
    };

    cyclePrompts();
    const interval = setInterval(cyclePrompts, 15000); // Change every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="prompts-container">
      <div className="flex flex-row space-x-2 justify-center">
        {currentPrompts.map((prompt, index) => (
          <Button 
            key={index} 
            variant="outline" 
            onClick={() => {
              console.log('Button clicked:', prompt.prompt);
              onPromptClick(prompt.prompt);
            }} 
            style={{ borderRadius: '70px' }}
          >
            {prompt.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default Prompts;
