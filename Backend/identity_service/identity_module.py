import torch
import cv2 as cv
import numpy as np
import pickle
from collections import Counter, deque
from facenet_pytorch import InceptionResnetV1
from ultralytics import YOLO

# Path Definitions
SVM_MODEL_PATH = "data/svm_model_facenet.pkl"
ENCODER_PATH = "data/label_encoder.pkl"

class IdentityProcessor:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        # Load FaceNet once
        self.facenet = InceptionResnetV1(pretrained="vggface2").eval().to(self.device)
        # Load YOLO Face detector
        self.detector = YOLO("./weights/best.pt") # will be replaced with face-specific YOLO for better results

        # auto-resolve class IDs from model metadata
        names = self.detector.model.names
        self.FACE_CLS = next(
            k for k, v in names.items() if v.lower() == "face"
        )
        
        # Load trained SVM
        try:
            self.model = pickle.load(open(SVM_MODEL_PATH, "rb"))
            self.encoder = pickle.load(open(ENCODER_PATH, "rb"))
        except FileNotFoundError:
            print("CRITICAL: SVM models not found. Enrollment is required first.")
            self.model = None
            
        self.history = deque(maxlen=30) 

    def process_frame(self, frame, return_visuals=False):
        # 1. Detect faces
        results = self.detector(frame, verbose=False)
        current_id = "missing" # Default if no box is found
        debug_frame = frame.copy() if return_visuals else None

        target_box = None

        # Check if boxes exist
        boxes = results[0].boxes
        if len(boxes) > 0:
            current_id = "unknown" # Someone is there, but we haven't identified them yet
            
            # Assuming the largest box is the student
            
            for b in boxes:
                if int(b.cls[0]) == self.FACE_CLS:
                    target_box = b
                    current_id = "unknown"
                    break # Take the largest/first face found
        if target_box is not None:
            x1, y1, x2, y2 = target_box.xyxy[0].cpu().numpy().astype(int)
            crop = frame[y1:y2, x1:x2]
            
            if crop.size != 0 and crop.shape[0] >= 40 and crop.shape[1] >= 40:
                # Preprocess for FaceNet
                face = cv.cvtColor(crop, cv.COLOR_BGR2RGB)
                face = cv.resize(face, (160, 160))
                face = face.astype(np.float32) / 255.0
                face = torch.from_numpy(np.transpose(face, (2, 0, 1))).unsqueeze(0).to(self.device)

                # Inference
                with torch.no_grad():
                    emb = self.facenet(face).cpu().numpy()
                
                # Predict Identity
                if self.model:
                    probs = self.model.predict_proba(emb)
                    max_prob = np.max(probs)
                    if max_prob > 0.80: # Threshold for recognition
                        current_id = self.encoder.inverse_transform([np.argmax(probs)])[0]

            # 2. Draw Visuals if requested (debug)
            if return_visuals:
                color = (0, 255, 0) if current_id not in ["unknown", "missing"] else (0, 0, 255)
                cv.rectangle(debug_frame, (x1, y1), (x2, y2), color, 2)
                cv.putText(debug_frame, f"ID: {current_id}", (x1, y1 - 10), 
                           cv.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # 3. Update Temporal History
        self.history.append(current_id)
        counts = Counter(self.history)
        total = len(self.history)

        # 4. Calculate Features for Fusion
        # dom_ratio: how often the "main" student is present
        # switch_ratio: how often the person in front of the cam changes
        # unknown_ratio: combined "no face" and "wrong face" risk
        ratios = [
            counts.most_common(1)[0][1] / total,
            sum(self.history[i] != self.history[i-1] for i in range(1, total)) / total if total > 1 else 0,
            (counts.get("unknown", 0) + counts.get("missing", 0)) / total
        ]

        if return_visuals:
            return ratios, debug_frame
        return ratios