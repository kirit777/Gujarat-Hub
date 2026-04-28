require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/config/socket');
const { initDatabase } = require('./src/database/initTables');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await initDatabase();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to bootstrap server:', error.message);
    process.exit(1);
  }
}

bootstrap();
