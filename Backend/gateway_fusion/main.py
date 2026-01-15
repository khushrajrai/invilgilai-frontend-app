import httpx
import asyncio
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fusion_module import TemporalBehaviorFusionModel, FusionFeatures
import os  # env vars

app = FastAPI()
fusion_model = TemporalBehaviorFusionModel()

# Allow your frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs (Internal Docker Network names)

# URLs can also come from environment variables
VISION_URL = os.getenv("VISION_URL", "http://vision:8001/process")
IDENTITY_URL = os.getenv("IDENTITY_URL", "http://identity:8002/process")
AUDIO_URL = os.getenv("AUDIO_URL", "http://audio:8003/get_features")

@app.post("/analyze")
async def analyze_session(file: UploadFile = File(...)):
    # 1. Read the uploaded frame
    contents = await file.read()
    
    # 2. Parallel Execution: Send frame to Vision and Identity simultaneously
    async with httpx.AsyncClient(timeout=None) as client:
        # We fire these requests in parallel to save time
        vision_task = client.post(VISION_URL, files={"file": contents})
        identity_task = client.post(IDENTITY_URL, files={"file": contents})
        audio_task = client.get(AUDIO_URL)

        # Wait for all workers to respond
        v_res, id_res, a_res = await asyncio.gather(vision_task, identity_task, audio_task)

    # 3. Parse Results
    v_data = v_res.json()   # [phone, multi, missing, gaze_off, gaze_turn]
    id_data = id_res.json() # [dom, switch, unkn]
    a_data = a_res.json()   # [t2, t5, conf]

    # 4. Map to Fusion Features
    # Order: audio(3), vis(3), id(3), gaze(2)
    features = FusionFeatures(
        audio_t2=a_data[0], audio_t5=a_data[1], audio_conf=a_data[2],
        vis_phone=v_data[0], vis_multi=v_data[1], vis_miss=v_data[2],
        id_dom=id_data[0], id_switch=id_data[1], id_unkn=id_data[2],
        gaze_off=v_data[3], gaze_turn=v_data[4]
    )

    # 5. Run Fusion Logic
    risk_score = fusion_model.calculate_risk(features)
    status, message = fusion_model.get_violation_status(features)

    return {
        "risk_score": risk_score,
        "status": status,
        "message": message
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)