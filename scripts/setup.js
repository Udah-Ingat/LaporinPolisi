// Note: Save this code in scripts/setup.js
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log("🚀 Setting up LaporinPolisi...\n");

  // Check if .env exists
  if (!existsSync(".env")) {
    console.log("📋 Creating .env file from .env.example...");
    const envExample = readFileSync(".env.example", "utf8");
    writeFileSync(".env", envExample);
    console.log("✅ .env file created\n");
  }

  // Generate AUTH_SECRET
  console.log("🔐 Generating AUTH_SECRET...");
  try {
    const secret = execSync("npx auth secret", { encoding: "utf8" }).trim();
    const envContent = readFileSync(".env", "utf8");
    const updatedEnv = envContent.replace('AUTH_SECRET=""', `AUTH_SECRET="${secret}"`);
    writeFileSync(".env", updatedEnv);
    console.log("✅ AUTH_SECRET generated\n");
  } catch (error) {
    console.log("⚠️  Could not generate AUTH_SECRET automatically. Please run 'npx auth secret' manually.\n");
  }

  // Install dependencies
  console.log("📦 Installing dependencies...");
  execSync("npm install", { stdio: "inherit" });
  console.log("✅ Dependencies installed\n");

  // Database setup reminder
  console.log("📊 Database Setup Reminder:");
  console.log("1. Create a PostgreSQL database named 'laporinpolisi'");
  console.log("2. Update DATABASE_URL in .env with your connection string");
  console.log("3. Run 'npm run db:push' to create tables\n");

  // Google OAuth reminder
  console.log("🔑 Google OAuth Setup Reminder:");
  console.log("1. Go to https://console.cloud.google.com/");
  console.log("2. Create OAuth 2.0 credentials");
  console.log("3. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET to .env");
  console.log("4. Add redirect URIs:");
  console.log("   - http://localhost:3000/api/auth/callback/google (dev)");
  console.log("   - https://yourdomain.com/api/auth/callback/google (prod)\n");

  // Optional Supabase setup
  const useSupabase = await question("Do you want to use Supabase for image storage? (y/n): ");
  if (useSupabase.toLowerCase() === "y") {
    console.log("\n🗄️  Supabase Setup Reminder:");
    console.log("1. Create a project at https://app.supabase.com/");
    console.log("2. Create a public bucket named 'images'");
    console.log("3. Add Supabase credentials to .env\n");
  }

  rl.close();

  console.log("✨ Setup complete! Next steps:");
  console.log("1. Configure your .env file with the required credentials");
  console.log("2. Run 'npm run db:push' to create database tables");
  console.log("3. Run 'npm run dev' to start the development server");
  console.log("\nHappy coding! 🎉");
}

setup().catch(console.error);