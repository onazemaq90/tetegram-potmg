// index.js
import { Telegraf } from 'telegraf'
import ytdl from 'ytdl-core'

export default {
  async fetch(request, env) {
    const bot = new Telegraf(env.BOT_TOKEN)
    const url = new URL(request.url)
    
    // Handle Telegram webhook
    if (request.method === 'POST' && url.pathname === `/${env.BOT_TOKEN}`) {
      return await handleRequest(bot, request)
    }
    return new Response('Hello from YouTube Bot Worker!')
  }
}

async function handleRequest(bot, request) {
  const body = await request.json()
  await bot.handleUpdate(body)
  return new Response('OK')
}

// Bot setup
const bot = new Telegraf(process.env.BOT_TOKEN || '')

// Commands
bot.command('start', async (ctx) => {
  await ctx.replyWithHTML(`
    <b>Hello! This is a YouTube Uploader Bot</b>

    I can download video or audio from YouTube. Made by @TheTeleRoid 🇮🇳
  `, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "⭕ Channel ⭕", url: "https://t.me/TeleRoidGroup" },
          { text: "🛑 Support 🛑", url: "https://t.me/TeleRoid14" }
        ],
        [{ text: "Source Code", url: "https://github.com/P-Phreak/TG-YouTube-Uploader" }]
      ]
    }
  })
})

bot.command('help', (ctx) => {
  ctx.replyWithHTML(`
    <b>YouTube Bot Help!</b>
    
    Just send a YouTube URL to download it in video or audio format!
  `)
})

// YouTube URL handler
bot.on('text', async (ctx) => {
  if (ytdl.validateURL(ctx.message.text)) {
    ctx.reply('Choose download type:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Audio 🎵', callback_data: 'audio' },
            { text: 'Video 🎬', callback_data: 'video' }
          ]
        ]
      }
    })
  }
})

// Callback handlers
bot.action('audio', async (ctx) => {
  await ctx.answerCbQuery()
  const url = ctx.update.callback_query.message.reply_to_message.text
  const info = await ytdl.getInfo(url)
  
  try {
    const audio = ytdl(url, { quality: 'highestaudio' })
    ctx.replyWithAudio({ source: audio }, {
      caption: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      performer: info.videoDetails.author.name
    })
  } catch (e) {
    ctx.reply('Error downloading audio: ' + e.message)
  }
})

bot.action('video', async (ctx) => {
  await ctx.answerCbQuery()
  const url = ctx.update.callback_query.message.reply_to_message.text
  const info = await ytdl.getInfo(url)
  
  try {
    const video = ytdl(url, { quality: 'highestvideo' })
    ctx.replyWithVideo({ source: video }, {
      caption: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      width: 1280,
      height: 720
    })
  } catch (e) {
    ctx.reply('Error downloading video: ' + e.message)
  }
})

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.update.update_id}:`, err)
  ctx.reply('An error occurred while processing your request.')
})
