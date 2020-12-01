module.exports = {
  //System authentication
  ensureAuthenticated: function(req, res, next) {
    if(req.session.user && req.cookies.user_sid) {
      return next();
    } 

    console.log(req.session.user)
    console.log(req.session.user_sid)
    res.render("login", {
      validation_msg: 'Please log in to view that resource',
      alert: 'danger'
    });
  },
  forwardAuthenticated: function(req, res, next) {
    if(!req.session.user || !req.cookies.user_sid) {
      return next();
    } 

    res.redirect('/system/home');      
  }
};
