import emailAdapter from "../adapters/email-adapter";
import { Result } from "../common/types/types";

const mailManager = {
  sendRegistrationMail: async ({
    email,
    confirmationCode,
  }: {
    confirmationCode: string;
    email: string;
  }): Promise<Result<string | null>> => {
    const result: Result<string | null> = await emailAdapter.sendEmail({
      userEmail: email,
      subject: "Blogs&Posts platform",
      message: `<h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:
                  <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
                </p>
                <p>Or use the link below:
                  <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>https://somesite.com/confirm-email?code=${confirmationCode}</a>
                </p>`,
    });

    return result;
  },
};

export default mailManager;
