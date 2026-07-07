import { Rol } from "../../generated/prisma";

export interface CreateUsuarioAdminDto {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

export interface UpdateUsuarioAdminDto {
  nombre?: string;
  email?: string;
  rol?: Rol;
  activo?: boolean;
}
