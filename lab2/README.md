# Lab 2: Асинхронна комунікація з RabbitMQ

## Огляд

Ця лабораторна робота демонструє **асинхронну комунікацію** між мікросервісами за допомогою **RabbitMQ** як брокера повідомлень. Реалізовано **request-reply pattern** для порівняння з синхронною HTTP комунікацією з Lab 1.

## Архітектура

```
┌─────────────────┐     HTTP (sync)      ┌─────────────────┐
│                 │ ──────────────────── │                 │
│    Consumer     │                      │    Provider     │
│    Service      │     RabbitMQ         │    Service      │
│                 │ ◄──────────────────► │                 │
│   (port 3000)   │   (request-reply)    │   (port 3001)   │
└─────────────────┘                      └─────────────────┘
        │                                        │
        │                                        │
        └────────────────┬───────────────────────┘
                         │
                  ┌──────▼──────┐
                  │  RabbitMQ   │
                  │ (port 5672) │
                  │ UI: 15672   │
                  └─────────────┘
```

## Компоненти

### 1. Consumer Service (порт 3000)

**Синхронний ендпоінт:**

- `POST /compute` - HTTP запит до Provider Service

**Асинхронний ендпоінт:**

- `POST /async/compute` - RabbitMQ request-reply pattern

### 2. Provider Service (порт 3001)

- `POST /compute` - HTTP ендпоінт для синхронних запитів
- **ComputeListener** - слухає чергу `compute_queue` для асинхронних запитів

## Request-Reply Pattern

### Як це працює:

1. **Consumer** створює унікальний `correlationId` для кожного запиту
2. **Consumer** створює тимчасову чергу для відповіді (`replyTo`)
3. **Consumer** відправляє повідомлення в `compute_queue` з `correlationId` та `replyTo`
4. **Provider** отримує повідомлення, обробляє його
5. **Provider** відправляє відповідь в чергу `replyTo` з тим самим `correlationId`
6. **Consumer** отримує відповідь та повертає результат клієнту

### Переваги:

- **Loose coupling** - сервіси не залежать один від одного напряму
- **Reliability** - повідомлення зберігаються в черзі
- **Scalability** - легко масштабувати Provider горизонтально

## Метрики часу

Обидва типи комунікації вимірюють:

| Метрика                     | Опис                                    |
| --------------------------- | --------------------------------------- |
| `internalComputationTimeMs` | Час обчислення на Provider              |
| `internalNetworkLatencyMs`  | Мережева затримка (total - computation) |
| `internalTotalTimeMs`       | Загальний час обробки запиту            |
| `e2eTimeMs`                 | End-to-end час (вимірюється в тестах)   |

## Запуск

### Docker Compose

```bash
cd lab2
docker-compose up -d --build
```

### Тестування

```bash
cd lab2/tests
./test.sh
```

## API Endpoints

### Синхронний (HTTP)

```bash
curl -X POST http://localhost:3000/compute \
  -H "Content-Type: application/json" \
  -d '{"taskType": "fib", "data": [30]}'
```

### Асинхронний (RabbitMQ)

```bash
curl -X POST http://localhost:3000/async/compute \
  -H "Content-Type: application/json" \
  -d '{"taskType": "fib", "data": [30]}'
```

## Порівняння комунікації Sync vs Async

| Аспект            | Sync (HTTP)                       | Async (RabbitMQ)                  |
| ----------------- | --------------------------------- | --------------------------------- |
| **Зв'язок**       | Прямий                            | Через брокер                      |
| **Надійність**    | Залежить від доступності Provider | Повідомлення зберігаються в черзі |
| **Масштабування** | Потрібен load balancer            | Вбудоване через черги             |
| **Latency**       | Нижча для простих запитів         | Вища через брокер                 |
| **Складність**    | Простіша                          | Складніша інфраструктура          |

## Переваги RabbitMQ над HTTP

Для одного Consumer + одного Provider throughput буде приблизно однаковий, оскільки Node.js в обох випадках використовує non-blocking I/O. Реальні переваги RabbitMQ проявляються в інших аспектах:

### 1. Decoupling (розв'язка)

- **HTTP**: Consumer чекає на конкретний Provider
- **RabbitMQ**: Consumer не знає, хто саме обробить запит

### 2. Horizontal Scaling

RabbitMQ автоматично розподіляє повідомлення між кількома інстансами Provider. Не потрібен окремий load balancer.

### 3. Reliability (надійність)

- **HTTP**: якщо Provider недоступний — запит втрачено
- **RabbitMQ**: повідомлення залишається в черзі до успішної обробки

### 4. Backpressure

- **HTTP**: при перевантаженні Provider — timeout або error
- **RabbitMQ**: черга зберігає запити, Provider обробляє у своєму темпі

## Горизонтальне масштабування

Для масштабування Provider Service:

```yaml
# docker-compose.yml
provider-service:
  deploy:
    replicas: 3
```

RabbitMQ автоматично розподіляє повідомлення між інстансами.
