import dotenv from 'dotenv';
import { ZaloBot } from './lib/ZaloBot';
import { ZaloEvent } from './types/zalo';
import {
  handleTextMessage,
  handleImageMessage,
  handleStickerMessage,
  handleLocationMessage,
  handleFileMessage,
  handleAudioMessage,
  handleVideoMessage
} from './handlers/messageHandlers';

// Load environment variables
dotenv.config();

const BOT_TOKEN = process.env.ZALO_BOT_TOKEN || '886158540051025916:vYPIhPuMaXrtruBRHycOJhoHxJJDeztFbKuylgHEfltOZiplZJUFwQYHYhzsXBdW';

async function main(): Promise<void> {
  try {
    // Initialize bot
    const bot = new ZaloBot({
      token: BOT_TOKEN,
      pollingInterval: 3000 // Poll every 3 seconds
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

    // Set up message handlers
    bot.onMessage(async (event: ZaloEvent) => {
      console.log('📨 Received event:', event.event_name);
      console.log('👤 From user:', event.message.from.display_name);

      try {
        switch (event.event_name) {
          case 'message.text.received':
            await handleTextMessage(event, bot);
            break;
          case 'message.image.received':
            await handleImageMessage(event, bot);
            break;
          case 'message.sticker.received':
            await handleStickerMessage(event, bot);
            break;
          case 'message.location.received':
            await handleLocationMessage(event, bot);
            break;
          case 'message.file.received':
            await handleFileMessage(event, bot);
            break;
          case 'message.audio.received':
            await handleAudioMessage(event, bot);
            break;
          case 'message.video.received':
            await handleVideoMessage(event, bot);
            break;
          default:
            console.log('🔄 Unhandled event type:', event.event_name);
        }
      } catch (error) {
        console.error('❌ Error handling message:', error);
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
