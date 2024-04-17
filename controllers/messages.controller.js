// [GET] /
module.exports.index = async (req, res, next) => {
  res.render('client/pages/messages/index', {
    pageTitle: 'Messages',
    activeTab: 'messages'
  })
}