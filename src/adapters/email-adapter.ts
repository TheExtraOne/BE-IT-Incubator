import { SETTINGS } from "../common/settings";
import nodemailer from "nodemailer";

const emailAdapter = {
  sendEmail: async ({
    userEmail,
    subject,
    message,
  }: {
    userEmail: string;
    subject: string;
    message: string;
  }) => {
    // Input data is accepted. Email with confirmation code will be send to passed email address.
    // Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere

    const transporter = nodemailer.createTransport({
      service: "Mail.ru",
      auth: {
        user: "katya_mihasewa@mail.ru",
        pass: SETTINGS.MAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: "Ekaterina <katya_mihasewa@mail.ru>",
      to: userEmail,
      subject,
      html: message,
    });
  },
};

export default emailAdapter;
