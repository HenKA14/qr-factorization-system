package main

import "testing"

func TestQRShape(t *testing.T) {
    A := [][]float64{{1, 2}, {3, 4}, {5, 6}}
    Q, R := qrDecomposition(A)
    if len(Q) != 3 || len(Q[0]) != 2 {
        t.Fatalf("Q shape expected 3x2, got %dx%d", len(Q), len(Q[0]))
    }
    if len(R) != 2 || len(R[0]) != 2 {
        t.Fatalf("R shape expected 2x2, got %dx%d", len(R), len(R[0]))
    }
}

func TestQOrthogonality(t *testing.T) {
    A := [][]float64{{1, 2}, {3, 4}, {5, 6}}
    Q, _ := qrDecomposition(A)
    // Check columns of Q are unit length and mutually orthogonal
    for j := 0; j < len(Q[0]); j++ {
        col := getCol(Q, j)
        n := norm(col)
        if abs(n-1) > 1e-6 {
            t.Fatalf("column %d not unit length: %f", j, n)
        }
        for k := j + 1; k < len(Q[0]); k++ {
            if abs(dot(getCol(Q, j), getCol(Q, k))) > 1e-6 {
                t.Fatalf("columns %d and %d not orthogonal", j, k)
            }
        }
    }
}

func abs(x float64) float64 { if x < 0 { return -x }; return x }


