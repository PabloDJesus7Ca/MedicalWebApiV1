import { CreateUserDto } from "./auth.models.user";
export type ResponseCreateUserDto = Omit<CreateUserDto, "password">;

export interface LoginResponseDto {
  token: string;
  id: number;
}
