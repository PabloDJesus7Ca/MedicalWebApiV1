export interface HistorialFiltersDto {
  pacienteId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  page?: number;
  pageSize?: number;
}

export interface CreateConsultaDto {
  pacienteId: number;
  input: string;
}

export interface UpdateConsultaDto {
  input?: string;
  output?: string;
  completed?: string;
}
