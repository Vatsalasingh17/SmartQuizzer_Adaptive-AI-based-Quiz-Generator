export const calculatePercentage = (correct, total) => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const cleanJsonResponse = (text) => {
  return text.replace(/```json\n?|\n?```/g, '').trim();
};

export const getGradeFromPercentage = (percentage) => {
  if (percentage >= 90) return { grade: 'A', color: 'green' };
  if (percentage >= 80) return { grade: 'B', color: 'blue' };
  if (percentage >= 70) return { grade: 'C', color: 'yellow' };
  if (percentage >= 60) return { grade: 'D', color: 'orange' };
  return { grade: 'F', color: 'red' };
};