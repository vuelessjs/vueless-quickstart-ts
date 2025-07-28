export async function getVuelessVersion() {
  const response = await fetch("https://registry.npmjs.org/vueless/latest");

  return response;
}
