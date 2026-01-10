import cv2
import numpy as np
import mediapipe as mp

class GazeProcessor:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(refine_landmarks=True)
        self.YAW_THRESH = 20 # 
        self.PITCH_THRESH = 15 # 

    def process_frame(self, frame):
        h, w, _ = frame.shape
        results = self.face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        if not results.multi_face_landmarks:
            return [1.0, 1.0] # Face missing = maximum gaze risk

        landmarks = results.multi_face_landmarks[0].landmark
        
        # Simplified Head Pose Estimation 
        # Nose tip, Chin, Left Eye, Right Eye, Left Mouth, Right Mouth
        image_pts = np.array([
            [landmarks[1].x * w, landmarks[1].y * h],   # Nose
            [landmarks[152].x * w, landmarks[152].y * h], # Chin
            [landmarks[33].x * w, landmarks[33].y * h],   # L Eye
            [landmarks[263].x * w, landmarks[263].y * h]  # R Eye
        ], dtype="double")

        # 3D model points
        model_pts = np.array([(0.0, 0.0, 0.0), (0.0, -330.0, -65.0), (-225.0, 170.0, -135.0), (225.0, 170.0, -135.0)])
        
        focal_length = w
        cam_matrix = np.array([[focal_length, 0, w/2], [0, focal_length, h/2], [0, 0, 1]], dtype="double")
        
        _, rvec, _ = cv2.solvePnP(model_pts, image_pts, cam_matrix, np.zeros((4,1)))
        rmat, _ = cv2.Rodrigues(rvec)
        angles, _, _, _, _, _ = cv2.decomposeProjectionMatrix(np.hstack((rmat, [[0],[0],[0]])))
        
        pitch, yaw = angles[0][0], angles[1][0]
        
        gaze_offscreen = 1.0 if abs(yaw) > self.YAW_THRESH else 0.0
        head_turned = 1.0 if abs(pitch) > self.PITCH_THRESH else 0.0
        
        return [gaze_offscreen, head_turned]