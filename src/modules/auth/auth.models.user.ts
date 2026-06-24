import { Rol } from "../../generated/prisma";

export interface CreateUserDto {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

export interface CheckTypeLoginDto {
  email: string;
  password: string;
}
