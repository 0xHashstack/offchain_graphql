const { graphqlTestCall } = require( "./graphqlTestCall");

const getAccountDetailsByAddressQuery = `
  query getAccountDetailsByAddress($address: String!) {
    getAccountDetailsByAddress(address: $address) {
      id,
      address,
      whitelist_status_id,
      user_role,
    }
  }
`;


describe("resolvers", () => {
  it("getAccountDetailsByAddress", async () => {
    const response = await graphqlTestCall(getAccountDetailsByAddressQuery, { address: "0x0000000000000000000000DUMMY_1",});
    console.log(response);
    
    expect(response).toEqual({
      data: {
        getAccountDetailsByAddress: {
          id: "f554c8f6-06e6-4386-88b9-59047adb6365",
          address: "0x0000000000000000000000DUMMY_1",
          whitelist_status_id: 2,
          user_role: "DUMMY_USER"
        }
      }
    });
    
  });
});