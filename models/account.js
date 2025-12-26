const uuid = require('uuid');

class Account {
    constructor(id = uuid.v4(), name, email, password, created_at = new Date(), started, verified = false, type = 'client', twofaenabled = false, salt = null) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.created_at = created_at;
        this.started = started;
        this.verified = verified;
        this.type = type;
        this.twofaenabled = twofaenabled;
        this.salt = salt || crypto.randomBytes(32).toString('hex'); // Generar salt aleatorio si es null
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,	
            email: this.email,
            password: this.password,
            created_at: this.created_at,
            type: this.type,
            started: this.started,
            verified: this.verified,
            twofaenabled: this.twofaenabled,
            salt: this.salt
        }
    }

}

module.exports = Account;