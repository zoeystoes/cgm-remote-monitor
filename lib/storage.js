'use strict';

var mongodb = require('mongodb');

var connection = null;

function init (env, cb, forceNewConnection) {
  var MongoClient = mongodb.MongoClient;
  var mongo = {};

  function maybe_connect (cb) {

    if (connection != null && !forceNewConnection) {
      console.log('Reusing MongoDB connection handler');
      // If there is a valid callback, then return the Mongo-object
      mongo.db = connection;

      if (cb && cb.call) {
        cb(null, mongo);
      }
    } else {
      if (!env.mongo) {
        throw new Error('MongoDB connection string is missing');
      }

      console.log('Setting up new connection to MongoDB');
      var timeout =  30 * 1000;
      var options = { replset: { socketOptions: { connectTimeoutMS : timeout, socketTimeoutMS : timeout }}};

      MongoClient.connect(env.mongo, options, function connected(err, db) {
        if (err) {
          console.log('Error connecting to MongoDB, ERROR: %j', err);
          throw err;
        } else {
          console.log('Successfully established a connected to MongoDB');
        }

        connection = db;

        mongo.db = connection;

        // If there is a valid callback, then invoke the function to perform the callback
        if (cb && cb.call) {
          cb(err, mongo);
        }
      });
    }
  }

  mongo.collection = function get_collection (name) {
    return connection.collection(name);
  };

  mongo.with_collection = function with_collection (name) {
    return function use_collection(fn) {
      fn(null, connection.collection(name));
    };
  };

  mongo.limit = function limit (opts) {
    if (opts && opts.count) {
      return this.limit(parseInt(opts.count));
    }
    return this;
  };

  mongo.ensureIndexes = function ensureIndexes (collection, fields) {
    fields.forEach(function (field) {
      console.info('ensuring index for: ' + field);
      collection.ensureIndex(field, function (err) {
        if (err) {
          console.error('unable to ensureIndex for: ' + field + ' - ' + err);
        }
      });
    });
  };

  return maybe_connect(cb);
}

module.exports = init;
