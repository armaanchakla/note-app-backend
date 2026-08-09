import { Schema, model, Types, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { Role } from "../types/roles";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  interests: string[];
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {
  isEmailTaken(email: string, excludeId?: Types.ObjectId): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.index({ createdAt: -1 });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Compare candidate password securely with the stored hash.
userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeId?: Types.ObjectId
): Promise<boolean> {
  const query: Record<string, unknown> = { email };
  if (excludeId) query._id = { $ne: excludeId };
  const user = await this.findOne(query).select("_id").lean();
  return !!user;
};

export const User = model<IUserDocument, IUserModel>("User", userSchema);
