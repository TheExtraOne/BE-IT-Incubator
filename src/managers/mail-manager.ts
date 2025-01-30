import emailService from "../adapters/email-service";
import { Result } from "../common/types/types";

const mailManager = {
  sendRegistrationMail: async ({
    email,
    confirmationCode,
  }: {
    confirmationCode: string;
    email: string;
  }): Promise<Result<string | null>> =>
    emailService.sendEmail({
      userEmail: email,
      subject: "Blogs&Posts platform",
      message: `<h1>Thank for your registration</h1>
                    <p>To finish registration please follow the link below:
                      <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
                    </p>
                    <p>Or use the link below:
                      <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>https://somesite.com/confirm-email?code=${confirmationCode}</a>
                    </p>`,
    }),

  sendPasswordRecoveryMail: async ({
    email,
    confirmationCode,
  }: {
    confirmationCode: string;
    email: string;
  }): Promise<Result<string | null>> =>
    emailService.sendEmail({
      userEmail: email,
      subject: "Blogs&Posts platform",
      message: `<h1>Password recovery</h1>
                    <p>To recover your password please follow the link below:
                       <a href='https://somesite.com/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a>
                    </p>
                    <p>Or use the link below:
                      <a href='https://somesite.com/password-recovery?recoveryCode=${confirmationCode}'>https://somesite.com/password-recovery?recoveryCode=${confirmationCode}</a>
                    </p>`,
    }),
};

export default mailManager;
