import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { mapUserProfile } from '../lib/mappers.js';
import { signToken, requireAuth, requireAdmin } from '../middleware/auth.js';
import { generateSecurePassword, sendCredentialsEmail, sendSubscriptionConfirmationEmail, sendOtpEmail } from '../lib/emailService.js';

const router = Router();

// In-memory store for OTPs (email -> { otp, expiresAt })
const passwordResetStore = new Map<string, { otp: string; expiresAt: number }>();

// Dev-only helper: return OTP for testing (only available when not in production)
router.get('/debug/otp', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).end();
  const { email } = req.query as { email?: string };
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const record = passwordResetStore.get(email.toLowerCase());
  if (!record) return res.status(404).json({ error: 'No OTP for this email' });
  return res.json({ email: email.toLowerCase(), otp: record.otp, expiresAt: record.expiresAt });
});

async function loadUser(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: {
        include: {
          analytics: true,
          learningStreak: true,
        },
      },
      teacherProfile: true,
      adminProfile: true,
    },
  });
}

// Check if email already exists
router.get('/check-email', async (req, res) => {
  const { email } = req.query as { email?: string };
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  return res.json({ exists: !!existing });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (password) {
    const charCodes = Array.from(password).map(c => c.charCodeAt(0)).join(', ');
    console.log(`[server] Login attempt: email="${email}", passwordLength=${password.length}, charCodes=[${charCodes}]`);
  } else {
    console.log(`[server] Login attempt: email="${email}", password=undefined`);
  }
  if (!email || !password) {
    console.warn(`[server] Login failed: Missing email or password in request body`);
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await loadUser(email.toLowerCase());
  if (!user) {
    console.warn(`[server] Login failed: User not found in database for email="${email}"`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    console.warn(`[server] Login failed: Password mismatch for email="${email}"`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ userId: user.id, role: user.role });
  const profile = mapUserProfile({
    ...user,
    studentProfile: user.studentProfile,
  });

  return res.json({
    token,
    user: profile,
    role: user.role.toLowerCase(),
  });
});

router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName, role, boardId, classId, location } = req.body as {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    boardId?: string;
    classId?: string;
    location?: string;
  };

  if (!email || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Generate a secure random password
    const generatedPassword = generateSecurePassword();
    const passwordHash = await bcrypt.hash(generatedPassword, 10);
    const userRole = role.toUpperCase() as 'STUDENT' | 'TEACHER' | 'ADMIN';

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        location,
        role: userRole,
        ...(userRole === 'STUDENT' && boardId && classId
          ? {
              studentProfile: {
                create: {
                  boardId,
                  classId,
                  analytics: { create: { xp: 100 } },
                  learningStreak: { create: { currentStreak: 1, longestStreak: 1 } },
                },
              },
            }
          : {}),
        ...(userRole === 'TEACHER'
          ? {
              teacherProfile: {
                create: {
                  bio: 'Nexora Learning instructor',
                  qualification: 'Subject expert',
                },
              },
            }
          : {}),
        ...(userRole === 'ADMIN'
          ? {
              adminProfile: {
                create: { dept: 'Operations' },
              },
            }
          : {}),
      },
      include: {
        studentProfile: {
          include: {
            analytics: true,
            learningStreak: true,
          },
        },
      },
    });

    // Only send credentials email for non-student roles initially
    if (userRole !== 'STUDENT') {
      await sendCredentialsEmail(email.toLowerCase(), firstName, lastName, generatedPassword, userRole);
    }

    // Return only success message, NO password in response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      email: email.toLowerCase(),
      role: userRole.toLowerCase(),
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create account' });
  }
});

/**
 * Subscription confirmation endpoint
 * Called when user clicks "Subscribe" button on subscription page
 * Sends credentials email and redirects to login
 */
