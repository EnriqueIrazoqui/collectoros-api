function calculateNextCheckAt(frequencyHours = 24) {
  const next = new Date();
  next.setHours(next.getHours() + frequencyHours);
  return next;
}

module.exports = calculateNextCheckAt;