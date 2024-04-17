// [GET] /login
module.exports.login = async (req, res, next) => {
  res.render('client/pages/auth/login', {
    pageTitle: 'Login',
    activeTab: 'login'
  })
}