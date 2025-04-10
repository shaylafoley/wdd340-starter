const serverError = (req, res, next) => {
    next({ status: 500, message: 'Server Error' });
  };
   
  module.exports = {
    serverError,
  };