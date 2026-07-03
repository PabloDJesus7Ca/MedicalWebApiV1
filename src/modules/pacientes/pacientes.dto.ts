export interface CreatePacienteDto {
  nombre: string;
  edad: number;
  sexo: string;
  documento: string;
}

export interface UpdatePacienteDto {
  nombre?: string;
  edad?: number;
  sexo?: string;
  documento?: string;
}

export interface CreateLaboratorioDto {
  descripcion: string;
  resultado: string;
}
