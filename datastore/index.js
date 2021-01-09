const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

Promise.promisifyAll(fs);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
      if (err) {
        callback(new Error('Create went wrong'));
      } else {
        callback(null, {id, text});
      }
    });
  });
};

exports.readAll = (callback) => {
  return fs.readdirAsync(exports.dataDir)
    .then((files) => {

      return _.map(files, (file) => {
        var id = file.slice(0, 5);
        return fs.readFileAsync(path.join(exports.dataDir, `${id}.txt`), 'utf8')
          .then(text => {
            return {id, text};
          })
          .catch(err => {
            callback(new Error('Cannot read mapped file'));
          });
      });
    })
    .then((todos) => {
      return Promise.all(todos);
    })
    .then((todos) => {
      callback(null, todos);
    })
    .catch(err => {
      callback(new Error('Read all not working'));
    });
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), 'utf8', (err, text) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
        if (err) {
          callback(new Error('No dir at: dataDir'));
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(path.join(exports.dataDir, `${id}.txt`), (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
