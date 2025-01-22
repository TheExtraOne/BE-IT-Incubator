import { RESULT_STATUS, SETTINGS } from "../common/settings";
import nodemailer from "nodemailer";
import { Result } from "../common/types/types";

const emailAdapter = {
  sendEmail: async ({
    userEmail,
    subject,
    message,
  }: {
    userEmail: string;
    subject: string;
    message: string;
  }): Promise<Result<string | null>> => {
    try {
      const transporter = nodemailer.createTransport({
        service: "Mail.ru",
        auth: {
          user: "kate_blogs_posts_it_incubator@mail.ru",
          pass: SETTINGS.MAIL_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: "Ekaterina <kate_blogs_posts_it_incubator@mail.ru>",
        to: userEmail,
        subject,
        html: message,
      });

      return {
        status: RESULT_STATUS.SUCCESS,
        data: info.messageId,
        extensions: [],
      };
    } catch (e) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: `${e}`,
        extensions: [{ field: "email", message: `Something went wrong: ${e}` }],
      };
    }
  },
};

export default emailAdapter;
