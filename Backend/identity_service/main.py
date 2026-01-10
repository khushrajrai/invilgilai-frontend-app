import cv2
import numpy as np
import os
from fastapi import FastAPI, UploadFile, File, Form
from identity_module import IdentityProcessor
from enrollment_utils import EnrollmentManager
from enrollment_utils import DATA_DIR
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to hold the processor (reloaded after enrollment)
identity_p = IdentityProcessor()


#---------------------------------------------------------------------------------
@app.post("/enroll")
async def enroll_student(student_name: str = Form(...), files: list[UploadFile] = File(...)):
    manager = EnrollmentManager()
    student_dir = os.path.join(manager.DATA_DIR, student_name)
    os.makedirs(student_dir, exist_ok=True)

    # Count existing files to avoid overwriting during multiple requests
    existing_count = len(os.listdir(student_dir))

    for idx, file in enumerate(files):
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is not None:
            # Save frame without training
            file_path = os.path.join(student_dir, f"{existing_count + idx}.jpg")
            cv2.imwrite(file_path, frame)

    return {"status": "success", "message": f"Saved {len(files)} images for {student_name}"}

@app.post("/train")
async def train_model():
    print("🚀 Training request received. Starting SVM sync_and_train...")
    manager = EnrollmentManager()
    
    manager.sync_and_train()
    
    global identity_p
    identity_p = IdentityProcessor() # Reload weights
    
    return {"status": "success", "message": "SVM Model updated and reloaded"}
#---------------------------------------------------------------------------------


# @app.post("/enroll")
# async def enroll_student(student_name: str = Form(...), files: list[UploadFile] = File(...)):
#     manager = EnrollmentManager()
#     student_dir = os.path.join(manager.DATA_DIR, student_name)
#     os.makedirs(student_dir, exist_ok=True)

#     for idx, file in enumerate(files):
#         contents = await file.read()
#         nparr = np.frombuffer(contents, np.uint8)
#         frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#         if frame is not None:
#             # Save frame as-is
#             cv2.imwrite(os.path.join(student_dir, f"{idx}.jpg"), frame)

#     # After saving all frames, generate embeddings & train SVM
#     manager.sync_and_train()
#     global identity_p
#     identity_p = IdentityProcessor()    # Reloaded
#     trained_for = {"status": "success", "message": f"Model trained for {student_name}"}
#     print(trained_for)      # DEBUG
#     return {"status": "success", "message": f"{student_name} enrolled with {len(files)} images"}



@app.post("/process")
async def verify_identity(file: UploadFile = File(...)):
    """Predicts identity and returns [dom_ratio, switch_ratio, unknown_ratio]."""
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return [0.0, 0.0, 1.0]

    # Returns the 3 ratios expected by the Gateway
    ratios = identity_p.process_frame(frame)
    return ratios

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)