const config = require('../../config')
const moment = require('moment')
const fs = require('fs')

const Helper = {}

Helper.writeErrorLog = async (req, error) => {
  const requestURL = req.protocol + '://' + req.get('host') + req.originalUrl
  const requestBody = JSON.stringify(req.body)
  const date = moment().format('MMMM Do YYYY, h:mm:ss a')
  fs.appendFileSync(
    'errorLog.log',
    'REQUEST DATE : ' +
    date +
    '\n' +
    'API URL : ' +
    requestURL +
    '\n' +
    'API PARAMETER : ' +
    requestBody +
    '\n' +
    'Error : ' +
    error +
    '\n\n'
  )
}

Helper.getPaginationValues = async (totalDocs, limit, page) => {
  const paginationValues = {
    totalDocs,
    limit,
    page,
    totalPages: totalDocs % limit === 0 ? totalDocs / limit : Math.floor((totalDocs / limit)) + 1,
    pagingCounter: ((page - 1) * limit) + 1,
    hasPrevPage: page !== 1,
    hasNextPage: !(page * limit >= totalDocs),
    prevPage: page === 1 ? null : page - 1,
    nextPage: page * limit >= totalDocs ? null : page + 1
  }
  return paginationValues
}

Helper.getIp = (req) => {
  try {
    let ip = req.header('x-forwarded-for') ? req.header('x-forwarded-for').split(',') : []
    ip = ip[0] || req.connection.remoteAddress
    return ip
  } catch (error) {

    return req.connection.remoteAddress

  }
}

Helper.removeSpaces = (str) => {
  try {
    if (typeof str !== 'string') return null
    return str.split(' ').join('_')
  } catch (err) {
    return err
  }
}

Helper.getValidImageUrl = async (filename, name = 'SH') => {


  if (filename?.includes(config.URL)) {
    var filename = filename.replace(config.URL, '');
  }

  if (filename === '' || filename === undefined || filename === null) {
    filename =
      'https://ui-avatars.com/api/?name=' +
      name +
      '&rounded=true&background=c39a56&color=fff'
  }
  else {
    if ((filename.search('https://') < 0) && (filename.search('http://') < 0)) filename = config.URL + filename
  }

  return filename.replaceAll(' ', '_').replace(/\\/g, '/')
}




module.exports = Helper