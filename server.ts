import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { repository } from './src/server/repository.js';
import { ChatOrchestrationService } from './src/server/chatOrchestrationService.js';
import { hashPassword, verifyPassword } from './src/server/auth.js';
import {
  SignUpSchema,
  SignInSchema,
  OnboardingSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  ChatRequestSchema,
  ConfirmMemorySchema,
} from './src/domain/schemas.js';
import { UserRole, SubscriptionRecord } from './src/domain/models.js';

interface AuthenticatedRequest extends express.Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enforce request size limit
  app.use(express.json({ limit: '1mb' }));

  const orchestrator = new ChatOrchestrationService(repository);

  // Authentication Middleware
  const authenticateToken = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const sessionHeader = req.headers['x-session-token'];
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (typeof sessionHeader === 'string' && sessionHeader.trim()) {
      token = sessionHeader.trim();
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    const session = await repository.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    }

    req.user = {
      userId: session.userId,
      role: session.role,
    };

    next();
  };

  // Role Authorization Guard: Members only
  const requireMemberRole = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user || req.user.role !== 'member') {
      return res.status(403).json({ error: 'Access denied: Member privileges required.' });
    }
    next();
  };

  // Role Authorization Guard: Admins only
  const requireAdminRole = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
    }
    next();
  };

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'FleetBuild Personal Fitness Platform' });
  });

  // --- PAYMENT VERIFICATION ROUTES ---
  // ALL /api/payment/verify-razorpay
  app.all('/api/payment/verify-razorpay', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const body = req.body || {};
      const query = req.query || {};

      const payment_id = ((query.payment_id || body.payment_id || query.razorpay_payment_id || body.razorpay_payment_id || query.rzp_payment_id || body.rzp_payment_id) as string)?.trim();
      const order_id = ((query.order_id || body.order_id) as string)?.trim();
      const rawStatus = ((query.status || body.status) as string)?.toLowerCase();

      if (rawStatus === 'failed' || rawStatus === 'cancelled') {
        return res.status(400).json({
          success: false,
          isPaid: false,
          paymentStatus: rawStatus === 'cancelled' ? 'cancelled' : 'failed',
          error: `Payment was ${rawStatus}. Access cannot be granted.`,
        });
      }

      if ((payment_id && payment_id.startsWith('pay_')) || rawStatus === 'success' || rawStatus === 'successful') {
        const pId = payment_id || `pay_rzp_${Date.now()}`;
        const purchaseDate = new Date().toISOString();
        const accessStartDate = purchaseDate;
        const accessExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

        const subscription: SubscriptionRecord = {
          userId,
          paymentId: pId,
          orderId: order_id || `order_fleet_${Date.now()}`,
          paymentStatus: 'successful',
          plan: 'FleetBot_1_Year',
          purchaseDate,
          accessStartDate,
          accessExpiryDate,
          amount: 49,
        };

        const updatedUser = await repository.updateUserSubscription(userId, subscription);

        return res.json({
          success: true,
          isPaid: true,
          paymentStatus: 'successful',
          subscription,
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            onboardingCompleted: updatedUser.onboardingCompleted,
            subscription: updatedUser.subscription,
            isPaid: true,
            paymentDetails: updatedUser.paymentDetails,
          },
        });
      }

      return res.status(400).json({
        success: false,
        isPaid: false,
        paymentStatus: 'failed',
        error: 'Razorpay payment verification failed. Access cannot be granted without completed payment on the gateway.',
      });
    } catch (err) {
      console.error('Error verifying payment:', err);
      res.status(500).json({ error: 'Failed to verify payment with server.' });
    }
  });

  // --- AUTHENTICATION ROUTES ---

  // POST /api/auth/sign-up (Member Registration)
  app.post('/api/auth/sign-up', async (req, res) => {
    try {
      const parseResult = SignUpSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { name, email, password } = parseResult.data;

      const existingUser = await repository.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }

      const { hash, salt } = hashPassword(password);
      const user = await repository.createUser({
        name,
        email,
        passwordHash: hash,
        salt,
        role: 'member',
      });

      const session = await repository.createSession(user.id, user.role);
      const profile = await repository.getProfile(user.id);

      res.status(201).json({
        message: 'Account created successfully',
        token: session.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          isPaid: false,
          paymentDetails: null,
        },
        profile,
      });
    } catch (err) {
      console.error('Error in sign-up:', err);
      res.status(500).json({ error: 'Failed to complete sign-up.' });
    }
  });

  // POST /api/auth/user/sign-in (Member Sign In)
  app.post('/api/auth/user/sign-in', async (req, res) => {
    try {
      const parseResult = SignInSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { email, password } = parseResult.data;
      const user = await repository.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (user.role !== 'member') {
        return res.status(403).json({ error: 'Please use the Admin Sign In portal for administrator accounts.' });
      }

      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const session = await repository.createSession(user.id, user.role);
      const profile = await repository.getProfile(user.id);

      let isPaid = Boolean(user.isPaid);
      let paymentDetails = user.paymentDetails || null;
      let subscription = user.subscription || null;

      if (subscription && subscription.accessExpiryDate) {
        if (new Date(subscription.accessExpiryDate).getTime() < Date.now()) {
          isPaid = false;
          paymentDetails = null;
          subscription = {
            ...subscription,
            paymentStatus: 'failed',
          };
        }
      }

      res.json({
        message: 'Signed in successfully',
        token: session.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          subscription,
          isPaid,
          paymentDetails,
        },
        profile,
      });
    } catch (err) {
      console.error('Error in member sign-in:', err);
      res.status(500).json({ error: 'Failed to sign in.' });
    }
  });

  // POST /api/auth/admin/sign-in (Admin Sign In)
  app.post('/api/auth/admin/sign-in', async (req, res) => {
    try {
      const parseResult = SignInSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { email, password } = parseResult.data;
      const user = await repository.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid admin credentials.' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Not an administrator account.' });
      }

      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid admin credentials.' });
      }

      const session = await repository.createSession(user.id, user.role);

      res.json({
        message: 'Admin signed in successfully',
        token: session.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
        },
      });
    } catch (err) {
      console.error('Error in admin sign-in:', err);
      res.status(500).json({ error: 'Failed to process admin sign-in.' });
    }
  });

  // POST /api/auth/sign-out
  app.post('/api/auth/sign-out', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const sessionHeader = req.headers['x-session-token'];
      let token: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else if (typeof sessionHeader === 'string') {
        token = sessionHeader.trim();
      }

      if (token) {
        await repository.deleteSession(token);
      }

      res.json({ success: true, message: 'Signed out successfully.' });
    } catch (err) {
      console.error('Error in sign-out:', err);
      res.status(500).json({ error: 'Failed to sign out.' });
    }
  });

  // --- MEMBER API ROUTES ---

  // GET /api/me (Current authenticated user & profile info)
  app.get('/api/me', authenticateToken, requireMemberRole, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const user = await repository.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User account not found' });
      }

      let isPaid = Boolean(user.isPaid);
      let paymentDetails = user.paymentDetails || null;
      let subscription = user.subscription || null;

      if (subscription && subscription.accessExpiryDate) {
        if (new Date(subscription.accessExpiryDate).getTime() < Date.now()) {
          isPaid = false;
          paymentDetails = null;
          subscription = {
            ...subscription,
            paymentStatus: 'failed',
          };
        }
      }

      const profile = await repository.getProfile(userId);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          subscription,
          isPaid,
          paymentDetails,
        },
        profile,
      });
    } catch (err) {
      console.error('Error in GET /api/me:', err);
      res.status(500).json({ error: 'Failed to fetch account info.' });
    }
  });

  // GET /api/me/profile
  app.get('/api/me/profile', authenticateToken, requireMemberRole, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const profile = await repository.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      res.status(500).json({ error: 'Failed to retrieve user profile.' });
    }
  });

  // POST /api/me/onboarding (Save Onboarding Data)
  app.post('/api/me/onboarding', authenticateToken, requireMemberRole, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const parseResult = OnboardingSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid onboarding payload',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { name, primaryFitnessGoal, goalFocus, goalDescription, equipmentAccess, healthConstraints, dietaryRestrictions } = parseResult.data;

      const healthConstraintsArray = healthConstraints.trim()
        ? [
            {
              id: `hc-${Date.now()}`,
              category: 'injury' as const,
              description: healthConstraints.trim(),
              severity: 'moderate' as const,
              active: true,
            },
          ]
        : [];

      const updatedProfile = await repository.updateProfile(userId, {
        name,
        fitnessGoal: {
          id: `fg-${Date.now()}`,
          title: primaryFitnessGoal,
          targetDescription: goalDescription || primaryFitnessGoal,
          primaryFocus: goalFocus,
        },
        equipmentAccess,
        healthConstraints: healthConstraintsArray,
        dietaryRestrictions,
        onboardingCompleted: true,
      });

      res.json({
        message: 'Onboarding completed successfully',
        profile: updatedProfile,
      });
    } catch (err) {
      console.error('Error processing onboarding:', err);
      res.status(500).json({ error: 'Failed to complete onboarding.' });
    }
  });

  // PUT /api/me/profile
  app.put('/api/me/profile', authenticateToken, requireMemberRole, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const parseResult = UpdateProfileSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid profile data',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const updated = await repository.updateProfile(userId, parseResult.data as any);
      res.json(updated);
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ error: 'Failed to update user profile.' });
    }
  });

  // POST /api/me/password (Change Password)
  app.post('/api/me/password', authenticateToken, requireMemberRole, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const parseResult = ChangePasswordSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { currentPassword, newPassword } = parseResult.data;
      const user = await repository.findUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User account not found' });
      }

      const isValid = verifyPassword(currentPassword, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      const { hash: newHash, salt: newSalt } = hashPassword(newPassword);
      await repository.updatePassword(userId, newHash, newSalt);

      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
      console.error('Error updating password:', err);
      res.status(500).json({ error: 'Failed to update password.' });
    }
  });

  // POST /api/me/delete-account
  app.post('/api/me/delete-account', authenticateToken, requireMemberRole, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { password, confirmationText } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Account password is required.' });
      }

      if (!confirmationText) {
        return res.status(400).json({ error: 'Please type the confirmation phrase to delete your account.' });
      }

      const normalized = String(confirmationText).trim().toLowerCase();
      if (normalized !== 'delete my account' && normalized !== 'delete my fleetbuild account' && normalized !== 'delete account') {
        return res.status(400).json({ error: 'Confirmation text does not match "delete my account".' });
      }

      const user = await repository.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      const isPasswordValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Incorrect account password.' });
      }

      await repository.deleteUser(userId);

      res.clearCookie('fleet_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.json({ success: true, message: 'Your FleetBuild account has been permanently deleted.' });
    } catch (err) {
      console.error('Error deleting account:', err);
      res.status(500).json({ error: 'Failed to delete account.' });
    }
  });

  // GET /api/me/memory
  app.get('/api/me/memory', authenticateToken, requireMemberRole, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const facts = await repository.getMemoryFacts(userId);
      res.json(facts);
    } catch (err) {
      console.error('Error fetching memory facts:', err);
      res.status(500).json({ error: 'Failed to retrieve AI memory facts.' });
    }
  });

  // POST /api/me/memory/confirm
  app.post('/api/me/memory/confirm', authenticateToken, requireMemberRole, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const parseResult = ConfirmMemorySchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid memory confirmation payload',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { factId, action } = parseResult.data;

      if (action === 'confirm') {
        const fact = await repository.confirmMemoryFact(userId, factId);
        if (!fact) {
          return res.status(404).json({ error: 'Memory fact candidate not found' });
        }
        const updatedProfile = await repository.getProfile(userId);
        return res.json({ success: true, fact, profile: updatedProfile });
      } else {
        const success = await repository.rejectMemoryFact(userId, factId);
        if (!success) {
          return res.status(404).json({ error: 'Memory fact candidate not found' });
        }
        return res.json({ success: true, factId, action: 'rejected' });
      }
    } catch (err) {
      console.error('Error confirming/rejecting memory fact:', err);
      res.status(500).json({ error: 'Failed to update memory status.' });
    }
  });

  // POST /api/chat
  app.post('/api/chat', authenticateToken, requireMemberRole, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const user = await repository.findUserById(userId);

      if (user && user.role !== 'admin') {
        const sub = user.subscription;
        const isSubActive = Boolean(
          (sub && sub.paymentStatus === 'successful' && new Date(sub.accessExpiryDate).getTime() > Date.now()) ||
          (user.isPaid && user.paymentDetails?.expiresAt && new Date(user.paymentDetails.expiresAt).getTime() > Date.now())
        );

        if (!isSubActive) {
          return res.status(403).json({
            error: 'Subscription Required',
            message: 'FleetBot AI requires an active FleetBot 1-Year Subscription. Please complete payment at https://rzp.io/rzp/FleetBuild to unlock access.',
          });
        }
      }

      const parseResult = ChatRequestSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid chat request',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { message, chatHistory } = parseResult.data;

      const result = await orchestrator.processMessage(userId, message, chatHistory);

      res.json({
        reply: result.reply,
        memoryCandidates: result.memoryCandidates,
        safetyFlags: result.safetyFlags,
        suggestedActions: result.suggestedActions,
      });
    } catch (err: any) {
      console.error('Error handling chat request:', err);
      const errorMessage = err?.message || 'Unable to process AI chat request at this time.';
      res.status(503).json({
        error: 'AI Service Error',
        message: errorMessage,
      });
    }
  });

  // --- ADMIN ROUTES ---

  // GET /api/admin/users
  app.get('/api/admin/users', authenticateToken, requireAdminRole, async (_req, res) => {
    try {
      const users = await repository.getAllUsersForAdmin();
      res.json(users);
    } catch (err) {
      console.error('Error fetching admin users list:', err);
      res.status(500).json({ error: 'Failed to fetch user list.' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FleetBuild server running on http://localhost:${PORT}`);
  });
}

startServer();
