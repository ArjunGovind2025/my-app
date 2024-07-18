import React, { useState } from 'react';
import './Colleges2.css';


function Colleges2() {
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
  }

  return (
    <div class="css-6n9yju">
    <input
        placeholder="Type your message here..."
        className="chakra-input css-1pgcnou"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        mr={2}
    />
        <button type="button" onClick={handleSubmit} class="chakra-button css-gllksg">Submit</button>
    </div>
  )
}

export default Colleges2