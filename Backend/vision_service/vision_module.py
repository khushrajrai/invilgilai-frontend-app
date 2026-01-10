import collections
from ultralytics import YOLO


model_path = "weights/best.pt"

class VisionProcessor:
    def __init__(self):
        self.model = YOLO(model_path)
        self.window_size = 10
        self.history = {
            "phone": collections.deque(maxlen=self.window_size),
            "multi_person": collections.deque(maxlen=self.window_size),
            "face_missing": collections.deque(maxlen=self.window_size)
        }
        # Automatically map Class IDs
        names = self.model.names
        self.PHONE_CLS = next(k for k, v in names.items() if v == "prohibited_device")
        self.PERSON_CLS = next(k for k, v in names.items() if v == "person") 
        self.FACE_CLS = next(k for k, v in names.items() if v == "face")


    def process_frame(self, frame, return_visuals=False):
        results = self.model(frame, verbose=False)
        result = results[0] # Keep the full result object for plotting
        detected = results[0].boxes.cls.cpu().numpy().astype(int).tolist()
        
        # Binary flags for current frame
        self.history["phone"].append(1 if self.PHONE_CLS in detected else 0)
        self.history["multi_person"].append(1 if detected.count(self.PERSON_CLS) >= 2 else 0)
        self.history["face_missing"].append(1 if self.FACE_CLS not in detected else 0)

        # Calculate Ratios
        # Using max(1, len) to avoid division by zero errors
        ratios = [
            sum(self.history["phone"]) / len(self.history["phone"]),
            sum(self.history["multi_person"]) / len(self.history["multi_person"]),
            sum(self.history["face_missing"]) / len(self.history["face_missing"])
        ]
    
        if return_visuals:
            return ratios, result.plot() 
        
        return ratios