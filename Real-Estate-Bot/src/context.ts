export const context = async (): Promise<any> => {
  const res = await fetch('/context.json');
  if (!res.ok) throw new Error('Failed to load context file');
  return res.json();
};