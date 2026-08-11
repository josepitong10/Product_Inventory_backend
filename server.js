const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
    console.log('🚀 Starting Product Inventory System...');
    
    const connected = await testConnection();
    if (!connected) {
        console.error('❌ Cannot start server without database');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📊 Health: http://localhost:${PORT}/health`);
        console.log(`🔐 Auth: http://localhost:${PORT}/auth`);
        console.log(`📦 Products: http://localhost:${PORT}/products`);
    });
}

startServer();