import { hash, compare } from "bcrypt";
import { CONST_FACTOR } from "../types/types";

export const hashdPassword = async (passwordInsecureUser: string): Promise<string> => {
  const passwordUser = await hash(passwordInsecureUser, CONST_FACTOR);
  return passwordUser;
};

export const VerifyPassword = async (
  passwordInsecureUser: string,
  storeHash: string
): Promise<boolean> => {
  const passwordUser = await compare(passwordInsecureUser, storeHash);
  return passwordUser;
};

