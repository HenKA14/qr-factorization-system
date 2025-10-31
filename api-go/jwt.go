package main

import (
    "errors"
    "os"
    "strings"

    "github.com/gofiber/fiber/v2"
    jwtv5 "github.com/golang-jwt/jwt/v5"
)

func jwtMiddleware() fiber.Handler {
    secret := os.Getenv("JWT_SECRET")
    return func(c *fiber.Ctx) error {
        // Allow health without token
        if c.Path() == "/health" || c.Path() == "/docs" || c.Path() == "/docs/ui" {
            return c.Next()
        }
        auth := c.Get("Authorization")
        if auth == "" {
            return fiber.NewError(fiber.StatusUnauthorized, "missing Authorization header")
        }
        parts := strings.SplitN(auth, " ", 2)
        if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
            return fiber.NewError(fiber.StatusUnauthorized, "invalid Authorization format")
        }
        tokenStr := parts[1]
        _, err := jwtv5.Parse(tokenStr, func(t *jwtv5.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwtv5.SigningMethodHMAC); !ok {
                return nil, errors.New("unexpected signing method")
            }
            return []byte(secret), nil
        })
        if err != nil {
            return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
        }
        return c.Next()
    }
}


