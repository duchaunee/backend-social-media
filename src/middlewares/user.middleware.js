export const resetPasswordMiddleware = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      next(new Error("Provide required email !"));
      return;
    }
    req.email = { email };
    //return ben tren de no k nhay vao ben duoi nay nua
    next();
  } catch (error) {
    console.log(error);
    next(new Error(error.message));
  }
};
