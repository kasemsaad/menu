export const generateOrderNumber = () => {
  const date = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const prefix = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${prefix}-${random}`;
};
