const errorMiddleware = (err, req, res, next) => {
  // console.log(err);
  console.log("Error in `error middleware`: ", err.message);
  res.status(404).send({
    message: err.message,
  });
};

export default errorMiddleware;
