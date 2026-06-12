import { CorsOptions } from "cors";
import { CorsOriginOptions } from "../../configurations/configs";
import { ListOfDomainsVerified, ListOfMethodsALlowed } from "../../configurations/constant";

export const checkDomianServerCors = ({
  ListOfDomainType = ListOfDomainsVerified,
  methods = ListOfMethodsALlowed,
}: CorsOriginOptions = {}): CorsOptions => {
  return {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || ListOfDomainType.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("We cannot allow you to send requests to this server."));
    },
    methods,
  };
};
