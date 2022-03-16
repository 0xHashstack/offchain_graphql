const accounts= require ('../dataset/index').accounts;

exports.resolvers = {
    Query: {
        accounts: () => accounts,
        account : (address) => {
          return accounts.find(account => account?.address === address)
        }
    },
  };
  
