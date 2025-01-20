import { RESULT_STATUS } from "../common/settings";
import emailAdapter from "../adapters/email-adapter";
import { Result } from "../common/types/types";

const mailManager = {
  sendRegistrationMail: async ({
    login,
    email,
    password,
  }: {
    login: string;
    email: string;
    password: string;
  }): Promise<Result> => {
    await emailAdapter.sendEmail({
      userEmail: email,
      subject: "Blogs&Posts platform",
      message: "<b>Hello BE world!</b>",
    });

    return {
      status: RESULT_STATUS.SUCCESS,
      extensions: [],
      data: null,
    };
  },
};

export default mailManager;
