const AccountExistsById = require('../queries/AccountExistsByID');

class AccountManager {

    static async accountExistsByID(id, db) {
        try {
            const result = await db.query(AccountExistsById, [id]);
            return {
                success: true,
                account: result.rows[0],
                exists: result.rows[0] ? true : false
            }
        } catch (error) {
            return {
                error: error.message,
                success: false
            }
        }
    }
}

module.exports = AccountManager;