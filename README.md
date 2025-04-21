# EduGen

Upload `.mp3` or `.mp4` files to generate transcriptions. Based on the transcription, you can use `llama3.2` to generate content.

## Instructions to Run

1. **Set Up Your OpenAI API Key**
   - Add your OpenAI API key to the `.env` file located in `backend/.env`.

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

     ### AI Model
     - In another separate terminal, run the AI model:
       ```bash
       ollama run llama3.2
       ```

## Features
- **File Upload:** Upload `.mp3` or `.mp4` files for transcription.
- **Content Generation:** Generate content using `llama3.2` based on transcriptions.

