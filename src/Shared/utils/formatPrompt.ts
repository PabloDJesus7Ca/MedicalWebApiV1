// TODO: Implementar formateador estructurado de prompt clínico (BE-11)
export const formatPrompt = (sintomas: string, historial: string) => {
  return `Síntomas: ${sintomas}\nHistorial: ${historial}`;
};
