import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'FleetBuild AI Platform' });
  });

  // FleetBot AI Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, memoryContext, chatHistory } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Fallback adaptive generator
        return res.json({
          reply: generateAdaptiveResponse(message, memoryContext),
          updatedMemory: extractMemoryUpdates(message, memoryContext),
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are FleetBot, an elite AI Fitness Coach & Memory Engine for FleetBuild.
Your tone is intense, encouraging, hyper-personalized, Tesla/Apple Health inspired, and direct.
Current Active Memory Context:
- Primary Goal: ${memoryContext?.goal || 'Muscle Gain'}
- Medical & Injury Profile: ${memoryContext?.injury || 'Left Knee Pain'}
- Dislikes & Excluded Exercises: ${memoryContext?.hates || 'Barbell Squats'}
- Nutrition Target: ${memoryContext?.calories || '2,600 kcal'}
- Equipment Access: ${memoryContext?.equipment || 'Full Gym'}

Instructions:
1. Always adapt workout recommendations based on active memory context and injuries.
2. If the user mentions pain, knee issues, fatigue, or equipment changes, acknowledge the adaptation, update their schedule, and pivot safely.
3. Keep answers punchy, actionable, and formatted nicely.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser message: ${message}` }] }
        ],
      });

      const reply = response.text || "I've processed your update and adjusted your training plan for maximum recovery and peak output.";
      
      res.json({
        reply,
        updatedMemory: extractMemoryUpdates(message, memoryContext),
      });
    } catch (error) {
      console.error('Error generating FleetBot response:', error);
      const { message, memoryContext } = req.body;
      res.json({
        reply: generateAdaptiveResponse(message, memoryContext),
        updatedMemory: extractMemoryUpdates(message, memoryContext),
      });
    }
  });

  // Helper function for offline / fallback adaptive AI responses
  function generateAdaptiveResponse(msg: string, memory: any) {
    const lower = (msg || '').toLowerCase();
    
    if (lower.includes('knee') || lower.includes('leg') || lower.includes('pain') || lower.includes('hurt')) {
      return "I've noted the left knee pain in your active medical profile. I am recalculating today's schedule. Let's pivot to a low-impact upper body mobility and core session. I've also removed barbell squats from your future plans until cleared. Should I load the new routine?";
    }
    if (lower.includes('core') || lower.includes('abs') || lower.includes('finisher')) {
      return "Loaded 15-Min Core Finisher: 1) Hanging Leg Raises 4x15, 2) Cable Woodchoppers 3x12/side, 3) Anti-rotation Paloff Press 3x45s hold. High tension, zero lower body impact!";
    }
    if (lower.includes('recovery') || lower.includes('sleep') || lower.includes('score')) {
      return "Your recovery score is currently 88% (Optimum). Heart Rate Variability is +6ms above baseline. You have high neural readiness for upper body pushing today!";
    }
    if (lower.includes('swap') || lower.includes('replace') || lower.includes('substitute')) {
      return "Understood. Swapping Barbell Squats for Dumbbell Bulgarian Split-Squats or Cable Belt Squats to protect joint alignment while preserving leg hyper-trophy stimulus.";
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "FleetBot Neural Coach online. All systems nominal. Streak is at 14 days! What are we optimizing today?";
    }

    return `Understood. I have logged this with your FleetBuild memory engine (${memory?.goal || 'Muscle Gain'}). I've fine-tuned your set velocity targets and volume thresholds accordingly. Let's execute!`;
  }

  function extractMemoryUpdates(msg: string, currentMemory: any) {
    const lower = (msg || '').toLowerCase();
    const newMemory = { ...currentMemory };

    if (lower.includes('knee')) {
      newMemory.injury = 'Left Knee Pain (Active Adaptation)';
      if (!newMemory.hates.includes('Squats')) {
        newMemory.hates = 'Squats, Heavy Leg Press';
      }
    }
    if (lower.includes('shoulder') || lower.includes('rotator')) {
      newMemory.injury = 'Shoulder Impingement';
    }
    if (lower.includes('cut') || lower.includes('fat loss')) {
      newMemory.goal = 'Lean Fat Loss & Definition';
      newMemory.calories = '2,200 kcal';
    }

    return newMemory;
  }

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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FleetBuild server running on http://localhost:${PORT}`);
  });
}

startServer();
