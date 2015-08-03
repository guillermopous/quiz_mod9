var models = require( "../models/models.js" );

exports.load = function ( req, res, next, quizId ) {
    models.Quiz.find( quizId ).then( function ( quiz ) {
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
        respuesta: "Respuesta"
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
                        fields: [ "pregunta", "respuesta" ]
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

    req.quiz.validate().then(
            function ( err ) {
                if ( err ) {
                    res.render( "quizes/edit", { quiz: req.quiz, errors: err.errors } )
                } else {
                    req.quiz.save( {
                        fields: [ "pregunta", "respuesta" ]
                    } ).then( function () {
                        res.redirect( "/quizes" );
                    } );
                }
            }
    );
}