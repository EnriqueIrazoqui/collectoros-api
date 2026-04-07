function calculateRetryCheckAt(failures = 1, frequencyHours = 24) {
  const next = new Date();

  if (failures <= 1) {
    next.setMinutes(next.getMinutes() + 30);
    return next;
  }

  if (failures === 2) {
    next.setHours(next.getHours() + 2);
    return next;
  }

  next.setHours(next.getHours() + Math.min(frequencyHours, 6));
  return next;
}

module.exports = calculateRetryCheckAt;