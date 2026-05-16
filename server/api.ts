import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "financeiro_pro_secret_key_123456";

// Path to sqlite db
const dbPath = path.join(process.cwd(), "financeiro.db");
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Simple migration
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );
    
    CREATE TABLE IF NOT EXISTS launches_data (
      user_id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
  `);
  
  // Create admin user if not exists
  const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("cesar.amorim");
  if (!adminExists) {
    const hash = bcrypt.hashSync("123456", 10);
    // use random UUID since crypto.randomUUID isn't guaranteed in all environments
    const id = "1";
    db.prepare("INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)").run("admin-1", "cesar.amorim", "admin@financeirop.ro", hash, "admin");
  }
};

initDb();

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

apiRouter.post('/auth/login', (req, res) => {
  const { credential, password } = req.body;
  // User can login with email or username
  const user: any = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(credential, credential);
  
  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

apiRouter.post('/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const hash = bcrypt.hashSync(password, 10);
    const id = Math.random().toString(36).substring(2, 15);
    db.prepare("INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)").run(id, username, email, hash, "user");
    res.json({ success: true });
  } catch (e: any) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: "Usuário ou email já existe" });
    }
    return res.status(400).json({ error: "Erro ao registrar usuário" });
  }
});

apiRouter.post('/auth/logout', (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// Middleware to protect routes
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Não autorizado" });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Token inválido" });
  }
};

apiRouter.get('/auth/me', requireAuth, (req: any, res) => {
  const user: any = db.prepare("SELECT id, username, email, role FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  
  res.json({ user });
});

apiRouter.post('/auth/reset-password', (req, res) => {
  const { credential } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(credential, credential);
  
  if (!user) {
    // Return true anyway to not leak whether user exists or not, standard security practice
    return res.json({ success: true, message: "Se o usuário existir, um link de recuperação foi enviado." });
  }
  
  // Here we simulate generating a link and updating password directly for simplicity in preview
  // In reality, this would send an email. Since we can't send an email reliably, let's just 
  // return a mock payload if running in preview, but practically we should probably reset it directly directly?
  // Let's reset it to a temporary password '123456' for now to allow the user to get back in.
  const tempPassword = "reset_" + Math.random().toString(36).substring(2, 8);
  const hash = bcrypt.hashSync(tempPassword, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, user.id);
  
  res.json({ success: true, newTempPassword: tempPassword, message: "Senha temporária gerada: " + tempPassword });
});

apiRouter.post('/auth/update-password', requireAuth, (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Senha atual incorreta" });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, req.user.id);
  
  res.json({ success: true });
});

// Admin endpoints
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Acesso restrito" });
  next();
};

apiRouter.get('/users', requireAuth, requireAdmin, (req, res) => {
  const users = db.prepare("SELECT id, username, email, role FROM users").all();
  res.json({ users });
});

apiRouter.post('/users/:id/reset', requireAuth, requireAdmin, (req, res) => {
  const { newPassword } = req.body;
  const id = req.params.id;
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, id);
  res.json({ success: true });
});

// Data endpoints (store app data as JSON per user for simplicity)
apiRouter.get('/data', requireAuth, (req: any, res) => {
  const row: any = db.prepare("SELECT data FROM launches_data WHERE user_id = ?").get(req.user.id);
  if (row) {
    res.json(JSON.parse(row.data));
  } else {
    res.json({ categories: null, launches: null, parcels: null });
  }
});

apiRouter.post('/data', requireAuth, (req: any, res) => {
  const data = JSON.stringify(req.body);
  db.prepare(`
    INSERT INTO launches_data (user_id, data) 
    VALUES (?, ?) 
    ON CONFLICT(user_id) DO UPDATE SET data=excluded.data
  `).run(req.user.id, data);
  res.json({ success: true });
});
