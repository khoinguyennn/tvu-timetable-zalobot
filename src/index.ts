import dotenv from 'dotenv';
import express from 'express';
import { ZaloBot } from './lib/ZaloBot';
import { ZaloEvent } from './types/zalo';
import { handleTextMessage } from './handlers/messageHandlers';
import { handleLoginCommand } from './handlers/loginHandler';
import { handleScheduleCommand } from './handlers/scheduleHandler';
import { NotificationService } from './services/notificationService';

// Load environment variables
dotenv.config();

const BOT_TOKEN = process.env.ZALO_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('❌ ZALO_BOT_TOKEN is required!');
  console.error('📝 Please create a .env file and add your bot token:');
  console.error('   ZALO_BOT_TOKEN=your_bot_token_here');
  process.exit(1);
}

async function main(): Promise<void> {
  try {
    // Setup Express server for health checks (required by Heroku)
    const app = express();
    
    app.get('/', (_req, res) => {
      res.json({ 
        status: 'ZaloBot TVU is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      });
    });

    app.get('/health', (_req, res) => {
      res.json({ status: 'healthy' });
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🌐 Health check server running on port ${PORT}`);
    });

    // Initialize bot
    const bot = new ZaloBot({
      token: BOT_TOKEN as string,
      pollingInterval: parseInt(process.env.POLLING_INTERVAL || '3000') // Poll every 3 seconds by default
    });

    // Get bot info to verify connection
    console.log('🤖 Initializing Zalo Bot...');
    
    try {
      const botInfo = await bot.getBotInfo();
      console.log('✅ Bot connected successfully!');
      console.log('📋 Bot Info:', JSON.stringify(botInfo, null, 2));
    } catch (error) {
      console.log('⚠️  Could not fetch bot info, but proceeding with message handling...');
    }

    // Initialize and start notification service
    const notificationService = NotificationService.getInstance(bot);
    notificationService.startScheduler();
    console.log('📅 Notification service started');

    // Set up message handlers
    bot.onMessage(async (event: ZaloEvent) => {
      console.log('📨 Received event:', event.event_name);
      console.log('👤 From user:', event.message.from.display_name);

      try {
        // Hiện tại chỉ xử lý tin nhắn văn bản
        if (event.event_name === 'message.text.received') {
          await handleTextMessage(event, bot);
        } else {
          console.log('🔄 Unhandled event type:', event.event_name);
        }
      } catch (error) {
        console.error('❌ Error handling message:', error);
      }
    });

    // Add command handlers
    bot.onMessage(async (event) => {
      if (event.event_name === 'message.text.received') {
        const text = event.message.text;
        if (text?.startsWith('/login')) {
          await handleLoginCommand(event, bot);
        } else if (text?.startsWith('/tkb')) {
          await handleScheduleCommand(event, bot);
        }
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      bot.stopPolling();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      bot.stopPolling();
      process.exit(0);
    });

    // Start polling for messages
    console.log('🚀 Starting message polling...');
    console.log('💡 Send a message to your Zalo OA to test the bot!');
    console.log('📱 Type Ctrl+C to stop the bot\n');
    
    await bot.startPolling();

  } catch (error) {
    console.error('💥 Fatal error starting bot:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('💥 Unhandled error in main:', error);
  process.exit(1);
});
