import { CreateUserDto } from "./auth.models.user";
export type ResponseCreateUserDto = Omit<CreateUserDto, "password">;
