export const SPIN_DURATION_MS = 5000;

export function calculateWinnerIndex(newRotation, numSlices) {
  if (!numSlices) return 0;
  const sliceAngle = 360 / numSlices;
  const normalizedRotation = newRotation % 360;
  const winningAngle = (360 - normalizedRotation) % 360;
  return Math.floor(winningAngle / sliceAngle);
}
