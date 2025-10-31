package main

import (
    "bytes"
    "encoding/json"
    "errors"
    "math"
    "net/http"
    "os"

    "github.com/gofiber/fiber/v2"
)

type qrRequest struct {
	Matrix [][]float64 `json:"matrix"`
}

type qrResponse struct {
	Q [][]float64 `json:"Q"`
	R [][]float64 `json:"R"`
	Stats any      `json:"stats,omitempty"`
}

func handleQR(c *fiber.Ctx) error {
	var req qrRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if err := validateMatrix(req.Matrix); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	Q, R := qrDecomposition(req.Matrix)

	resp := qrResponse{Q: Q, R: R}

    // Optional: forward to Node API if configured
	nodeURL := os.Getenv("NODE_API_URL")
	if nodeURL != "" {
        // forward incoming bearer token to Node
        authHeader := string(c.Request().Header.Peek("Authorization"))
        stats, err := fetchStats(nodeURL, authHeader, [][]float64{}, Q, R)
		if err == nil {
			resp.Stats = stats
		}
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

func validateMatrix(m [][]float64) error {
	if len(m) == 0 {
		return errors.New("matrix must not be empty")
	}
	cols := len(m[0])
	if cols == 0 {
		return errors.New("matrix must have at least one column")
	}
	for i := range m {
		if len(m[i]) != cols {
			return errors.New("matrix must be rectangular")
		}
	}
	return nil
}

// Classical Gram-Schmidt QR for an m x n (m>=n) matrix
func qrDecomposition(a [][]float64) ([][]float64, [][]float64) {
	m := len(a)
	n := len(a[0])

	// Copy A into a working slice of column vectors
	Q := make([][]float64, m)
	for i := range Q {
		Q[i] = make([]float64, n)
	}
	R := make([][]float64, n)
	for i := range R {
		R[i] = make([]float64, n)
	}

	// v_j = a_j
	for j := 0; j < n; j++ {
		vj := make([]float64, m)
		for i := 0; i < m; i++ {
			vj[i] = a[i][j]
		}
		// subtract projections on previous q_k
		for k := 0; k < j; k++ {
			proj := dot(getCol(Q, k), vj)
			R[k][j] = proj
			for i := 0; i < m; i++ {
				vj[i] -= proj * Q[i][k]
			}
		}
		// r_jj = ||v_j||
		rjj := norm(vj)
		R[j][j] = rjj
		if rjj == 0 {
			// Degenerate; leave zero column
			continue
		}
		// q_j = v_j / r_jj
		for i := 0; i < m; i++ {
			Q[i][j] = vj[i] / rjj
		}
	}

	return Q, R
}

func getCol(M [][]float64, col int) []float64 {
	m := len(M)
	res := make([]float64, m)
	for i := 0; i < m; i++ {
		res[i] = M[i][col]
	}
	return res
}

func dot(a, b []float64) float64 {
	s := 0.0
	for i := range a {
		s += a[i] * b[i]
	}
	return s
}

func norm(a []float64) float64 {
	s := 0.0
	for _, v := range a {
		s += v * v
	}
	return math.Sqrt(s)
}

// fetchStats posts Q and R matrices to the Node.js service to get stats
func fetchStats(baseURL string, authorizationHeader string, matrices ...[][]float64) (any, error) {
	client := &http.Client{}
	payload := struct {
		Matrices [][][]float64 `json:"matrices"`
	}{Matrices: matrices}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest(http.MethodPost, baseURL+"/stats", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
    if authorizationHeader != "" {
        req.Header.Set("Authorization", authorizationHeader)
    }
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	var out any
	decoder := json.NewDecoder(res.Body)
	if err := decoder.Decode(&out); err != nil {
		return nil, err
	}
	return out, nil
}


