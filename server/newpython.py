import sys
import os
import numpy as np
from scipy.io import loadmat
from io import BytesIO

# Arguments: input file path, output npy path
input_path = sys.argv[1]
output_path = sys.argv[2]

# Read file bytes
with open(input_path, "rb") as f:
    data = f.read()

ext = os.path.splitext(input_path)[1].lower()

# -------------------- Handle .mat --------------------
if ext == ".mat":
    try:
        # Load from bytes to avoid temp files (Windows-safe)
        buffer = BytesIO(data)
        mat_data = loadmat(buffer)
    except Exception as e:
        raise RuntimeError(f"Failed to load .mat file: {e}")

    # Auto-detect real data key
    keys = [k for k in mat_data.keys() if not k.startswith("__")]
    if not keys:
        raise ValueError("No valid data found in .mat file")
    data_key = keys[0]  # pick the first real variable
    ecg = mat_data[data_key]

    # Ensure it's the right shape
    print(f"Variable '{data_key}' shape:", ecg.shape)
    if ecg.shape[0] == 12:
        ecg = ecg.T  # shape (5000,12)

    # Downsample to 1000 samples
    factor = ecg.shape[0] // 1000
    ecg = ecg[::factor, :]
    print("Reshaped to:", ecg.shape)

    if ecg.size != 1000 * 12:
        try:
            ecg = ecg.reshape(1000, 12)
        except Exception:
            raise ValueError(f".mat variable '{data_key}' cannot be reshaped to (1000,12)")

# -------------------- Handle .dat --------------------
elif ext == ".dat":
    ecg = np.frombuffer(data, dtype=np.int16)
    if ecg.size != 1000 * 12:
        raise ValueError(f".dat size mismatch: expected 12000, got {ecg.size}")
    ecg = ecg.reshape(1000, 12)

# -------------------- Unsupported --------------------
else:
    raise ValueError(f"Unsupported file format: {ext}")

# Save as .npy
np.save(output_path, ecg)
print(f"Saved {output_path} (shape: {ecg.shape}, source key: {ext})")
