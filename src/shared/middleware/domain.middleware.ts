import { CorsOptions } from "cors";
import { CorsOriginOptions } from "@config/system.config";
import { ListOfDomainsVerified, ListOfMethodsALlowed } from "@shared/constant/system.constant";

export const checkDomainServerCors = ({
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
      return callback(null, false);
    },
    methods,
  };
};
