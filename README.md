# EduGen

Upload `.mp3` or `.mp4` files to generate transcriptions. Based on the transcription, you use `llama3.2` to generate quizzes. 

## Instructions to Run

1. **Set Up Your OpenAI API Key**
   - Add your OpenAI API key to the `.env` file located in `backend/.env`.
  
2. **Download AI Model**
     - In another separate terminal, download the AI model:
       ```bash
       ollama run llama3.2
       ```

2. **Run the Application**
   - Open a terminal and follow these steps:
     
     ### Frontend
     - Navigate to the `frontend` directory and start the React application:
       ```bash
       cd frontend
       npm run dev
       ```

     ### Backend
     - In a separate terminal, navigate to the `backend` directory and start the Express server:
       ```bash
       cd backend
       npm start
       ```

     

## Features
- **File Upload:** Upload `.mp3` or `.mp4` files for transcription.
- **Content Generation:** Generate content using `llama3.2` based on transcriptions.

