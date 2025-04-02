const cron = require("node-cron");
const connectionRequest = require("../models/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("./sendEmail");

cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 0);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await connectionRequest
      .find({
        status: "interested",
        createdAt: {
          $gte: yesterdayStart,
          $lt: yesterdayEnd,
        },
      })
      .populate("fromUserId toUserId");

    // Create a Set to track emails already processed
    const sentEmails = new Set();

    for (const req of pendingRequests) {
      try {
        const recipientEmail = req.toUserId.emailId;
        const recipientName = req.toUserId.firstName;

        // Check if we already sent an email to this user
        if (sentEmails.has(recipientEmail)) continue;

        await sendEmail.run(
            `Action Required: Review Your Pending Connection Requests`,
            `Hello ${recipientName},<br></br>
             You have new pending connection requests. 
             Please review them.<br></br>Thanks!`
        );

        // Mark this email as processed
        sentEmails.add(recipientEmail);
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
});
