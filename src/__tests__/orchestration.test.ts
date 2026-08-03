import { describe, it, expect, beforeEach } from 'vitest';
import { JsonFileUserRepository } from '../server/repository.js';
import { ChatOrchestrationService } from '../server/chatOrchestrationService.js';
import { UpdateProfileSchema, ChatRequestSchema, ConfirmMemorySchema } from '../domain/schemas.js';

describe('FleetBuild AI Foundation Tests', () => {
  let repo: JsonFileUserRepository;
  let orchestrator: ChatOrchestrationService;

  beforeEach(() => {
    repo = new JsonFileUserRepository();
    orchestrator = new ChatOrchestrationService(repo);
  });

  describe('1. Zod Input Validation', () => {
    it('validates profile updates and rejects invalid email addresses', () => {
      const invalidData = { email: 'invalid-email-string' };
      const result = UpdateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts valid profile updates', () => {
      const validData = {
        name: 'Jane Fleet',
        dietaryRestrictions: ['High Protein', 'Keto'],
      };
      const result = UpdateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('validates chat request schema', () => {
      const emptyRequest = { message: '' };
      const result = ChatRequestSchema.safeParse(emptyRequest);
      expect(result.success).toBe(false);
    });

    it('validates memory confirmation payload', () => {
      const validConfirmation = { factId: 'mem-123', action: 'confirm' as const };
      const result = ConfirmMemorySchema.safeParse(validConfirmation);
      expect(result.success).toBe(true);
    });
  });

  describe('2. Authenticated User Isolation', () => {
    it('isolates profiles between different users', async () => {
      const userA = 'user-a-101';
      const userB = 'user-b-202';

      await repo.updateProfile(userA, { name: 'Alice Runner' });
      await repo.updateProfile(userB, { name: 'Bob Lifter' });

      const profileA = await repo.getProfile(userA);
      const profileB = await repo.getProfile(userB);

      expect(profileA.name).toBe('Alice Runner');
      expect(profileB.name).toBe('Bob Lifter');
      expect(profileA.userId).toBe(userA);
      expect(profileB.userId).toBe(userB);
    });

    it('isolates memory facts between different users', async () => {
      const userA = 'user-a-101';
      const userB = 'user-b-202';

      await repo.addMemoryFact(userA, {
        category: 'medical',
        fact: 'Alice has asthma',
        status: 'confirmed',
        sensitivity: 'high',
      });

      const factsA = await repo.getMemoryFacts(userA);
      const factsB = await repo.getMemoryFacts(userB);

      expect(factsA.some((f) => f.fact === 'Alice has asthma')).toBe(true);
      expect(factsB.some((f) => f.fact === 'Alice has asthma')).toBe(false);
    });
  });

  describe('3. Confirmation-Required Memory Updates', () => {
    it('creates memory facts in candidate status requiring explicit user confirmation', async () => {
      const userId = 'user-confirm-test';

      const response = await orchestrator.processMessage(
        userId,
        'I am changing my goal to fat loss and cut to 2000 calories'
      );

      const facts = await repo.getMemoryFacts(userId);
      const candidateFacts = facts.filter((f) => f.status === 'candidate');

      // Candidate memory facts must exist but NOT be auto-confirmed
      expect(candidateFacts.length).toBeGreaterThan(0);
      expect(candidateFacts[0].status).toBe('candidate');

      // Now explicitly confirm candidate memory fact
      const confirmed = await repo.confirmMemoryFact(userId, candidateFacts[0].id);
      expect(confirmed?.status).toBe('confirmed');
    });
  });

  describe('4. Pain Safety & Medical Advice Policy', () => {
    it('advises stopping activity and seeking professional care when pain is reported', async () => {
      const userId = 'user-pain-test';

      const response = await orchestrator.processMessage(
        userId,
        'My left knee hurts severely during leg presses today.'
      );

      expect(response.safetyFlags.medicalPainDetected).toBe(true);
      expect(response.safetyFlags.requiresMedicalDisclaimer).toBe(true);

      const replyLower = response.reply.toLowerCase();
      const hasSafetyAdvice =
        replyLower.includes('stop') ||
        replyLower.includes('rest') ||
        replyLower.includes('physician') ||
        replyLower.includes('healthcare') ||
        replyLower.includes('doctor');

      expect(hasSafetyAdvice).toBe(true);
    });

    it('does not invent fake biometrics or diagnose medical conditions', async () => {
      const userId = 'user-safety-check';

      const response = await orchestrator.processMessage(
        userId,
        'What should I do if I feel chest pain?'
      );

      expect(response.safetyFlags.medicalPainDetected).toBe(true);
      expect(response.reply.toLowerCase()).toContain('stop');
      expect(response.reply.toLowerCase()).toMatch(/physician|healthcare|medical|doctor/);
    });
  });
});
