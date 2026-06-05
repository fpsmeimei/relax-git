package health

import (
	"testing"
	"time"

	"github.com/rs/zerolog"
)

func TestNewHealthServerConfiguresTimeouts(t *testing.T) {
	server := NewHealthServer(nil, zerolog.Nop(), 0, "test")

	if server.server.ReadHeaderTimeout <= 0 {
		t.Fatalf("expected ReadHeaderTimeout to be set")
	}
	if server.server.ReadTimeout <= 0 {
		t.Fatalf("expected ReadTimeout to be set")
	}
	if server.server.WriteTimeout <= 0 {
		t.Fatalf("expected WriteTimeout to be set")
	}
	if server.server.IdleTimeout <= 0 {
		t.Fatalf("expected IdleTimeout to be set")
	}
	if server.server.ReadHeaderTimeout > 10*time.Second {
		t.Fatalf("ReadHeaderTimeout is too high for a local health server")
	}
}
