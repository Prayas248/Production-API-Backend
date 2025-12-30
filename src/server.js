import app from './app.js';
import 'dotenv/config.js';
import { connectDB } from './config/database.js';
const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

