const ScreenRepository = require('../repositories/ScreenRepository');
const SeatRepository = require('../repositories/SeatRepository');
const TheatreRepository = require('../repositories/TheatreRepository');
const { sequelize } = require('../models');
const AppError = require('../utils/appError');

class ScreenService {
  async getScreensByTheatre(theatreId, user) {
    const theatre = await TheatreRepository.findById(theatreId);
    if (!theatre) {
      throw new AppError('Theatre not found', 404);
    }

    // Authorization: Owner or Admin
    if (user.role.role_name === 'Theatre Owner' && theatre.owner_id !== user.id) {
      throw new AppError('You do not have permission to view screens for this theatre', 403);
    }

    return await ScreenRepository.findByTheatre(theatreId);
  }

  async getScreenById(id, user) {
    const screen = await ScreenRepository.findById(id, { include: ['theatre', 'seats'] });
    if (!screen) {
      throw new AppError('Screen not found', 404);
    }

    // Authorization
    if (user.role.role_name === 'Theatre Owner' && screen.theatre.owner_id !== user.id) {
      throw new AppError('Access denied', 403);
    }

    return screen;
  }

  async createScreen(theatreId, data, user) {
    const theatre = await TheatreRepository.findById(theatreId);
    if (!theatre) {
      throw new AppError('Theatre not found', 404);
    }

    // Owner validation
    if (user.role.role_name === 'Theatre Owner' && theatre.owner_id !== user.id) {
      throw new AppError('You do not own this theatre', 403);
    }

    const { screen_name, rows, columns, seats_layout } = data;
    const capacity = rows * columns;

    // Use transaction for screen and seat creation
    const transaction = await sequelize.transaction();

    try {
      const screen = await ScreenRepository.create({
        theatre_id: theatreId,
        screen_name,
        capacity,
        rows,
        columns
      }, { transaction });

      // Generate seats
      const seats = [];
      const getRowLetter = (rowIndex) => {
        let letter = '';
        let temp = rowIndex;
        while (temp >= 0) {
          letter = String.fromCharCode(65 + (temp % 26)) + letter;
          temp = Math.floor(temp / 26) - 1;
        }
        return letter;
      };

      for (let r = 0; r < rows; r++) {
        const rowLetter = getRowLetter(r);
        
        // Define seat type and price based on position
        let seatType = 'Normal';
        let price = 150.00;

        // Customize types/pricing if layouts are provided, or apply default rule:
        // Last 20% of rows are Premium, last row (if rows > 4) is VIP
        if (rows > 4) {
          if (r === rows - 1) {
            seatType = 'VIP';
            price = 350.00;
          } else if (r >= rows - 3) {
            seatType = 'Premium';
            price = 220.00;
          }
        } else if (rows > 1) {
          if (r === rows - 1) {
            seatType = 'Premium';
            price = 220.00;
          }
        }

        // Custom override via request body if present
        if (seats_layout && seats_layout[rowLetter]) {
          seatType = seats_layout[rowLetter].type || seatType;
          price = seats_layout[rowLetter].price || price;
        }

        for (let c = 1; c <= columns; c++) {
          seats.push({
            screen_id: screen.id,
            seat_number: `${rowLetter}-${c}`,
            seat_type: seatType,
            price: price
          });
        }
      }

      await SeatRepository.bulkCreateSeats(seats, { transaction });

      await transaction.commit();
      return screen;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async updateScreen(id, data, user) {
    const screen = await ScreenRepository.findById(id, { include: ['theatre'] });
    if (!screen) {
      throw new AppError('Screen not found', 404);
    }

    if (user.role.role_name === 'Theatre Owner' && screen.theatre.owner_id !== user.id) {
      throw new AppError('Access denied', 403);
    }

    const { screen_name, rows, columns, custom_seats } = data;
    const updatePayload = { screen_name };

    if (custom_seats && Array.isArray(custom_seats)) {
      // Calculate dimensions and capacity from visual custom_seats array
      const uniqueRows = new Set();
      let maxCol = 1;
      custom_seats.forEach(s => {
        const parts = s.seat_number.split('-');
        const rowLetter = parts[0] || 'A';
        const colNum = parseInt(parts[1] || 1, 10);
        uniqueRows.add(rowLetter);
        if (colNum > maxCol) maxCol = colNum;
      });

      updatePayload.rows = uniqueRows.size || 1;
      updatePayload.columns = maxCol || 1;
      updatePayload.capacity = custom_seats.length;

      const transaction = await sequelize.transaction();
      try {
        const updatedScreen = await ScreenRepository.update(id, updatePayload, { transaction });

        // Delete old seats
        const SeatModel = require('../models').Seat;
        await SeatModel.destroy({ where: { screen_id: id }, force: true, transaction });

        // Insert new custom seats
        const seatsData = custom_seats.map(s => ({
          screen_id: id,
          seat_number: s.seat_number,
          seat_type: s.seat_type || 'Normal',
          price: s.price || 150.00
        }));

        await SeatRepository.bulkCreateSeats(seatsData, { transaction });
        await transaction.commit();
        return updatedScreen;
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } else if (rows || columns) {
      const newRows = rows || screen.rows;
      const newColumns = columns || screen.columns;
      const capacity = newRows * newColumns;

      updatePayload.rows = newRows;
      updatePayload.columns = newColumns;
      updatePayload.capacity = capacity;

      const transaction = await sequelize.transaction();
      try {
        const updatedScreen = await ScreenRepository.update(id, updatePayload, { transaction });

        // Delete old seats
        const SeatModel = require('../models').Seat;
        await SeatModel.destroy({ where: { screen_id: id }, force: true, transaction });

        // Generate new seats
        const seats = [];
        const getRowLetter = (rowIndex) => {
          let letter = '';
          let temp = rowIndex;
          while (temp >= 0) {
            letter = String.fromCharCode(65 + (temp % 26)) + letter;
            temp = Math.floor(temp / 26) - 1;
          }
          return letter;
        };

        for (let r = 0; r < newRows; r++) {
          const rowLetter = getRowLetter(r);
          let seatType = 'Normal';
          let price = 150.00;

          if (newRows > 4) {
            if (r === newRows - 1) {
              seatType = 'VIP';
              price = 350.00;
            } else if (r >= newRows - 3) {
              seatType = 'Premium';
              price = 220.00;
            }
          } else if (newRows > 1) {
            if (r === newRows - 1) {
              seatType = 'Premium';
              price = 220.00;
            }
          }

          for (let c = 1; c <= newColumns; c++) {
            seats.push({
              screen_id: id,
              seat_number: `${rowLetter}-${c}`,
              seat_type: seatType,
              price: price
            });
          }
        }

        await SeatRepository.bulkCreateSeats(seats, { transaction });
        await transaction.commit();
        return updatedScreen;
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } else {
      return await ScreenRepository.update(id, updatePayload);
    }
  }

  async deleteScreen(id, user) {
    const screen = await ScreenRepository.findById(id, { include: ['theatre'] });
    if (!screen) {
      throw new AppError('Screen not found', 404);
    }

    if (user.role.role_name === 'Theatre Owner' && screen.theatre.owner_id !== user.id) {
      throw new AppError('Access denied', 403);
    }

    return await ScreenRepository.delete(id);
  }
}

module.exports = new ScreenService();