router.post('/subscribe', async (req, res) => {
  const { email, subscriptionPlan } = req.body as {
    email?: string;
    subscriptionPlan?: string;
  };

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { studentProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'STUDENT' && user.studentProfile) {
      const studentId = user.studentProfile.id;

      // Find or create default plan
      let plan = await prisma.subscriptionPlan.findFirst({
        where: { isActive: true }
      });
      if (!plan) {
        plan = await prisma.subscriptionPlan.create({
          data: {
            name: 'EduVerse Premium Monthly',
            description: 'Full access to high-end live classes, premium analytics, personalized feedback, and complete syllabus.',
            price: 30000.00,
            durationDays: 30,
            billingPeriod: 'MONTHLY',
            isActive: true,
          }
        });
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      // Check if they already have a subscription
      const existingSub = await prisma.subscription.findFirst({
        where: { studentId },
        orderBy: { createdAt: 'desc' }
      });

      let sub;
      if (existingSub) {
        sub = await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            status: 'PENDING',
            planId: plan.id,
            updatedAt: new Date()
          }
        });
      } else {
        sub = await prisma.subscription.create({
          data: {
            studentId,
            planId: plan.id,
            status: 'PENDING',
            startDate,
            endDate,
            nextBillingDate: endDate
          }
        });
      }

      // Check payment
      const existingPayment = await prisma.payment.findFirst({
        where: { subscriptionId: sub.id }
      });

      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: 'PENDING',
            amount: 30000.00
          }
        });
      } else {
        await prisma.payment.create({
          data: {
            subscriptionId: sub.id,
            amount: 30000.00,
            currency: 'INR',
            status: 'PENDING',
            gateway: 'RAZORPAY',
            transactionId: 'pay_' + Math.random().toString(36).substring(2, 16)
          }
        });
      }
    }

    return res.json({
      success: true,
      message: 'Subscription request registered successfully. Awaiting administrator activation.',
      redirectTo: '/#/login-student'
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: error.message || 'Subscription failed' });
  }
});

// User Management CRUD for Admin Configurable Users
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        studentProfile: {
          include: {
            class: true,
            board: true,
            subscriptions: {
              include: {
                payments: true
              },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        },
        teacherProfile: true,
        adminProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/users', requireAuth, requireAdmin, async (req, res) => {
  const { email, password, firstName, lastName, role, boardId, classId, dept, bio, qualification } = req.body;
  
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role.toUpperCase() as 'STUDENT' | 'TEACHER' | 'ADMIN';

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: userRole,
        ...(userRole === 'STUDENT' && boardId && classId
          ? {
              studentProfile: {
                create: {
                  boardId,
                  classId,
                  analytics: { create: { xp: 100 } },
                  learningStreak: { create: { currentStreak: 1, longestStreak: 1 } },
                },
              },
            }
          : {}),
        ...(userRole === 'TEACHER'
          ? {
              teacherProfile: {
                create: {
                  bio: bio || 'EduVerse instructor',
                  qualification: qualification || 'Subject expert',
                },
              },
            }
          : {}),
        ...(userRole === 'ADMIN'
          ? {
              adminProfile: {
                create: { dept: dept || 'Operations' },
              },
            }
          : {}),
      },
    });

    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { email, password, firstName, lastName, role, boardId, classId, dept, bio, qualification } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const data: any = {};
    if (email) data.email = email.toLowerCase();
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (role) data.role = role.toUpperCase();
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const userRole = (role || user.role).toUpperCase();
    
    if (userRole === 'STUDENT') {
      data.studentProfile = {
        upsert: {
          create: {
            boardId: boardId || '',
            classId: classId || '',
          },
          update: {
            boardId: boardId,
            classId: classId,
          }
        }
      };
    } else if (userRole === 'TEACHER') {
      data.teacherProfile = {
        upsert: {
          create: {
            bio: bio || '',
            qualification: qualification || '',
          },
          update: {
            bio,
            qualification,
          }
        }
      };
    } else if (userRole === 'ADMIN') {
      data.adminProfile = {
        upsert: {
          create: {
            dept: dept || 'Operations',
          },
          update: {
            dept,
          }
        }
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return res.json(updatedUser);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/users/:id/activate', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, password } = req.body as {
    paymentStatus?: 'SUCCESS' | 'PENDING';
    password?: string;
  };

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the password entered by admin
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Update the password in database
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Update or create subscription status to ACTIVE and payment to SUCCESS
    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { id: user.id },
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (student) {
        let latestSub = student.subscriptions[0];
        if (!latestSub) {
          // If no subscription exists, find or create default plan
          let plan = await prisma.subscriptionPlan.findFirst({
            where: { isActive: true }
          });
          if (!plan) {
            plan = await prisma.subscriptionPlan.create({
              data: {
                name: 'EduVerse Premium Monthly',
                description: 'Full access to high-end live classes, premium analytics, personalized feedback, and complete syllabus.',
                price: 30000.00,
                durationDays: 30,
                billingPeriod: 'MONTHLY',
                isActive: true,
              }
            });
          }
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(startDate.getDate() + 30);

          latestSub = await prisma.subscription.create({
            data: {
              studentId: student.id,
              planId: plan.id,
              status: 'ACTIVE',
              startDate: startDate,
              endDate: endDate,
              nextBillingDate: endDate,
            }
          });
        } else {
          // Update existing subscription to ACTIVE
          latestSub = await prisma.subscription.update({
            where: { id: latestSub.id },
            data: { status: 'ACTIVE' }
          });
        }

        // Upsert payment associated with this subscription
        const payment = await prisma.payment.findFirst({
          where: { subscriptionId: latestSub.id }
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: paymentStatus || 'SUCCESS',
              paidAt: paymentStatus === 'SUCCESS' ? new Date() : null,
            }
          });
        } else {
          await prisma.payment.create({
            data: {
              subscriptionId: latestSub.id,
              amount: 30000.00,
              currency: 'INR',
              status: paymentStatus || 'SUCCESS',
              gateway: 'RAZORPAY',
              transactionId: 'pay_' + Math.random().toString(36).substring(2, 16),
              paidAt: paymentStatus === 'SUCCESS' ? new Date() : null,
            }
          });
        }
      }
    }

    // Now send the credentials email to student!
    await sendSubscriptionConfirmationEmail(
      user.email,
      user.firstName,
      user.lastName,
      password,
      user.role,
      'Full Academic Access Pass'
    );

    return res.json({ success: true, message: 'Account activated and email sent successfully.' });
  } catch (error: any) {
    console.error('Activation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to activate user' });
  }
});

