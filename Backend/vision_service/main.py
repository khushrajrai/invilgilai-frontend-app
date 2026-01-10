import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from vision_module import VisionProcessor
from gaze_module import GazeProcessor

app = FastAPI()

# Initialize processors once at startup
vision_p = VisionProcessor()
gaze_p = GazeProcessor()

@app.post("/process")
async def process_vision(file: UploadFile = File(...)):
    # Convert uploaded bytes to OpenCV frame
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return [0.0, 0.0, 1.0, 1.0, 1.0] # Fail-safe defaults

    # Get results from Vision Module [phone, multi, missing]
    # We modify the module's return slightly for production speed
    vision_results = vision_p.process_frame(frame) 
    
    # Get results from Gaze Module [gaze_off, gaze_turn]
    gaze_results = gaze_p.process_frame(frame)

    # Return the exact 5-value list the Gateway expects
    # Order: phone, multi, missing, gaze_off, gaze_turn
    return vision_results + gaze_results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)