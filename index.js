/**
 * Session store for Connect/Express, backed by nedb
 *
 * Usage:
 * var connect = require('connect')
 *   , NedbStore = require('connect-nedb-session')(connect);
 *
 * Or:
 * var express = require('express')
 *   , NedbStore = require('connect-nedb-session')(express);
 *
 * Then:
 * expressServer.use(express.session({ secret: 'yoursecret'
 *                                   , key: 'yoursessionkey'
 *                                   , cookie: { path: '/'
 *                                             , httpOnly: true
 *                                             , maxAge: 365 * 24 * 3600 * 1000   // One year for example
 *                                             }
 *                                   , store: new NedbStore({ filename: 'path_to_nedb_persistence_file' })
 *                                   }));
 */
var Nedb = require('nedb');


module.exports = function (connect) {
  /**
   * Constructor
   * @param {String} options.filename File where session data will be persisted
   * @param {Function} cp Optional callback (useful when testing)
   */
  function NedbStore(options, cb) {
    var callback = cb || function () {};

    this.filename = options.filename;
    this.db = new Nedb(options.filename);
    this.db.loadDatabase(callback);
  }

  // Inherit from Connect's session store
  NedbStore.prototype.__proto__ = connect.session.Store.prototype;


  /**
   * Get session data
   */
  NedbStore.prototype.get = function (sid, callback) {
    this.db.findOne({ sid: sid }, function (err, sess) {
      if (err) { return callback(err); }
      if (!sess) { return callback(null, null); }

      return callback(null, sess.data);
    });
  };


  /**
   * Set session data
   */
  NedbStore.prototype.set = function (sid, data, callback) {
    this.db.update({ sid: sid }, { sid: sid, data: data }, { multi: false, upsert: true }, function (err) {
      return callback(err);
    });
  };


  /**
   * Destroy a session's data
   */
  NedbStore.prototype.destroy = function (sid, callback) {
    this.db.remove({ sid: sid }, { multi: false }, function (err) {
      return callback(err);
    });
  };


  return NedbStore;
};
