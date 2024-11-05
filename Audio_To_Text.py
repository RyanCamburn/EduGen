# Before running the script run this command in terminal:
# pip install -U openai-whisper

#You might get this error "FileNotFoundError: [Errno 2] No such file or directory: 'ffmpeg'" , if you get this error run this in yopur terminal "sudo apt install ffmpeg"

# The transcription will be saved to the aptly named .txt file

import whisper

def transcribe_audio(input_file='audio.mp3', output_file='transcription.txt'):
    with open(output_file, 'w') as file:
        file.write('')  

    model = whisper.load_model("turbo")

    result = model.transcribe(input_file)

    transcription = result.get("text", "")

    if transcription:
        with open(output_file, 'w') as file:
            file.write(transcription)
        print(f"Transcription saved to {output_file}")
    else:
        print("No transcription available.")

if __name__ == "__main__":
    transcribe_audio(input_file='sample.mp3')
