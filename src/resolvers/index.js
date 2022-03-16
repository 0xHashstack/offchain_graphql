const { GraphQLScalarType, Kind } = require('graphql');
const db = require('../db/db')

const resolverMap = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
}

exports.resolvers = {
    Date: resolverMap,

    Query: {
        accounts: () => {
          return db.select('*').from('accounts');
        },
        account : (_, {address}) => {
          return db.select('*').from('accounts').where({address:address}).first();
        }
    },

    Mutation : {
        createAccount: (parent, args) => {
            //const newAccount = args;
            //accounts.push(newAccount);
            //return newAccount;
            return;
        }
    }
  };
  
