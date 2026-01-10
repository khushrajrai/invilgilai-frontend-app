import numpy as np
import threading
from fastapi import FastAPI
from audio_module import AudioProcessor

app = FastAPI()

# Initialize the AudioProcessor (PANNs + Aggregator)
# Note: AudioProcessor in audio_module handles its own threading for the stream
audio_engine = AudioProcessor()

@app.on_event("startup")
def start_audio_engine():
    """Starts the background audio capture thread on service boot."""
    thread = threading.Thread(target=audio_engine.start, daemon=True)
    thread.start()

@app.get("/get_features")
async def get_audio_features():
    """
    Returns [talking_2s, talking_5s, conf] to the Gateway.
    Matches the contract expected by fusion_module.
    """
    # audio_features is updated in the background thread every 1 second
    features = audio_engine.audio_features.tolist()
    return features

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)