import {
  UserAccount,
  UserSession,
  UserProfile,
  MemoryFact,
  ConversationMessage,
  LoggedWorkout,
  LoggedMetric,
  UserRole,
  SubscriptionRecord,
} from '../domain/models.js';
import { hashPassword } from './auth.js';
import fs from 'fs';
import path from 'path';

export interface UserRepository {
  findUserByEmail(email: string): Promise<UserAccount | null>;
  findUserById(userId: string): Promise<UserAccount | null>;
  createUser(data: { name: string; email: string; passwordHash: string; salt: string; role: UserRole }): Promise<UserAccount>;
  createSession(userId: string, role: UserRole): Promise<UserSession>;
  getSession(token: string): Promise<UserSession | null>;
  deleteSession(token: string): Promise<void>;
  
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<UserProfile>;
  updatePassword(userId: string, newPasswordHash: string, newSalt: string): Promise<void>;
  updateUserSubscription(userId: string, subscription: SubscriptionRecord): Promise<UserAccount>;
  updateUserPayment(userId: string, paymentDetails: { paymentId: string; paidAt: string; expiresAt: string; planName: string; amount: number }): Promise<UserAccount>;
  deleteUser(userId: string): Promise<void>;
  
  getMemoryFacts(userId: string): Promise<MemoryFact[]>;
  addMemoryFact(userId: string, factData: Omit<MemoryFact, 'id' | 'timestamp'>): Promise<MemoryFact>;
  confirmMemoryFact(userId: string, factId: string): Promise<MemoryFact | null>;
  rejectMemoryFact(userId: string, factId: string): Promise<boolean>;
  
  getChatHistory(userId: string): Promise<ConversationMessage[]>;
  addChatMessage(userId: string, msg: ConversationMessage): Promise<void>;
  clearChatHistory(userId: string): Promise<void>;
  
  getLoggedWorkouts(userId: string): Promise<LoggedWorkout[]>;
  addLoggedWorkout(userId: string, workout: Omit<LoggedWorkout, 'id' | 'userId'>): Promise<LoggedWorkout>;
  getLoggedMetrics(userId: string): Promise<LoggedMetric[]>;
  addLoggedMetric(userId: string, metric: Omit<LoggedMetric, 'id' | 'userId'>): Promise<LoggedMetric>;
  
  getAllUsersForAdmin(): Promise<Omit<UserAccount, 'passwordHash' | 'salt'>[]>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

interface StoredUserData {
  account: UserAccount;
  profile: UserProfile;
  memoryFacts: MemoryFact[];
  chatHistory: ConversationMessage[];
  loggedWorkouts: LoggedWorkout[];
  loggedMetrics: LoggedMetric[];
}

export class JsonFileUserRepository implements UserRepository {
  private usersMap: Map<string, StoredUserData> = new Map();
  private sessionsMap: Map<string, UserSession> = new Map();

