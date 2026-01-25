import { slidingWindow } from '@arcjet/node';
import aj from '../config/arcjet.js';
import logger from '../config/logger.js';

export const securityMiddleware = async (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  try{
    const userAgent = req.get('User-Agent') || '';
    if (userAgent.includes('PostmanRuntime')) {
      return next(); // skip Arcjet checks for Postman
    }
    const role = req.user?.role || 'guest';

    let limit;
    // let message;

    switch(role){
      case 'admin':
        limit = 20;
        // message = 'Admin rate limit exceeded (20 per minute)';
        break;
      case 'user':
        limit = 10;
        // message = 'Admin rate limit exceeded (10 per minute)';
        break;
            
    }
    const client = aj.withRule(slidingWindow({
      mode:'LIVE',
      interval:'1m',
      max:limit,
      name:`${role}-rate-limit`
    }));
        
    const decision = await client.protect(req);

    if(decision.isDenied() && decision.reason.isBot()){
      logger.warn('Bot request blocker', { ip: req.ip, userAgent:req.get('User-Agent'), path:req.path });
            
      return res.status(403).json({ error: 'Forbidden', message: 'Bot access denied' });
    }

    if(decision.isDenied() && decision.reason.isShield()){
      logger.warn('Shield request blocker', { ip: req.ip, userAgent:req.get('User-Agent'), path:req.path, method:req.method });
            
      return res.status(403).json({ error: 'Forbidden', message: 'Request blocked by security policy' });
    }

    if(decision.isDenied() && decision.reason.isRateLimit()){
      logger.warn('Rate limit exceeded', { ip: req.ip, userAgent:req.get('User-Agent'), path:req.path, method:req.method });
            
      return res.status(403).json({ error: 'Forbidden', message: 'Too many requests' });
    }

    next();


  }
  catch(e){
    console.log('Security middleware error',e);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Security check failed' });
  }
};