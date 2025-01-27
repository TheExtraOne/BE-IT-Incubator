import bcrypt from "bcryptjs";

const bcryptService = {
  generateHash: async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  checkPassword: async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
  },
};

export default bcryptService;
