package main

import (
    "log"
    "os"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()

    app.Use(cors.New())
    app.Use(jwtMiddleware())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

    app.Get("/docs", func(c *fiber.Ctx) error {
        return c.SendFile("/docs/swagger.json", true)
    })
    app.Get("/docs/ui", func(c *fiber.Ctx) error {
        c.Type("html")
        return c.SendString(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Go QR API - Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({ url: '/docs', dom_id: '#swagger' });
    </script>
  </body>
</html>`)
    })

	registerQRRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("api-go listening on :%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}


