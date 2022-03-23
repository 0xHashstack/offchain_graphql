import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";
import { typeDefs } from "../typedefs/index";
import { resolvers } from "../resolvers";

const schema = makeExecutableSchema({ typeDefs, resolvers });

export const graphqlTestCall = async (
  query,
  variables,
  userId,
) => {
  return graphql(
    schema,
    query,
    undefined,
    {
      req: {
        session: {
          userId
        }
      },
      res: {
        clearCookie: () => {}
      }
    },
    variables
  );
};