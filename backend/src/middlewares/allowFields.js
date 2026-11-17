export default function allowFields(...fields) {
  return (req, res, next) => {
    const body = req.body ?? {};

    if (typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "Invalid request body." });
    }

    const forbidden = Object.keys(body).filter((key) => !fields.includes(key));

    if (forbidden.length) {
      return res
        .status(400)
        .json({ error: `Fields not allowed: ${forbidden.join(", ")}` });
    }

    return next();
  };
}
