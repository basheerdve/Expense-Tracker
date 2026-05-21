var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  const ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  const users = [];
  app.post("/api/register", (req, res) => {
    const { email, password, name } = req.body;
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = { id: Date.now().toString(), email, password, name };
    users.push(newUser);
    res.json({ success: true, user: { id: newUser.id, email, name } });
  });
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  });
  app.post("/api/insights", async (req, res) => {
    try {
      const { expenses, budgets } = req.body;
      const prompt = `
        You are a financial advisor. Review these expenses and budgets for the current month:
        Expenses: ${JSON.stringify(expenses)}
        Budgets: ${JSON.stringify(budgets)}
        
        Provide:
        1. A brief summary of spending health.
        2. Three actionable tips to save money based on the data.
        3. Identify any unusual spending patterns.
        
        Keep it concise and conversational.
      `;
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      res.json({ text: result.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
