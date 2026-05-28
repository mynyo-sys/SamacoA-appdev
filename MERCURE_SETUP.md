# Mercure Setup Guide for Railway

## Step 1: Deploy Mercure on Railway

1. Go to your Railway project (https://railway.app/project/your-project-id)
2. Click "New Service" → "Deploy from Docker image"
3. Enter: `dunglas/mercure:latest`
4. Click "Deploy"

## Step 2: Configure Mercure Environment Variables

After deployment, go to the Mercure service settings and add these variables:

```
MERCURE_PUBLISHER_JWT_KEY=!ChangeMeToASecureSecret!
MERCURE_SUBSCRIBER_JWT_KEY=!ChangeMeToASecureSecret!
MERCURE_EXTRA_DIRECTIVES=allow_anonymous=1;cors_allowed_origins=*
MERCURE_LOG_LEVEL=debug
```

## Step 3: Get Mercure URL

Once deployed, Railway will provide a URL like:
`https://your-mercure-service.up.railway.app`

Copy this URL - you'll need it for:
- Symfony backend configuration
- Admin dashboard
- Frontend config (if you want to use Mercure instead of polling)

## Step 4: Update Symfony Backend

### Install Mercure Bundle (if not already installed)

```bash
composer require symfony/mercure-bundle
```

### Update .env or .env.local

```env
MERCURE_URL=https://your-mercure-url.up.railway.app/.well-known/mercure
MERCURE_PUBLIC_URL=https://your-mercure-url.up.railway.app/.well-known/mercure
MERCURE_JWT_SECRET=!ChangeMeToASecureSecret!
```

### Update OrderController to Publish Events

In your Symfony backend, modify the OrderController to publish events when orders are created/updated:

```php
<?php

namespace App\Controller;

use App\Entity\Order;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Annotation\Route;

class OrderController extends AbstractController
{
    public function __construct(
        private HubInterface $mercureHub
    ) {}

    #[Route('/api/orders', name: 'create_order', methods: ['POST'])]
    public function createOrder(Request $request): JsonResponse
    {
        // ... your existing order creation logic ...
        
        // After order is created, publish to Mercure
        $update = new Update(
            'orders/new',
            json_encode([
                'id' => $order->getId(),
                'customer' => $order->getCustomer()->getEmail(),
                'customerName' => $order->getCustomer()->getFullName(),
                'total' => $order->getTotalAmount(),
                'status' => $order->getStatus(),
                'items' => array_map(function($item) {
                    return [
                        'productName' => $item->getProduct()->getName(),
                        'quantity' => $item->getQuantity(),
                        'price' => $item->getUnitPrice()
                    ];
                }, $order->getItems()->toArray()),
                'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s')
            ])
        );
        
        $this->mercureHub->publish($update);
        
        return $this->json($order, 201);
    }

    #[Route('/api/orders/{id}', name: 'update_order', methods: ['PATCH'])]
    public function updateOrder(Order $order, Request $request): JsonResponse
    {
        // ... your existing order update logic ...
        
        // Publish status update to Mercure
        $update = new Update(
            'orders/update',
            json_encode([
                'id' => $order->getId(),
                'status' => $order->getStatus(),
                'updatedAt' => $order->getUpdatedAt()->format('Y-m-d H:i:s')
            ])
        );
        
        $this->mercureHub->publish($update);
        
        return $this->json($order);
    }
}
```

## Step 5: Create Admin Dashboard

See `admin-dashboard.html` for the notification dashboard.

## Step 6: Test

1. Deploy the updated Symfony backend
2. Open the admin dashboard in your browser
3. Create an order from the mobile app
4. You should see a notification appear in the dashboard
