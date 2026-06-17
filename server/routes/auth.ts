import { Router } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma.js';
import { mapUserProfile } from '../lib/mappers.js';
import { signToken, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

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
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await loadUser(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
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
  const { email, password, firstName, lastName, role, boardId, classId } = req.body as {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    boardId?: string;
    classId?: string;
  };

  // Generate a random 8-character password for the registration
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let signupPassword = '';
  for (let i = 0; i < 8; i++) {
    signupPassword += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  if (!email || !signupPassword || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(signupPassword, 10);
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
                bio: 'EduVerse instructor',
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

  // Send credentials to Gmail via SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: 'nexoralmslearning@gmail.com',
        pass: 'zrgiibdlrvsahxwn', // Gmail App password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const activationUrl = `http://localhost:5173/#/get-credentials?email=${encodeURIComponent(email.toLowerCase())}&password=${encodeURIComponent(signupPassword)}&role=${encodeURIComponent(userRole)}`;
    const mailOptions = {
      from: '"Nexora Learning" <nexoralmslearning@gmail.com>',
      to: email.toLowerCase(),
      subject: 'Activate Your Nexora Learning Portal Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; text-align: center; margin-bottom: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Nexora Learning Academy</h2>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello ${firstName} ${lastName},</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">Welcome! Your scholar account has been successfully registered.</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">To retrieve your login email and temporary password, please activate your portal subscription. Click the button below to proceed to the secure activation page:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${activationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 0px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Activate Portal & Get Credentials</a>
          </div>
          
          <p style="font-size: 13px; color: #64748b; line-height: 1.6;">Note: For safety and privacy, portal credentials can only be accessed through an active subscription portal. Do not share your activation link with anyone.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
            This is an automated notification from Nexora Learning. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ SMTP credentials email sent successfully to ${email}`);
  } catch (emailErr) {
    console.error('❌ Failed to send credentials email via SMTP:', emailErr);
  }

  const token = signToken({ userId: user.id, role: user.role });
  const profile = mapUserProfile({
    ...user,
    studentProfile: user.studentProfile,
  });

  return res.status(201).json({ 
    token, 
    user: profile, 
    role: user.role.toLowerCase(),
    generatedPassword: signupPassword 
  });
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

router.post('/logout', (_req, res) => {
  res.json({ success: true });
});

export default router;

