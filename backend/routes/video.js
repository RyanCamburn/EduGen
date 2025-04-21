import {Router} from 'express';
import { transcribeVideo, summarizeTranscription } from '../data/video.js'

const router = Router();

router
    .route('/transcribe', upload.single('file'))
    .post(async (req, res) => {
 
        try {
            if (!req.file) {
              return res.status(400).json({ error: 'No video uploaded' });
            }
        }
        catch(error){
            res.status(500).json({ error: error.message });
        }
            
        //transcribe video data function
        try{
            const transcription = await transcribeVideo(req.file.path);
            res.status(200).json({ transcription });
        }
        catch(error){
            res.status(500).json({ error: error.message });
        }

        //summarize transcription data function
        try{
            const transcription = req.body.transcription;
            const summary = await summarizeTranscription(transcription);
            res.status(200).json({ summary });
        }
        catch(error){
            res.status(500).json({ error: error.message });
        }

      });

router
    .route('/question')
    .post(async (req, res) => {
 
        const question = req.body.question;
        res.status(200).json({ message: "Question route" });
        

    });

export default router;