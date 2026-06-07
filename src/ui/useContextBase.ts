import { useContext, type Context } from "react";

export const useContextBase = <T>(
  context: Context<T | undefined>,
  errorMessage: string,
): T => {
  const contextValue = useContext(context);

  if (!contextValue) {
    throw new Error(errorMessage);
  }

  return contextValue;
};
