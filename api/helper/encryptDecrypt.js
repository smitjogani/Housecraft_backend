// Basic initialization
const { Crypt } = require('hybrid-crypto-js')
const crypt = new Crypt()
const config = require('../../config')

const AsymmetricEncrypt = {}

AsymmetricEncrypt.encrypt = (message) => {
    try{
        return crypt.encrypt(config.PUBLICKEY, message)
    } catch (error) {
        return error
    }
}

AsymmetricEncrypt.decrypt = (message) => {
    try{
        return crypt.decrypt(config.PRIVATEKEY, message).message
    } catch(error){
        return error
    }
}

module.exports = AsymmetricEncrypt