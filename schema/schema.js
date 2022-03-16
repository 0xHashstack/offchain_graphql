const graphql = require('graphql')
const {
    GraphQLString,
    GraphQLInt,
    GraphQLObjectType,
    GraphQLSchema
} = graphql

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        data: {
            type: GraphQLString,
            resolve (parentValue, args) {
                return 'Hello, Graphql!'
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
})