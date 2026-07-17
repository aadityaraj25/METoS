/**
 * asyncHandler
 * Wraps an async route handler and forwards any errors to Express's next().
 * Works with both ES modules and CommonJS.
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export default asyncHandler;