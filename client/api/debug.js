export default async function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  const url = req.url;
  const referer = req.headers['referer'] || '';
  
  // Check bot detection
  const isBot = checkBot(userAgent);
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    url: url,
    referer: referer,
    userAgent: userAgent,
    isDetectedAsBot: isBot,
    headers: req.headers,
    ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
  };
  
  res.status(200).json(debugInfo);
}

function checkBot(userAgent) {
  const botPatterns = [
    'facebookexternalhit',
    'WhatsApp',
    'whatsapp',
    'Twitterbot',
    'LinkedInBot',
    'TelegramBot',
    'SkypeUriPreview',
    'SlackBot',
    'DiscordBot',
    'GoogleBot',
    'BingBot',
    'facebot',
    'facebook',
    'ia_archiver',
    'crawler',
    'bot',
    'spider'
  ];
  
  const userAgentLower = userAgent.toLowerCase();
  return botPatterns.some(pattern => 
    userAgentLower.includes(pattern.toLowerCase())
  );
} 