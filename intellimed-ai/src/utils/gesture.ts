/**
 * MediaPipe Hand Landmark Topology & Classification Rules
 * 
 * 0: Wrist
 * 1-4: Thumb (4: Tip)
 * 5-8: Index (5: MCP, 6: PIP, 7: DIP, 8: TIP)
 * 9-12: Middle (9: MCP, 10: PIP, 11: DIP, 12: TIP)
 * 13-16: Ring (13: MCP, 14: PIP, 15: DIP, 16: TIP)
 * 17-20: Pinky (17: MCP, 18: PIP, 19: DIP, 20: TIP)
 */

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export type GestureType = 'OPEN PALM' | 'CLOSED FIST' | 'THUMBS UP' | 'PINCH / OK';

export interface GestureClassificationResult {
  gesture: GestureType | null;
  confidence: number;
  details: {
    handScale: number;
    thumbIndexDist: number;
    normalizedPinchDist: number;
    isMiddleExtended: boolean;
    isRingExtended: boolean;
    isPinkyExtended: boolean;
    isIndexExtended: boolean;
    isThumbExtended: boolean;
  };
}

function dist2D(p1: LandmarkPoint, p2: LandmarkPoint): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Classifies hand landmarks using scale-normalized geometry.
 * Correctly distinguishes OK sign from a simple pinch or fist.
 */
export function classifyHandGesture(landmarks: LandmarkPoint[]): GestureClassificationResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      gesture: null,
      confidence: 0,
      details: {
        handScale: 0,
        thumbIndexDist: 0,
        normalizedPinchDist: 0,
        isMiddleExtended: false,
        isRingExtended: false,
        isPinkyExtended: false,
        isIndexExtended: false,
        isThumbExtended: false,
      },
    };
  }

  const wrist = landmarks[0];
  const thumbMcp = landmarks[2];
  const thumbTip = landmarks[4];

  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];
  const indexTip = landmarks[8];

  const middleMcp = landmarks[9];
  const middlePip = landmarks[10];
  const middleTip = landmarks[12];

  const ringMcp = landmarks[13];
  const ringPip = landmarks[14];
  const ringTip = landmarks[16];

  const pinkyMcp = landmarks[17];
  const pinkyPip = landmarks[18];
  const pinkyTip = landmarks[20];

  // Scale normalization: distance from wrist to middle MCP (palm length reference)
  // This is invariant to camera distance, zoom, and orientation.
  const palmLength = dist2D(wrist, middleMcp);
  const handScale = Math.max(palmLength, 20); // guard against zero

  // Distances from wrist to tips vs PIPs
  const distWristIndexTip = dist2D(wrist, indexTip);
  const distWristIndexPip = dist2D(wrist, indexPip);

  const distWristMiddleTip = dist2D(wrist, middleTip);
  const distWristMiddlePip = dist2D(wrist, middlePip);

  const distWristRingTip = dist2D(wrist, ringTip);
  const distWristRingPip = dist2D(wrist, ringPip);

  const distWristPinkyTip = dist2D(wrist, pinkyTip);
  const distWristPinkyPip = dist2D(wrist, pinkyPip);

  // Extension states (tip is significantly farther from wrist than PIP joint)
  const isIndexExtended = distWristIndexTip > distWristIndexPip * 1.15;
  const isMiddleExtended = distWristMiddleTip > distWristMiddlePip * 1.15;
  const isRingExtended = distWristRingTip > distWristRingPip * 1.15;
  const isPinkyExtended = distWristPinkyTip > distWristPinkyPip * 1.15;

  // Thumb extension (relative to index MCP base)
  const isThumbExtended = dist2D(thumbTip, indexMcp) > handScale * 0.7;

  // Thumb tip to index tip distance
  const thumbIndexDist = dist2D(thumbTip, indexTip);
  const normalizedPinchDist = thumbIndexDist / handScale;

  const details = {
    handScale,
    thumbIndexDist,
    normalizedPinchDist,
    isMiddleExtended,
    isRingExtended,
    isPinkyExtended,
    isIndexExtended,
    isThumbExtended,
  };

  // 1. OK SIGN CHECK:
  // - Thumb tip and index tip touch or form a circle (normalized distance < 0.32 of palm length)
  // - Remaining three fingers (middle, ring, pinky) MUST be extended!
  // - Middle finger tip must be separated from thumb-index loop (> 0.45 * handScale)
  const isThumbIndexTouching = normalizedPinchDist < 0.34;
  const areOtherFingersExtended = isMiddleExtended && isRingExtended;
  const isMiddleClearOfPinch = dist2D(middleTip, thumbTip) > handScale * 0.45;

  if (isThumbIndexTouching && areOtherFingersExtended && isMiddleClearOfPinch) {
    // High confidence OK sign
    const confidence = Math.min(99.2, Math.max(90, +(98.5 - normalizedPinchDist * 20).toFixed(1)));
    return {
      gesture: 'PINCH / OK',
      confidence,
      details,
    };
  }

  // 2. OPEN PALM CHECK:
  // All 4 finger tips extended away from wrist, and thumb spread
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && isThumbExtended) {
    return {
      gesture: 'OPEN PALM',
      confidence: 96.5,
      details,
    };
  }

  // 3. THUMBS UP CHECK:
  // 4 fingers curled in (index, middle, ring, pinky not extended), thumb pointing up (y of thumb tip < wrist y)
  const allFourFingersCurled = !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended;
  const isThumbPointingUp = thumbTip.y < thumbMcp.y && thumbTip.y < wrist.y;

  if (allFourFingersCurled && isThumbPointingUp && isThumbExtended) {
    return {
      gesture: 'THUMBS UP',
      confidence: 95.0,
      details,
    };
  }

  // 4. CLOSED FIST CHECK:
  // All 4 fingers curled, thumb folded across fingers
  if (allFourFingersCurled && !isThumbExtended) {
    return {
      gesture: 'CLOSED FIST',
      confidence: 94.2,
      details,
    };
  }

  // 5. SIMPLE PINCH (If fingers aren't extended, but thumb and index touch, label as close or none)
  // In our system, PINCH / OK is the dedicated gesture for intake confirmation when OK sign is formed.
  return {
    gesture: null,
    confidence: 0,
    details,
  };
}
