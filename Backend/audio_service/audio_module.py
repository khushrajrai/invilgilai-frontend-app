import numpy as np
import sounddevice as sd
import queue
from collections import deque
from panns_inference import AudioTagging

errors = deque(maxlen=500)
model_path = "./panns_data/Cnn14_mAP=0.431.pth"

class AudioFeatureAggregator:
    def __init__(self):
        self.is_talking_buf = deque(maxlen=5)  # last 5 seconds
        self.voice_conf_buf = deque(maxlen=5)

    def update(self, features):
        self.is_talking_buf.append(features["is_talking"])
        self.voice_conf_buf.append(features["voice_conf"])

    def get_features(self):
        if len(self.is_talking_buf) < 1:
            return None
        audio_talking_ratio_2s = np.mean(list(self.is_talking_buf)[-2:])    # Taking the last 2 secs out of the recorded 5 secs and taking thier mean value
        audio_talking_ratio_5s = np.mean(self.is_talking_buf)
        audio_conf_mean_2s = np.mean(list(self.voice_conf_buf)[-2:])
        return [
            float(audio_talking_ratio_2s),
            float(audio_talking_ratio_5s),
            float(audio_conf_mean_2s),
        ]


class AudioPipeline:
    def __init__(self):
        print("Initializing Audio CNN (PANNs-Cnn14)...")    #DEBUG
        self.device = "cpu"
        self.model = AudioTagging(checkpoint_path=model_path, device=self.device)
        self.TARGET_MAPPING = {"talking": [0, 137, 138, 139], "whispering": [5]}
        self.threshold = 0.15

    def process_chunk(self, audio_chunk):
        audio_tensor = audio_chunk[None, :]     # This line adds a batch dimension, turning a single audio chunk into a batch of one so it can be passed into the model.
        clipwise_output, _ = self.model.inference(audio_tensor)
        probs = clipwise_output[0]
        
        prob_speech = float(np.max(probs[self.TARGET_MAPPING["talking"]]))
        prob_whisper = float(probs[self.TARGET_MAPPING["whispering"][0]])
        voice_activity = max(prob_speech, prob_whisper)
        is_talking = 1 if voice_activity > self.threshold else 0
        return {"voice_conf": voice_activity, "is_talking": is_talking}


class AudioProcessor:
    def __init__(self, chunk_sec=1):
        self.sr = 32000
        self.pipeline = AudioPipeline()
        self.aggregator = AudioFeatureAggregator()
        self.q = queue.Queue()
        self.audio_features = np.zeros(3, dtype=np.float32)
        self.chunk_size = self.sr * chunk_sec
        self.running = False

    def _callback(self, indata, frames, time, status):
        # Flatten to mono audio
        if status:
            errors.append({"part": "audio_callback", "error": str(status)})
        self.q.put(indata.copy().flatten())

    def start(self):
        """Main entry point to be called in a background thread"""
        self.running = True
        print("🎧 Audio Listening started...")  #DEBUG
        with sd.InputStream(samplerate=self.sr, channels=1, callback=self._callback):
            buffer = np.zeros(0)
            while self.running:
                try:
                    # append all available audio to buffer
                    while not self.q.empty():
                        buffer = np.concatenate([buffer, self.q.get()])

                    # process 1-second chunks
                    while len(buffer) >= self.chunk_size:
                        chunk = buffer[:self.chunk_size]
                        buffer = buffer[self.chunk_size:]

                      

                        features = self.pipeline.process_chunk(chunk)
                        self.aggregator.update(features)
                        final_features = self.aggregator.get_features()

                        if final_features is not None:
                            # update the global variable that downstream model can read
                            self.audio_features = np.array(final_features, dtype=np.float32)
                            # debug print for each 1-second chunk
                            print("Chunk processed, audio_features =", self.audio_features)

                except Exception as e:
                           errors.append({"part": "processing_chunk", "error": str(e)})
                
                # Small sleep to prevent CPU spiking while waiting for audio data (pause the main thread for 100 milliseconds while audio keeps recording.)
                sd.sleep(100)
    def stop(self):
        self.running = False