# Lemello Webapp - Development Commands
# Usage: make <target>

.PHONY: help install test test-unit test-integration test-e2e lint type-check format format-check clean dev build start ci

help:  ## Show this help message
	@echo "Lemello Webapp - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install dependencies
	npm install

dev:  ## Run development server
	npm run dev

build:  ## Build production bundle
	npm run build

start:  ## Start production server
	npm run start

lint:  ## Run ESLint
	npm run lint

type-check:  ## Run TypeScript type check
	npm run typecheck

format:  ## Run formatter (via lint for now)
	npm run lint -- --fix

format-check:  ## Check formatting (CI)
	npm run lint

test:  ## Run all tests
	npm test

test-unit:  ## Run unit tests
	npm run test:unit

test-integration:  ## Run integration tests
	npm run test:integration

test-e2e:  ## Run end-to-end tests
	npm run test:e2e

clean:  ## Remove build artifacts and caches
	rm -rf .next/ coverage/ playwright-report/ test-results/

ci:  ## Run all CI checks (lint, type-check, test)
	@echo "Running CI checks..."
	@make format-check
	@make type-check
	@make test
	@echo "✅ All CI checks passed!"
