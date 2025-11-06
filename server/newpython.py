import sys
import os
import numpy as np
from scipy.io import loadmat
from io import BytesIO
import json

# Arguments: input file paths..., output folder
input_files = sys.argv[1:-1]
output_folder = sys.argv[-1]

os.makedirs(output_folder, exist_ok=True)

def process_file(input_path):
    ext = os.path.splitext(input_path)[1].lower()
    output_path = os.path.join(output_folder, os.path.basename(input_path) + ".npy")

    with open(input_path, "rb") as f:
        data = f.read()

    # ---------- Handle .mat ----------
    if ext == ".mat":
        buffer = BytesIO(data)
        mat_data = loadmat(buffer)
        keys = [k for k in mat_data.keys() if not k.startswith("__")]
        if not keys:
            raise ValueError(f"No valid data found in {input_path}")
        ecg = mat_data[keys[0]]
        if ecg.shape[0] == 12:
            ecg = ecg.T
        factor = ecg.shape[0] // 1000
        ecg = ecg[::factor, :]
        if ecg.size != 1000 * 12:
            ecg = ecg.reshape(1000, 12)

    # ---------- Handle .dat ----------
    elif ext == ".dat":
        ecg = np.frombuffer(data, dtype=np.int16)
        if ecg.size != 1000 * 12:
            raise ValueError(f"{input_path}: .dat size mismatch, got {ecg.size}")
        ecg = ecg.reshape(1000, 12)

    # ---------- Handle .json/.txt ----------
    elif ext in [".json", ".txt"]:
        ecg = json.loads(data.decode())
        ecg = np.array(ecg)
        if ecg.shape[0] != 12 or ecg.shape[1] != 5000:
            raise ValueError(f"{input_path}: expected shape (12,5000), got {ecg.shape}")
        ecg = ecg[:, ::5].T  # Downsample 500Hz -> 100Hz

    else:
        raise ValueError(f"Unsupported file format: {ext}")

    np.save(output_path, ecg)
    return output_path

# Process all files
output_files = []
for file_path in input_files:
    output_files.append(process_file(file_path))

# Print comma-separated list for Node to read
# end of newpython.py

print(",".join(output_files))
