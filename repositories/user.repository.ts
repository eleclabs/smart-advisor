import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export class UserRepository {
    
  static async findByEmail(email: string) {
    await connectDB();

    return User.findOne({
      email
    });
  }

  static async create(data: Record<string, unknown>) {
    await connectDB();

    return User.create(data);
  }

  static async findAll() {
    await connectDB();

    return User.find();
  }

  static async setPasswordResetToken(
    email: string,
    passwordResetToken: string,
    passwordResetExpires: Date
  ) {
    await connectDB();

    return User.updateOne(
      {
        email
      },
      {
        passwordResetToken,
        passwordResetExpires
      }
    );
  }

}
