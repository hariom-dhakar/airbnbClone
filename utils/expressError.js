class ExpressError extends Error{
    constructor(status,message){
        super(message);
        this.status = Number(status) || 500;
    }
}

module.exports = ExpressError;