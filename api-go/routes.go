package main

import (
	"github.com/gofiber/fiber/v2"
)

func registerQRRoutes(app *fiber.App) {
	app.Post("/qr", handleQR)
}


