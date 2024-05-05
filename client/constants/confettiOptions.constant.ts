type ConfettiOptions = {
  spread: number;
  origin: { y: number };
  particleCount?: number;
  startVelocity?: number;
  angle?: number;
};

export const confettiOptions: ConfettiOptions = {
  spread: 100,
  startVelocity: 35,
  origin: { y: 0.6 },
};
