export async function getVuelessVersion() {
  return await fetch("https://registry.npmjs.org/vueless/latest");
}
