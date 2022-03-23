const { Connection } = require("typeorm");
import { graphqlTestCall } from "./graphqlTestCall";
import { createTestConn } from "./createTestConn";
const querygetAccountDetailsByAddressData = 
    `query Query($address: String!) {
        getAccountDetailsByAddress(address: $address) {
          id
        }
      }
}`;

let conn;

beforeAll(async () => {
    conn = await createTestConn();
  });
  
  afterAll(async () => {
    await conn.close();
  });

  describe("resolvers", () => {
    it("getAccountDetailsByAddress", async () => {


    })
})
