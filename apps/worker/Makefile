# Relax-Git Worker Makefile

# 变量定义
BINARY_NAME=relax-git-worker
VERSION=$(shell git describe --tags --always --dirty)
COMMIT=$(shell git rev-parse --short HEAD)
DATE=$(shell date -u +%Y-%m-%dT%H:%M:%SZ)
LDFLAGS=-ldflags "-X main.version=$(VERSION) -X main.commit=$(COMMIT) -X main.date=$(DATE)"

# Go 相关变量
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod

# 默认目标
.PHONY: all
all: clean deps test build

# 安装依赖
.PHONY: deps
deps:
	$(GOMOD) download
	$(GOMOD) tidy

# 构建
.PHONY: build
build:
	$(GOBUILD) $(LDFLAGS) -o bin/$(BINARY_NAME) .

# 构建 Linux 版本
.PHONY: build-linux
build-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o bin/$(BINARY_NAME)-linux .

# 运行测试
.PHONY: test
test:
	$(GOTEST) -v ./...

# 运行测试并生成覆盖率报告
.PHONY: test-coverage
test-coverage:
	$(GOTEST) -v -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out -o coverage.html

# 清理
.PHONY: clean
clean:
	$(GOCLEAN)
	rm -rf bin/
	rm -f coverage.out coverage.html

# 运行
.PHONY: run
run:
	$(GOCMD) run .

# 格式化代码
.PHONY: fmt
fmt:
	$(GOCMD) fmt ./...

# 代码检查
.PHONY: vet
vet:
	$(GOCMD) vet ./...

# 安装工具
.PHONY: tools
tools:
	$(GOGET) -u golang.org/x/tools/cmd/goimports
	$(GOGET) -u github.com/golangci/golangci-lint/cmd/golangci-lint

# Lint 检查
.PHONY: lint
lint:
	golangci-lint run

# Docker 构建
.PHONY: docker-build
docker-build:
	docker build -t relax-git-worker:$(VERSION) .

# 帮助
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  all           - Clean, install deps, test, and build"
	@echo "  deps          - Install dependencies"
	@echo "  build         - Build the binary"
	@echo "  build-linux   - Build Linux binary"
	@echo "  test          - Run tests"
	@echo "  test-coverage - Run tests with coverage"
	@echo "  clean         - Clean build artifacts"
	@echo "  run           - Run the application"
	@echo "  fmt           - Format code"
	@echo "  vet           - Run go vet"
	@echo "  tools         - Install development tools"
	@echo "  lint          - Run linter"
	@echo "  docker-build  - Build Docker image"
	@echo "  help          - Show this help"
