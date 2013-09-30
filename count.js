var cont=0;


exports.getCount = function(req, res, next) {
	console.log("Visitas: "+cont);
	res.locals.visitas = cont;
	next();
	};

exports.uptoCount = function (req, res, next){
	cont++;
	next();
};