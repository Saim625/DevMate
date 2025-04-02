const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient");


const createSendEmailCommand = (toAddress, fromAddress) => {
    return new SendEmailCommand({
      Destination: {
        CcAddresses: [
        ],
        ToAddresses: [
          toAddress,
        ],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: "<h1>This is testing mail</h1>",
          },
          Text: {
            Charset: "UTF-8",
            Data: "This is testing mail",
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "SES testing",
        },
      },
      Source: fromAddress,
      ReplyToAddresses: [
        /* more items */
      ],
    });
  };
  
  const run = async () => {
    const sendEmailCommand = createSendEmailCommand(
      "saimsaeed526@gmail.com",
      "support@devmate.click",
    );
  
    try {
      return await sesClient.send(sendEmailCommand);
    } catch (caught) {
      if (caught instanceof Error && caught.name === "MessageRejected") {
        /** @type { import('@aws-sdk/client-ses').MessageRejected} */
        const messageRejectedError = caught;
        return messageRejectedError;
      }
      throw caught;
    }
  };
  
  // snippet-end:[ses.JavaScript.email.sendEmailV3]
  module.exports =  { run };