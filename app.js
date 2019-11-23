var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var databaseRouter = require('./routes/database');
var objectStorageRouter = require('./routes/objectstorage');
var googleRouter = require('./routes/google');
var watsonDiscoveryRouter = require('./routes/watsondiscovery');
var watsonAssistantRouter = require('./routes/watsonassistant');
var watsonNaturalLanguageClassifier = require('./routes/watson_natural_language_classifier');
var watsonNaturalLanguageUnderstanding = require('./routes/watson_natural_language_understanding');
var dbpedia = require('./routes/dbpedia');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/database', databaseRouter);
app.use('/objectStorage', objectStorageRouter);
app.use('/google', googleRouter);
app.use('/watsonDiscovery', watsonDiscoveryRouter);
app.use('/watsonAssistant', watsonAssistantRouter);
app.use('/watsonNaturalLanguageClassifier', watsonNaturalLanguageClassifier);
app.use('/watsonNaturalLanguageUnderstanding', watsonNaturalLanguageUnderstanding);
app.use('/dbpedia', dbpedia);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
