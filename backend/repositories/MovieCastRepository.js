const BaseRepository = require('./BaseRepository');
const { MovieCast } = require('../models');

class MovieCastRepository extends BaseRepository {
  constructor() {
    super(MovieCast);
  }
}

module.exports = new MovieCastRepository();
