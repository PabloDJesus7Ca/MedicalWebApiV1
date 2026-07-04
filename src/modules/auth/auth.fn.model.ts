import { CreateUserDto } from "./auth.models.user";
import { ResponseCreateUserDto } from "./auth.types.user";

export const ShowRealResponseToUser = async (
  user: CreateUserDto
): Promise<ResponseCreateUserDto> => {
  const { password: _password, ...ResponseToTheUser } = user;
  const response = ResponseToTheUser;
  return response;
};
