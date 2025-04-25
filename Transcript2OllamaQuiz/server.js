// Required libraries
const express = require('express'); // Express 4 makin API
const axios = require('axios');     // Axios for HTTP requests

// Initalize express app
const app = express();
const PORT = 3000;

// Middleware 4 JSON requests
app.use(express.json());
app.use(express.static('public'));

// (MAIN CODE) Generate Quiz Function ************************************
app.post('/api/generate-quiz', async (req, res) => {
    // Get lecture from request body
    const { transcript } = req.body; 
    
    // Set prompt here ()
    const prompt = `Create a quiz with:
    - 6 short answer questions
    - 4 multiple choice questions (with 4 options each)
    From this lecture transcript: ${transcript}`;

    // Make request to local Ollama API
    const response = await axios.post('http://localhost:11434/api/generate', {
        model: "llama3.2",  // Set model here ()
        prompt: prompt,     // Sends prompt
        stream: false       // Sends response all in one go
    });

    // Return quiz 2 client
    res.json({ quiz: response.data.response });
});
// ************************************************************************ 

// Start server
app.listen(PORT, () => {
    console.log(`Server running @ http://localhost:${PORT}`);
});