module.exports = function(app, passport) {
  app.get('/success', function(req, res){
    res.json({'status': '200'});
  });

  app.get('/fail', function(req, res){
    res.json({'status': '404'});
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/success',
    failureRedirect: '/fail',
    failureFlash: false
  }));

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/success',
    failureRedirect: '/fail',
    failureFlash: false
  }));
};
