require('dotenv').config()

const development = {
    PORT: process.env.PORT || 3050,
    URL: process.env.URL || '   :',
    DBUSER: process.env.DBUSER || '',
    DBPASSWORD: process.env.DBPASSWORD || '',
    DBCLUSTER: process.env.DBCLUSTER || '',
    DBCOLLECTION: process.env.DBCOLLECTION || '',
    PRIVATEKEY: process.env.PRIVATEKEY || '',
    PUBLICKEY: process.env.PUBLICKEY || '',
    JWT_KEY: process.env.JWT_KEY || '',
    APP_ID: process.env.APP_ID || '',
    API_KEY: process.env.API_KEY || ''

}

module.exports = development

