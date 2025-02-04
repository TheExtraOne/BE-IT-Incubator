import mongoose from "mongoose";
import UserAccountRepViewModel from "./UserAccountRepViewModel";

const userSchema = new mongoose.Schema<UserAccountRepViewModel>({
  accountData: {
    userName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  emailConfirmation: {
    confirmationCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    isConfirmed: { type: Boolean, required: true },
  },
  passwordResetConfirmation: {
    recoveryCode: { type: String, default: null },
    expirationDate: { type: Date, default: null },
    isConfirmed: { type: Boolean, default: null },
  },
});

export default userSchema;