router.get('/admin-analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const activeSubscriptionsCount = await prisma.subscription.count({
      where: { status: 'ACTIVE' }
    });

    // Compute monthly active subscriptions for the current year
    const monthlyCounts = Array(12).fill(0);
    const activeSubs = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { createdAt: true }
    });
    for (const sub of activeSubs) {
      const month = new Date(sub.createdAt).getMonth();
      monthlyCounts[month]++;
    }

    // Compute regional distribution from Student User's location field
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { location: true }
    });

    const stateCounts: { [state: string]: number } = {};
    let totalCount = 0;
    for (const u of users) {
      if (u.location) {
        const state = u.location.trim();
        stateCounts[state] = (stateCounts[state] || 0) + 1;
        totalCount++;
      }
    }

    const regionalDistribution = Object.entries(stateCounts).map(([state, count]) => {
      const percentage = totalCount > 0 ? parseFloat(((count / totalCount) * 100).toFixed(1)) : 0;
      return { state, count, percentage: percentage + "%", students: count.toString() };
    }).sort((a, b) => b.count - a.count);

    return res.json({
      activeSubscriptionsCount,
      monthlyActiveSubscriptions: monthlyCounts,
      regionalDistribution
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (_req, res) => {
  res.json({ success: true });
});

export default router;

// Forgot password: send OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    passwordResetStore.set(email.toLowerCase(), { otp, expiresAt });

    const sent = await sendOtpEmail(email.toLowerCase(), otp);
    if (!sent) return res.status(500).json({ error: 'Failed to send OTP' });

    return res.json({ success: true, message: 'OTP sent to email' });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process request' });
  }
});

// Reset password: verify OTP and set new password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body as { email?: string; otp?: string; newPassword?: string };
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const record = passwordResetStore.get(email.toLowerCase());
    if (!record) return res.status(400).json({ error: 'No OTP requested for this email' });
    if (record.expiresAt < Date.now()) {
      passwordResetStore.delete(email.toLowerCase());
      return res.status(400).json({ error: 'OTP expired' });
    }
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    passwordResetStore.delete(email.toLowerCase());
    return res.json({ success: true, message: 'Password reset successful' });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: err.message || 'Failed to reset password' });
  }
});

