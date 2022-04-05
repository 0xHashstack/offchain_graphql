const logger = require("./logger")
const basicLogging = {
    requestDidStart(requestContext) {
        logger.log('http',"request started");
        logger.log('http',requestContext.request.query);
        //logger.log('info',requestContext.request.variables);
        return {
            didEncounterErrors(requestContext) {
                logger.error("an error happened in response to query " + requestContext.request.query);
                logger.error(requestContext.errors);
            }
        };
    },

    willSendResponse(requestContext) {
        logger.log('info',"response sent", requestContext.response);
    }
  };

  module.exports = {basicLogging};