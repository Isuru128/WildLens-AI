const supabase = require('../config/supabase');

exports.getStats = async (req, res) => {
    try {

        const { count, error } = await supabase
            .from('users')
            .select('*', {
                count: 'exact',
                head: true
            });

        if (error) {
            throw error;
        }

        res.json({
            totalUsers: count
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
};