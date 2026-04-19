export function errorHandler(error, req, res, next) {
  console.error(`[ERR ${req?.requestId || "-"}]`, error);
  res.status(500).json({ message: "Внутренняя ошибка сервера" });
}
