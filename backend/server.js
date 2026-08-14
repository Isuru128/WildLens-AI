require('dotenv').config();

const app = require('./src/app');
const supabase = require('./src/config/supabase');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        const { error } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (error) throw error;

        console.log('✅ Supabase Connected');

        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });

    } catch (err) {

        console.error(
            '❌ Failed to connect Supabase:',
            err.message
        );

        process.exit(1);
    }
}

startServer();