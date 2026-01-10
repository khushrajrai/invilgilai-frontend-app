import numpy as np
from dataclasses import dataclass
from collections import deque

@dataclass
class FusionFeatures:
    audio_t2: float; audio_t5: float; audio_conf: float
    vis_phone: float; vis_multi: float; vis_miss: float
    id_dom: float; id_switch: float; id_unkn: float
    gaze_off: float; gaze_turn: float

class TemporalBehaviorFusionModel:
    def __init__(self):
        self.weights = {"phone": 0.35, "identity": 0.25, "gaze": 0.15, "audio": 0.15, "presence": 0.10}
        self.score_history = deque(maxlen=10)

    def calculate_risk(self, f: FusionFeatures) -> int:
        # 1. Identity Risk with internal 1.0 cap (prevents overflow)
        id_risk = min((1.0 - f.id_dom) + f.id_switch + f.id_unkn, 1.0)
        
        # 2. Weighted Sum (max logic and proper isolation)
        risk = (self.weights["phone"]    * f.vis_phone + 
                self.weights["identity"] * id_risk +
                self.weights["gaze"]     * max(f.gaze_off, f.gaze_turn) +
                self.weights["audio"]    * max(f.audio_t2, f.audio_t5) +
                self.weights["presence"] * max(f.vis_multi, f.vis_miss))
        
        score = int(np.clip(risk * 100, 0, 100))
        self.score_history.append(score)
        return score

    def get_violation_status(self, f: FusionFeatures):
        # Instant Failure Rules
        if f.id_unkn > 0.8: return "AUTO_FAIL", "Identity Mismatch"
        if f.vis_multi > 0.5: return "CRITICAL", "Multiple People"
        
        # Temporal Logic
        if not self.score_history: return "CLEAN", ""
        
        avg = sum(self.score_history) / len(self.score_history)

        # Escalation Path
        if avg > 80: return "VIOLATION", "Sustained suspicious behavior"
        if avg > 50: return "HIGH_RISK", "Multiple minor flags raised"
        if avg > 25: return "SUSPICIOUS", "Inconsistent focus"
        
        return "CLEAN", ""