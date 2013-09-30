
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' , visitantes: res.locals.visitas});
};