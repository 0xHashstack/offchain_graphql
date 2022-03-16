const accounts= require ('../dataset/index').accounts;

exports.resolvers = {
    Query: {
        accounts: () => accounts,
    },
  };
  