  constructor() {
    this.ensureDataDirectory();
    this.loadFromFiles();
    this.seedAdminAccount();
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromFiles(): void {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        for (const [key, val] of Object.entries(parsed)) {
          this.usersMap.set(key, val as StoredUserData);
        }
      }
    } catch (err) {
      console.warn('Error reading users file:', err);
    }

    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        const parsed: Record<string, UserSession> = JSON.parse(raw);
        for (const [token, session] of Object.entries(parsed)) {
          this.sessionsMap.set(token, session);
        }
      }
    } catch (err) {
      console.warn('Error reading sessions file:', err);
    }
  }

  private saveUsersToFile(): void {
    try {
      this.ensureDataDirectory();
      const obj: Record<string, StoredUserData> = {};
      for (const [key, val] of this.usersMap.entries()) {
        obj[key] = val;
      }
      fs.writeFileSync(USERS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write users data file:', err);
    }
  }

  private saveSessionsToFile(): void {
    try {
      this.ensureDataDirectory();
      const obj: Record<string, UserSession> = {};
      for (const [key, val] of this.sessionsMap.entries()) {
        obj[key] = val;
      }
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write sessions data file:', err);
    }
  }

  private seedAdminAccount(): void {
    let adminExists = false;
    const targetAdminEmail = (process.env.ADMIN_EMAIL || 'satviksinghal07@gmail.com').toLowerCase();
    for (const userData of this.usersMap.values()) {
      if (userData.account.role === 'admin' || userData.account.email.toLowerCase() === targetAdminEmail) {
        adminExists = true;
        break;
      }
    }

    if (!adminExists) {
      const adminEmail = targetAdminEmail;
      const adminId = 'admin-satvik';
      const now = new Date().toISOString();

      let hash: string;
      let salt: string;

      if (process.env.ADMIN_PASSWORD) {
        const hashed = hashPassword(process.env.ADMIN_PASSWORD);
        hash = hashed.hash;
        salt = hashed.salt;
      } else {
        // Pre-computed scryptSync hash & salt for default admin setup
        hash = '8fcfd0d500ac6f0db6d8b9c7821504fefc6dd5097d257080d28b1e8936dfe08a20fd33f9c7c45b88ed7d24ab768df009f74f03427d28ad3f1a1e4e4ae1b10b9c';
        salt = 'd96c6852c387df7e70edf72a66962749';
      }

      const adminAccount: UserAccount = {
        id: adminId,
        name: 'Satvik Singhal',
        email: adminEmail,
        passwordHash: hash,
        salt,
        role: 'admin',
        onboardingCompleted: true,
        createdAt: now,
        updatedAt: now,
      };

      const adminProfile: UserProfile = {
        id: `profile-${adminId}`,
        userId: adminId,
        name: 'Satvik Singhal',
        email: adminEmail,
        onboardingCompleted: true,
        fitnessGoal: {
          id: 'fg-admin',
          title: 'System Management',
          targetDescription: 'FleetBuild Administrator Account',
          primaryFocus: 'general_fitness',
        },
        equipmentAccess: [],
        exercisePreferences: {
          preferredExercises: [],
          excludedExercises: [],
          equipment: [],
        },
        healthConstraints: [],
        dietaryRestrictions: [],
        userConsent: {
          medicalDisclaimerAccepted: true,
          dataStorageConsent: true,
          consentDate: now,
        },
        createdAt: now,
        updatedAt: now,
      };

      this.usersMap.set(adminId, {
        account: adminAccount,
        profile: adminProfile,
        memoryFacts: [],
        chatHistory: [],
        loggedWorkouts: [],
        loggedMetrics: [],
      });

      this.saveUsersToFile();
    }
  }

  async findUserByEmail(email: string): Promise<UserAccount | null> {
    const normalized = email.trim().toLowerCase();
    for (const userData of this.usersMap.values()) {
      if (userData.account.email.toLowerCase() === normalized) {
        return JSON.parse(JSON.stringify(userData.account));
      }
    }
    return null;
  }

  async findUserById(userId: string): Promise<UserAccount | null> {
    const userData = this.usersMap.get(userId);
    if (!userData) return null;
    return JSON.parse(JSON.stringify(userData.account));
  }

  async createUser(data: { name: string; email: string; passwordHash: string; salt: string; role: UserRole }): Promise<UserAccount> {
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const account: UserAccount = {
      id: userId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      salt: data.salt,
      role: data.role,
      onboardingCompleted: data.role === 'admin',
      isPaid: false,
      paymentDetails: null,
      createdAt: now,
      updatedAt: now,
    };

    const profile: UserProfile = {
      id: `profile-${userId}`,
      userId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      onboardingCompleted: data.role === 'admin',
      fitnessGoal: {
        id: `fg-${userId}`,
        title: 'Personal Fitness Goal',
        targetDescription: 'Not specified yet',
        primaryFocus: 'general_fitness',
      },
      equipmentAccess: [],
      exercisePreferences: {
        preferredExercises: [],
        excludedExercises: [],
        equipment: [],
      },
      healthConstraints: [],
      dietaryRestrictions: [],
      userConsent: {
        medicalDisclaimerAccepted: false,
        dataStorageConsent: true,
        consentDate: now,
      },
      createdAt: now,
      updatedAt: now,
    };

    this.usersMap.set(userId, {
      account,
      profile,
      memoryFacts: [],
      chatHistory: [],
      loggedWorkouts: [],
      loggedMetrics: [],
    });

    this.saveUsersToFile();
    return JSON.parse(JSON.stringify(account));
  }

  async createSession(userId: string, role: UserRole): Promise<UserSession> {
    const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    const session: UserSession = {
      token,
      userId,
      role,
      createdAt: now.toISOString(),
      expiresAt,
    };

    this.sessionsMap.set(token, session);
    this.saveSessionsToFile();
    return JSON.parse(JSON.stringify(session));
  }

  async getSession(token: string): Promise<UserSession | null> {
    const session = this.sessionsMap.get(token);
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      this.sessionsMap.delete(token);
      this.saveSessionsToFile();
      return null;
    }
    return JSON.parse(JSON.stringify(session));
  }

  async deleteSession(token: string): Promise<void> {
    this.sessionsMap.delete(token);
    this.saveSessionsToFile();
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const userData = this.usersMap.get(userId);
    if (!userData) return null;
    return JSON.parse(JSON.stringify(userData.profile));
  }

  async updateProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<UserProfile> {
    const userData = this.usersMap.get(userId);
    if (!userData) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }

    const updatedProfile: UserProfile = {
      ...userData.profile,
      ...profileUpdates,
      fitnessGoal: {
        ...userData.profile.fitnessGoal,
        ...(profileUpdates.fitnessGoal || {}),
      },
      exercisePreferences: {
        ...userData.profile.exercisePreferences,
        ...(profileUpdates.exercisePreferences || {}),
      },
      userConsent: {
        ...userData.profile.userConsent,
        ...(profileUpdates.userConsent || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    userData.profile = updatedProfile;

    // If name or email changed, reflect in account
    if (profileUpdates.name !== undefined) {
      userData.account.name = profileUpdates.name;
    }
    if (profileUpdates.email !== undefined) {
      userData.account.email = profileUpdates.email;
    }

    // If onboarding status was updated, also reflect in account
    if (profileUpdates.onboardingCompleted !== undefined) {
      userData.account.onboardingCompleted = profileUpdates.onboardingCompleted;
    }

    this.saveUsersToFile();
    return JSON.parse(JSON.stringify(updatedProfile));
  }

  async updatePassword(userId: string, newPasswordHash: string, newSalt: string): Promise<void> {
    const userData = this.usersMap.get(userId);
    if (!userData) {
      throw new Error(`User not found: ${userId}`);
    }
    userData.account.passwordHash = newPasswordHash;
    userData.account.salt = newSalt;
    userData.account.updatedAt = new Date().toISOString();
    this.saveUsersToFile();
  }

  async updateUserSubscription(userId: string, subscription: SubscriptionRecord): Promise<UserAccount> {
    const userData = this.usersMap.get(userId);
    if (!userData) {
      throw new Error(`User not found: ${userId}`);
    }
    userData.account.subscription = subscription;
    userData.account.isPaid = subscription.paymentStatus === 'successful';
    userData.account.paymentDetails = {
      paymentId: subscription.paymentId,
      paidAt: subscription.accessStartDate,
      expiresAt: subscription.accessExpiryDate,
      planName: 'FleetBot 1-Year Access (₹49/year)',
      amount: subscription.amount,
    };
    userData.account.updatedAt = new Date().toISOString();
    this.saveUsersToFile();
    return JSON.parse(JSON.stringify(userData.account));
  }

  async updateUserPayment(userId: string, paymentDetails: { paymentId: string; paidAt: string; expiresAt: string; planName: string; amount: number }): Promise<UserAccount> {
    const userData = this.usersMap.get(userId);
    if (!userData) {
      throw new Error(`User not found: ${userId}`);
    }
    userData.account.isPaid = true;
    userData.account.paymentDetails = paymentDetails;
    userData.account.subscription = {
      userId,
      paymentId: paymentDetails.paymentId,
      paymentStatus: 'successful',
      plan: 'FleetBot_1_Year',
      purchaseDate: paymentDetails.paidAt || new Date().toISOString(),
      accessStartDate: paymentDetails.paidAt || new Date().toISOString(),
      accessExpiryDate: paymentDetails.expiresAt,
      amount: paymentDetails.amount || 49,
    };
    userData.account.updatedAt = new Date().toISOString();
    this.saveUsersToFile();
    return JSON.parse(JSON.stringify(userData.account));
  }

  async deleteUser(userId: string): Promise<void> {
    this.usersMap.delete(userId);
    for (const [token, session] of Array.from(this.sessionsMap.entries())) {
      if (session.userId === userId) {
        this.sessionsMap.delete(token);
      }
    }
    this.saveUsersToFile();
    this.saveSessionsToFile();
  }

  async getMemoryFacts(userId: string): Promise<MemoryFact[]> {
    const userData = this.usersMap.get(userId);
    if (!userData) return [];
    return JSON.parse(JSON.stringify(userData.memoryFacts));
  }

  async addMemoryFact(userId: string, factData: Omit<MemoryFact, 'id' | 'timestamp'>): Promise<MemoryFact> {
    const userData = this.usersMap.get(userId);
    if (!userData) throw new Error(`User not found: ${userId}`);

    const newFact: MemoryFact = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...factData,
      timestamp: new Date().toISOString(),
    };

    userData.memoryFacts.push(newFact);
    this.saveUsersToFile();
    return JSON.parse(JSON.stringify(newFact));
  }

  async confirmMemoryFact(userId: string, factId: string): Promise<MemoryFact | null> {
    const userData = this.usersMap.get(userId);
    if (!userData) return null;

    const fact = userData.memoryFacts.find((f) => f.id === factId);
    if (!fact) return null;
    fact.status = 'confirmed';

    if (fact.category === 'medical') {
      const exists = userData.profile.healthConstraints.some(
        (hc) => hc.description.toLowerCase().includes(fact.fact.toLowerCase())
      );
      if (!exists) {
        userData.profile.healthConstraints.push({
          id: `hc-${Date.now()}`,
          category: 'injury',
          description: fact.fact,
          severity: 'moderate',
          active: true,
          notes: 'Added from confirmed memory fact.',
        });
        userData.profile.updatedAt = new Date().toISOString();
      }
    }

    this.saveUsersToFile();
    return JSON.parse(JSON.stringify(fact));
  }

  async rejectMemoryFact(userId: string, factId: string): Promise<boolean> {
    const userData = this.usersMap.get(userId);
    if (!userData) return false;

    const fact = userData.memoryFacts.find((f) => f.id === factId);
    if (!fact) return false;
    fact.status = 'rejected';
    this.saveUsersToFile();
    return true;
  }

  async getChatHistory(userId: string): Promise<ConversationMessage[]> {
    const userData = this.usersMap.get(userId);
    if (!userData) return [];
    return JSON.parse(JSON.stringify(userData.chatHistory));
  }

  async addChatMessage(userId: string, msg: ConversationMessage): Promise<void> {
    const userData = this.usersMap.get(userId);
    if (!userData) return;
    userData.chatHistory.push(msg);
    this.saveUsersToFile();
  }

  async clearChatHistory(userId: string): Promise<void> {
    const userData = this.usersMap.get(userId);
    if (!userData) return;
    userData.chatHistory = [];
    this.saveUsersToFile();
  }

  async getLoggedWorkouts(userId: string): Promise<LoggedWorkout[]> {
    const userData = this.usersMap.get(userId);
    if (!userData) return [];
    return JSON.parse(JSON.stringify(userData.loggedWorkouts));
  }

  async addLoggedWorkout(userId: string, workout: Omit<LoggedWorkout, 'id' | 'userId'>): Promise<LoggedWorkout> {
    const userData = this.usersMap.get(userId);
    if (!userData) throw new Error('User not found');

    const newWorkout: LoggedWorkout = {
      id: `w-${Date.now()}`,
      userId,
      ...workout,
    };

    userData.loggedWorkouts.push(newWorkout);
    this.saveUsersToFile();
    return JSON.parse(JSON.stringify(newWorkout));
  }

  async getLoggedMetrics(userId: string): Promise<LoggedMetric[]> {
    const userData = this.usersMap.get(userId);
    if (!userData) return [];
    return JSON.parse(JSON.stringify(userData.loggedMetrics));
  }

  async addLoggedMetric(userId: string, metric: Omit<LoggedMetric, 'id' | 'userId'>): Promise<LoggedMetric> {
    const userData = this.usersMap.get(userId);
    if (!userData) throw new Error('User not found');

    const newMetric: LoggedMetric = {
      id: `m-${Date.now()}`,
      userId,
      ...metric,
    };

    userData.loggedMetrics.push(newMetric);
    this.saveUsersToFile();
    return JSON.parse(JSON.stringify(newMetric));
  }

  async getAllUsersForAdmin(): Promise<Omit<UserAccount, 'passwordHash' | 'salt'>[]> {
    const result: Omit<UserAccount, 'passwordHash' | 'salt'>[] = [];
    for (const userData of this.usersMap.values()) {
      const { passwordHash, salt, ...safeAccount } = userData.account;
      result.push(JSON.parse(JSON.stringify(safeAccount)));
    }
    return result;
  }
}

export const repository: UserRepository = new JsonFileUserRepository();
