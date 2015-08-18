var models = require( "../models/models.js" );

exports.load = function ( req, res, next, quizId ) {
    models.Quiz.find( {
        where: { id: Number( quizId ) },
        include: [ { model: models.Comment } ]
    } ).then( function ( quiz ) {
        if ( quiz ) {
            req.quiz = quiz;
            next();
        } else {
            next( new Error( "No existe quizId=" + quizId ) );
        }
    } ).catch( function ( error ) {
        next( error );
    } );
}

exports.index = function ( req, res ) {
    var search = req.query.search || "";
    search = "%" + search.replace( / /g, "%" ) + "%";
    models.Quiz.findAll( { where: [ "pregunta like ?", search ], order: "pregunta ASC" } ).then( function ( quizes ) {
        res.render( 'quizes/index', { search: req.query.search, quizes: quizes, errors: [ ] } );
    } ).catch( function ( error ) {
        next( error );
    } );
}

exports.statistics = function ( req, res ) {
    /*
     models.Quiz.count( { } ).then( function ( c ) {
     console.log( "Q:" + c );
     } );
     models.Comment.count( { } ).then( function ( c ) {
     console.log( "C:" + c );
     } );
     models.Quiz.count( {
     include: [ { model: models.Comment, required: true } ]
     } ).then( function ( c ) {
     console.log( "QwC:" + c );
     } );
     */
    var stat = {
        total_quizes: 0,
        total_comments: 0,
        total_with_comments: 0,
        total_without_comments: 0,
        avg_comments: 0
    };
    models.Quiz.findAll( {
        include: [ { model: models.Comment } ]
    } ).then( function ( quizes ) {
        for ( var n = 0; n < quizes.length; n++ ) {
            stat.total_quizes++;
            stat.total_comments += quizes[n].Comments.length;
            if ( quizes[n].Comments.length > 0 ) stat.total_with_comments++;
            else stat.total_without_comments++;
        }
        stat.avg_comments = stat.total_comments / stat.total_quizes;
        res.render( 'quizes/statistics', { stat: stat, errors: [ ] } );
    } ).catch( function ( error ) {
        next( error );
    } );
}

exports.show = function ( req, res ) {
    res.render( 'quizes/show', { quiz: req.quiz, errors: [ ] } );
}

exports.edit = function ( req, res ) {
    res.render( 'quizes/edit', { quiz: req.quiz, errors: [ ] } );
}

exports.answer = function ( req, res ) {
    if ( req.query.respuesta === req.quiz.respuesta ) {
        res.render( 'quizes/answer', { quiz: req.quiz, respuesta: 'Correcto', errors: [ ] } );
    } else {
        res.render( 'quizes/answer', { quiz: req.quiz, respuesta: 'Incorrecto', errors: [ ] } );
    }
}

exports.new = function ( req, res ) {
    var quiz = models.Quiz.build( {
        pregunta: "Pregunta",
        respuesta: "Respuesta",
        tema: "otro"
    } );

    res.render( "quizes/new", { quiz: quiz, errors: [ ] } );
}

exports.create = function ( req, res ) {
    var quiz = models.Quiz.build( req.body.quiz );

    quiz.validate().then(
            function ( err ) {
                if ( err ) {
                    res.render( "quizes/new", { quiz: quiz, errors: err.errors } )
                } else {
                    quiz.save( {
                        fields: [ "pregunta", "respuesta", "tema" ]
                    } ).then( function () {
                        res.redirect( "/quizes" );
                    } );
                }
            }
    );
}

exports.update = function ( req, res ) {
    req.quiz.pregunta = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;
    req.quiz.tema = req.body.quiz.tema;

    req.quiz.validate().then(
            function ( err ) {
                if ( err ) {
                    res.render( "quizes/edit", { quiz: req.quiz, errors: err.errors } )
                } else {
                    req.quiz.save( {
                        fields: [ "pregunta", "respuesta", "tema" ]
                    } ).then( function () {
                        res.redirect( "/quizes" );
                    } );
                }
            }
    );
}

exports.destroy = function ( req, res ) {
    req.quiz.destroy().then( function () {
        res.redirect( "/quizes" );
    } ).catch( function ( error ) {
        next( error );
    } );
}