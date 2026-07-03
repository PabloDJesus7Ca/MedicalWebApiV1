import { Rol } from "../../generated/prisma";

export interface ResponseUserDto {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}
