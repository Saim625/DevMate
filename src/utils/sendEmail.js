const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient");


const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
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
            Data: `<div>${body}</div>`,
          },
          Text: {
            Charset: "UTF-8",
            Data: `Plain Text: ${body}`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `${subject}`,
        },
      },
      Source: fromAddress,
      ReplyToAddresses: [
        "saimsaeed526@gmail.com"
      ],
    });
  };
  
  const run = async (subject, body, toEmailId) => {
    const sendEmailCommand = createSendEmailCommand(
      "saimsaeed526@gmail.com",
      "support@devmate.click",
      subject,
      body
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