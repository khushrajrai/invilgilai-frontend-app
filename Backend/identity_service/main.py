import cv2
import numpy as np
import os
from fastapi import FastAPI, UploadFile, File, Form
from identity_module import IdentityProcessor
from enrollment_utils import EnrollmentManager
from enrollment_utils import DATA_DIR

app = FastAPI()

# Global variable to hold the processor (reloaded after enrollment)
identity_p = IdentityProcessor()

# @app.post("/enroll")
# async def enroll_student(student_name: str = Form(...)):
#     """Triggers the enrollment and training pipeline."""
#     manager = EnrollmentManager()
#     # Note: On a server, capture_and_save would usually happen via 
#     # frontend sending frames. For now, this calls your existing sync logic.
#     manager.sync_and_train()
    
#     # Reload the processor to use the new SVM weights
#     global identity_p
#     identity_p = IdentityProcessor()
#     return {"status": "success", "message": f"Model trained for {student_name}"}

@app.post("/enroll")
async def enroll_student(student_name: str = Form(...), files: list[UploadFile] = File(...)):
    manager = EnrollmentManager()
    student_dir = os.path.join(manager.DATA_DIR, student_name)
    os.makedirs(student_dir, exist_ok=True)

    for idx, file in enumerate(files):
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is not None:
            # Save frame as-is
            cv2.imwrite(os.path.join(student_dir, f"{idx}.jpg"), frame)

    # After saving all frames, generate embeddings & train SVM
    manager.sync_and_train()
    global identity_p
    identity_p = IdentityProcessor()
    trained_for = {"status": "success", "message": f"Model trained for {student_name}"}
    print(trained_for)
    return {"status": "success", "message": f"{student_name} enrolled with {len(files)} images"}



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