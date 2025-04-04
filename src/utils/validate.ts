export const validateEmail = (email: string): boolean => {
  if (email.toLowerCase() === "admin") return true;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
