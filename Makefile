.PHONY: dev prod build logs logs-dev logs-prod down clean ps

COMPOSE ?= docker compose

dev:
	$(COMPOSE) up -d dev

prod:
	$(COMPOSE) up -d --build prod

build:
	$(COMPOSE) build prod

logs:
	$(COMPOSE) logs -f

logs-dev:
	$(COMPOSE) logs -f dev

logs-prod:
	$(COMPOSE) logs -f prod

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down --volumes --remove-orphans

ps:
	$(COMPOSE) ps
