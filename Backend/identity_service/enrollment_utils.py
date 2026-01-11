# #-------------------------Comment after Testing----------------------------
# from pathlib import Path

# # identity_service/identity_module.py
# BASE_DIR = Path(__file__).resolve().parent  # identity_service/

# # Go up to Backend/, then into vision_service/weights/best.pt
# model_path = BASE_DIR.parent / "vision_service" / "weights" / "best.pt"
# #-----------------------------------------------------


# [User enters name] 
#       ↓
# [Capture webcam images] 
#       ↓
# [Detect face → save image if detected] 
#       ↓
# [Generate FaceNet embeddings for all students] 
#       ↓
# [Train linear SVM on embeddings] 
#       ↓
# [Save SVM model, label encoder, embeddings to disk]




import os
import cv2 as cv
from pathlib import Path
import numpy as np
import torch
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from facenet_pytorch import InceptionResnetV1
from ultralytics import YOLO

# --- CONFIGURATION ---
DATA_DIR = "data/students_faces"
SVM_MODEL_PATH = "data/svm_model_facenet.pkl"
ENCODER_PATH = "data/label_encoder.pkl"
EMBEDDINGS_PATH = "data/faces_embeddings_facenet.npz"

# DATA_DIR = BASE_DIR/"data/students_faces"
# SVM_MODEL_PATH = BASE_DIR/"data/svm_model_facenet.pkl"
# ENCODER_PATH = BASE_DIR/"data/label_encoder.pkl"
# EMBEDDINGS_PATH = BASE_DIR/"data/faces_embeddings_facenet.npz"

class EnrollmentManager:
    def __init__(self):
        self.DATA_DIR = "data/students_faces"
        # self.DATA_DIR = BASE_DIR/"data/students_faces"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Initializing Enrollment Manager on {self.device}...")
        
        # Load model
        self.detector = YOLO("/app/weights/best.pt") # will be replaced with face-specific YOLO for better results
        # self.detector = YOLO(model_path)
        self.facenet = InceptionResnetV1(pretrained="vggface2").eval().to(self.device)

    def sync_and_train(self):
        """Step 2 & 3: Generate embeddings for all folders and train the SVM."""
        X_all, Y_all = [], []

        print("🔄 Generating embeddings for all registered students...")
        
        for student_name in os.listdir(DATA_DIR):
            student_dir = os.path.join(DATA_DIR, student_name)
            if not os.path.isdir(student_dir): continue

            for img_name in os.listdir(student_dir):
                img_path = os.path.join(student_dir, img_name)
                img = cv.imread(img_path)
                if img is None: continue

                # Detect face
                results = self.detector(img, verbose=False, save=False, save_txt=False,
    save_conf=False, project=None)
                
                # 🔥 cleanup YOLO junk
                runs_path = Path.cwd() / "runs"
                if runs_path.exists():
                    import shutil
                    shutil.rmtree(runs_path)
                    print("runs/ deleted")


                if len(results[0].boxes) > 0:
                    box = results[0].boxes[0]
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                    crop = img[y1:y2, x1:x2]

                    if crop.size == 0: continue

                    # Facenet Preprocessing
                    face = cv.cvtColor(crop, cv.COLOR_BGR2RGB)
                    face = cv.resize(face, (160, 160))
                    face = face.astype(np.float32) / 255.0
                    face = torch.from_numpy(np.transpose(face, (2, 0, 1))).unsqueeze(0).to(self.device)

                    with torch.no_grad():
                        embedding = self.facenet(face).cpu().numpy().flatten()
                        X_all.append(embedding)
                        Y_all.append(student_name)

        if len(X_all) == 0:
            print("❌ No faces found in data directory. Training aborted.")
            return

        # --- Train SVM ---
        print(f"📊 Training SVM with {len(np.unique(Y_all))} identities...")
        
        encoder = LabelEncoder()
        Y_encoded = encoder.fit_transform(Y_all)

        # Use probability=True so we can use thresholds during the exam
        svm_model = SVC(kernel="linear", probability=True)
        svm_model.fit(X_all, Y_encoded)

        # Save everything
        # os.makedirs(Path(__file__).resolve().parent/"data", exist_ok=True)  This line is not needed because data/ already exists
        pickle.dump(svm_model, open(SVM_MODEL_PATH, "wb"))
        pickle.dump(encoder, open(ENCODER_PATH, "wb"))
        np.savez(EMBEDDINGS_PATH, X=X_all, Y=Y_all)
        
        print("Registration Complete. Models saved to data/")


# --- Usage Example ---
if __name__ == "__main__":
    manager = EnrollmentManager()
    manager.sync_and_train()