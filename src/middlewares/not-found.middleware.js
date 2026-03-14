function notFoundMiddleware(request, response){
    return response.status(404).json({
        ok: false,
        message: "Route not found",
    });
}

module.exports = notFoundMiddleware;