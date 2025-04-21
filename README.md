# EduGen

Upload .mp3/.mp4 file to generate transcription, then based on that transcription you can use llama3.2 to generate content

Instruction to run
Put your OpenAPI Key in the .env in `backend/.env`

- In terminal run
- This runs the react page
  `cd frontent`
  `npm run dev`
- In seperate terminal run
- This runs the express server
  `cd backend`
  `npm run start`
-In another seperate terminal run
-This runs the AI model
  `ollama run llama3.2`
