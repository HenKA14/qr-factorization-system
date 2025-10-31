FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copiamos solo go.mod primero para resolver dependencias sin arrastrar un go.sum inválido
COPY go.mod ./
RUN go mod download

# Ahora copiamos el resto del código (incluido go.sum si existe) y normalizamos dependencias
COPY . .
# Forzamos regeneración limpia de go.sum para evitar conflictos de checksum
RUN rm -f go.sum && go mod tidy

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server ./

FROM gcr.io/distroless/base-debian12

WORKDIR /

ENV PORT=8080

COPY --from=builder /app/server /server
COPY --from=builder /app/docs /docs

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/server"]


