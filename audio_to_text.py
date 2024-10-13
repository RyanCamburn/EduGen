# Before running, run command in terminal:
# pip install -U openai-whisper
import whisper

model = whisper.load_model("turbo")
result = model.transcribe("./sample.mp3")
print(result["text"])
