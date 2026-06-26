import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Starting project setup...')

try {
  // 1. Install dependencies
  console.log('📦 Installing dependencies...')
  execSync('npm install', { stdio: 'inherit' })

  // 2. Check for .env file
  if (!fs.existsSync('.env')) {
    console.log('⚠️  .env file not found. Creating from .env.example...')
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env')
      console.log('✅ Created .env file. Please fill in your Clerk and Database keys.')
    } else {
      console.log('❌ .env.example not found. Please create .env manually.')
    }
  }

  // 3. Sync database schema
  console.log('🗄️ Syncing database schema with Prisma...')
  try {
    execSync('npx prisma db push', { stdio: 'inherit' })
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Database synchronized.')
  } catch (err) {
    console.log('⚠️ Database sync failed. Make sure PostgreSQL is running.')
  }

  console.log('\n✨ Setup complete!')
  console.log('Run "npm run dev" to start the development server.')

} catch (error) {
  console.error('❌ Setup failed:', error.message)
  process.exit(1)
}
