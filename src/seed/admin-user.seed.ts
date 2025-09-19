import { connect, disconnect, Mongoose } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();
import { UserRole, UserSchema } from '../../src/modules/auth/auth.model';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/crossword-server';
const defaultMail = process.env.DEFAULT_ADMIN_EMAIL;
const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;

export async function seedAdminUser(): Promise<void> {
  if (!defaultMail || !defaultPassword) return;

  let connection: Mongoose | null = null;
  try {
    connection = await connect(MONGODB_URI);
    const UserModel = connection.model('User', UserSchema);

    const existingAdmin = await UserModel.findOne({ email: defaultMail });
    if (existingAdmin) {
      return;
    }

    const adminUser = new UserModel({
      email: defaultMail,
      password: await bcrypt.hash(defaultPassword, 10),
      roles: [UserRole.ADMIN],
    });
    await adminUser.save();
  } finally {
    if (connection) await disconnect();
  }
}

if (require.main === module) {
  seedAdminUser()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
