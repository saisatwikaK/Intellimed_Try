#!/usr/bin/env python3
"""
IntelliMed AI — Ultralytics YOLOv8 Pill Detection Training Script
Classes:
  0: Dolo_650
  1: Cetirizine

Requirements:
  pip install ultralytics opencv-python torch torchvision
"""

import os
import sys

def main():
    print("=====================================================")
    print("  IntelliMed AI — YOLOv8 Pill Detector Training")
    print("=====================================================")

    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] ultralytics package not found. Run:")
        print("        pip install ultralytics torch torchvision")
        sys.exit(1)

    yaml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "data.yaml"))
    if not os.path.exists(yaml_path):
        print(f"[ERROR] data.yaml not found at {yaml_path}")
        sys.exit(1)

    print(f"[INFO] Using dataset config: {yaml_path}")
    print("[INFO] Loading pretrained YOLOv8n backbone...")

    # Load pretrained YOLOv8 nano model
    model = YOLO("yolov8n.pt")

    # Hyperparameters optimized for small medical object classification
    epochs = 50
    imgsz = 640
    batch = 16
    device = 0 if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu"

    print(f"[INFO] Training settings: epochs={epochs}, imgsz={imgsz}, batch={batch}, device={device}")

    # Train model
    results = model.train(
        data=yaml_path,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        name="intellimed_yolov8_run",
        project="runs/detect",
        save=True,
        save_period=10,
        plots=True,
        patience=15,
        verbose=True
    )

    print("[SUCCESS] Training completed.")
    print("[INFO] Evaluating on validation set...")
    metrics = model.val()
    print(f"  Precision (P):  {metrics.box.mp:.4f}")
    print(f"  Recall (R):     {metrics.box.mr:.4f}")
    print(f"  mAP@50:         {metrics.box.map50:.4f}")
    print(f"  mAP@50-95:      {metrics.box.map:.4f}")

    # Export best model
    best_weights = os.path.join("runs", "detect", "intellimed_yolov8_run", "weights", "best.pt")
    if os.path.exists(best_weights):
        print(f"[INFO] Copying best weights to root: best.pt")
        import shutil
        shutil.copy(best_weights, "best.pt")

    print("[INFO] Exporting to ONNX format for client browser web runtime...")
    model.export(format="onnx")
    print("=====================================================")
    print("  IntelliMed AI Training Pipeline Completed.")
    print("=====================================================")

if __name__ == "__main__":
    main()
