
const OpenAI = require("openai");
const fs = require("fs");


const openai = new OpenAI({
  apiKey: "your-api-key-here", // Replace with your actual OpenAI API key
});

async function createMeritAidAssistant() {
  try {

    const file = await openai.files.create({
      file: fs.createReadStream("/Users/arjungovind/Desktop/ai-D/my-app/Filtered_College_Data.json"),
      purpose: "assistants",
    });

   
    const assistant = await openai.beta.assistants.create({
      name: "Merit Aid Eligibility Assistant",
      description: "This assistant helps users determine their merit aid eligibility based on their provided scores and merit aid cutoffs.",
      model: "gpt-3.5-turbo",
      tools: [{"type": "code_interpreter"}],
      tool_resources: {
        "code_interpreter": {
          "file_ids": [file.id]
        }
      },
     
      max_tokens: 1500,
    });

    console.log("Assistant created successfully:", assistant);
  } catch (error) {
    console.error("Error creating assistant:", error);
  }
}

createMeritAidAssistant();
