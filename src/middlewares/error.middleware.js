function errorMiddleware(error, request, response, next){
    console.error(error);

    return response.status(500).json({
        ok: false,
        message: "Internal srver error",
    });
}

module.exports = errorMiddleware