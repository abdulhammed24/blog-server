import asyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import Filter from "bad-words";
import EmailMessaging from "../../model/EmailMessaging/EmailMessaging.js";

// send or create email message
export const sendEmailMsg = asyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;
  //get the message
  const emailMessage = subject + " " + message;
  // //prevent profanity/bad words
  const filter = new Filter();

  const isProfane = filter.isProfane(emailMessage);
  if (isProfane)
    throw new Error("Email sent failed, because it contains profane words.");
  try {
    // nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const msg = {
      from: "abdlhamd3@gmail.com", // Sender email
      to, // Receiver email
      subject, // Title email
      text: message, // Text in email
    };

    //send message
    await transporter.sendMail(msg);

    //save to our db
    await EmailMessaging.create({
      sentBy: req?.user?._id,
      from: req?.user?.email,
      to,
      message,
      subject,
    });
    res.json("Mail sent");
  } catch (error) {
    res.json(error);
  }
});
