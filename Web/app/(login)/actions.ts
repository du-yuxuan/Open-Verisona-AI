'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  activityLogs,
  type NewUser,
  type NewActivityLog,
  ActivityType,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import { onUserRegistered } from '@/lib/hooks/notification-hooks';

async function logActivity(
  userId: number,
  type: ActivityType,
  ipAddress?: string,
  metadata?: string
) {
  const newActivity: NewActivityLog = {
    userId,
    action: type,
    ipAddress: ipAddress || '',
    metadata: metadata || null
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const foundUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (foundUser.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const user = foundUser[0];

  const isPasswordValid = await comparePasswords(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    setSession(user),
    logActivity(user.id, ActivityType.SIGN_IN)
  ]);

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    name: null
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    logActivity(createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser)
  ]);

  redirect('/');
});

const enhancedSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  graduationYear: z.string().optional().transform(val => val ? parseInt(val) : null),
  schoolName: z.string().optional(),
});

export const enhancedSignUp = validatedAction(enhancedSignUpSchema, async (data, formData) => {
  const { email, password, firstName, lastName, graduationYear, schoolName } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'An account with this email already exists. Please sign in instead.',
      email,
      password
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    graduationYear,
    schoolName: schoolName || null,
    profileCompleted: false,
    equityEligible: false,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create your account. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    logActivity(createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser),
    onUserRegistered(createdUser.id)
  ]);

  redirect('/dashboard');
});

const passwordResetSchema = z.object({
  email: z.string().email(),
});

export const requestPasswordReset = validatedAction(passwordResetSchema, async (data, formData) => {
  const { email } = data;

  const foundUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always return success to prevent email enumeration attacks
  // but only send email if user exists
  if (foundUser.length > 0) {
    const user = foundUser[0];
    
    // In a real application, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with expiration
    // 3. Send email with reset link
    // 4. Log the activity
    
    await logActivity(user.id, ActivityType.UPDATE_PASSWORD, undefined, 'Password reset requested');
    
    // For now, we'll just simulate success
    console.log(`Password reset requested for: ${email}`);
  }

  return {
    success: true,
    message: 'If an account with that email exists, we\'ve sent a password reset link.'
  };
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  graduationYear: z.string().optional().transform(val => val ? parseInt(val) : null),
  schoolName: z.string().optional(),
  intendedMajor: z.string().optional(),
  collegePreferences: z.string().optional(),
  careerGoals: z.string().optional(),
  equityEligible: z.string().optional().transform(val => val === 'on'),
});

export const updateProfile = validatedActionWithUser(
  updateProfileSchema,
  async (data, _, user) => {
    const { 
      firstName, 
      lastName, 
      graduationYear, 
      schoolName, 
      intendedMajor, 
      collegePreferences, 
      careerGoals, 
      equityEligible 
    } = data;

    // Prepare preferences object
    const preferences: any = {
      intendedMajor: intendedMajor || null,
      collegePreferences: collegePreferences || null,
      careerGoals: careerGoals || null,
    };

    try {
      await db
        .update(users)
        .set({
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          graduationYear,
          schoolName: schoolName || null,
          preferences,
          equityEligible: equityEligible || false,
          profileCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      await logActivity(user.id, ActivityType.UPDATE_PROFILE);

      return {
        success: true,
        message: 'Profile updated successfully!'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        error: 'Failed to update profile. Please try again.'
      };
    }
  }
);

export async function signOut() {
  const user = (await getUser()) as User;
  await logActivity(user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Please try again.'
      };
    }

    await Promise.all([
      db
        .update(users)
        .set({ deletedAt: new Date() })
        .where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.DELETE_ACCOUNT)
    ]);

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().min(3).max(255)
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== user.id) {
      return {
        name,
        email,
        error: 'Email is already in use.'
      };
    }

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return {
      success: 'Account updated successfully.'
    };
  }
);