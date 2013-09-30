
var models = require('../models/models.js');

/*
*  Auto-loading con app.param
*/
exports.load = function(req, res, next, id) {

   models.Favourite
        .find({where: {id: Number(id)}})
        .success(function(post) {
            if (favourite) {
                req.favourite = favourite;
                next();
            } else {
                req.flash('error', 'No existe el favorito con id='+id+'.');
                next('No existe el favorito con id='+id+'.');
            }
        })
        .error(function(error) {
            next(error);
        });
};

// GET /users/25/favourites
exports.index = function(req, res, next) {

  var format = req.params.format || 'html';
  format = format.toLowerCase();

// Busqueda del array de posts favoritos de un usuario

  models.Favourite.findAll( { where: { userId: req.user.id } } )
     .success(function(favourites) {

         // generar array con postIds de los post favoritos

         var postIds = favourites.map( 
                            function(favourite) 
                              {return favourite.postId;}
                           );

        // busca los posts identificados por array postIds

        var patch;

        if (postIds.length == 0) {
            patch= '"Posts"."id" in (NULL)';
        } else {
            patch='"Posts"."id" in ('+postIds.join(',')+')';
        } 

        // busca los posts identificados por array postIds

        models.Post.findAll( { order: 'updatedAt DESC',

                    where: patch, 

                    include:[ { model:models.User,as:'Author' },
                    models.Favourite ]
                 } )
                 .success(function(posts) {

            switch (format) { 
              case 'html':
              case 'htm':
                  res.render('favourites/index', {
                    posts: posts, visitantes: res.locals.visitas
                  });
                  break;
              case 'json':
                  res.send(posts);
                  break;
              case 'xml':
                  res.send(posts_to_xml(posts));
                  break;
              case 'txt':
                  res.send(posts.map(function(post) {
                      return post.title+' ('+post.body+')';
                  }).join('\n'));
                  break;
              default:
                  console.log('No se soporta el formato \".'+format+'\" pedido para \"'+req.url+'\".');
                  res.send(406);
            }
        })
        .error(function(error) {
            next(error);
        })
      })
      .error(function(error) {
        next(error);
      });
   };


function posts_to_xml(posts) {

    var builder = require('xmlbuilder');
    var xml = builder.create('favourites')
    for (var i in posts) {
        xml.ele('favourite')
              .ele('id')
                 .txt(posts[i].id)
                 .up()
              .ele('userId')
                 .txt(posts[i].userId)
                 .up()
              .ele('postId')
                 .txt(posts[i].postId)
                 .up()
              .ele('createdAt')
                 .txt(posts[i].createdAt)
                 .up()
              .ele('updatedAt')
                 .txt(posts[i].updatedAt);
    }
    return xml.end({pretty: true});
}



// PUT /users/:userid/favourites/:postid
exports.update = function(req, res, next) {

    var favourite = models.Favourite.build(
        { userId: req.session.user.id,
          postId: req.post.id
        });
    
    favourite.save()
        .success(function() {
            req.flash('success', 'Post añadido a la lista de favoritos.');
            res.redirect('/users/'+req.session.user.id+'/favourites');
        })
        .error(function(error) {
            next(error);
        });
};

// DELETE /users/:userid/favourites/:postid
exports.destroy = function(req, res, next) {

    models.Favourite
    .find({ where: {postId: req.post.id,
                       userId: req.session.user.id}
            })
    .success(function(favourites) {
      favourites.destroy()
      .success(function() {
        req.flash('success', 'Post eliminado de favoritos.');
        res.redirect('/posts/'+req.post.id);
        })
        .error(function(error) {
            next(error);
        });
    })
    .error(function(error) {
            next(error);
    });
};
