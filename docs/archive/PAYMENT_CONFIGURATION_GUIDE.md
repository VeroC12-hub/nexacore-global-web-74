# Payment Configuration Guide

## Overview
This guide explains how to configure payment methods in your NexaCore admin dashboard for both admin settings and client payment options.

## How It Works

### Current System Architecture
- **Admin Dashboard**: Configure payment methods with API keys, fees, and settings
- **Client Portal**: Automatically displays only enabled payment methods from admin configuration
- **Synchronization**: Payment methods are synchronized between admin and client portals in real-time

### Available Payment Methods

#### 1. Credit/Debit Card Processing
**Type**: `card`
**Icon**: Credit Card
**Description**: Accept Visa, Mastercard, American Express, etc.

**Configuration Steps**:
1. Choose processor (Stripe, Square, or other)
2. Add API keys (publishable key, secret key)
3. Configure webhook endpoints
4. Set processing fees (default: 2.9% + $0.30)
5. Test the integration

**Required Fields**:
- API Key: Your payment processor's API key
- Webhook Secret: For secure payment notifications
- Configuration JSON:
```json
{
  "processor": "stripe",
  "publishable_key": "pk_live_...",
  "webhook_endpoint": "https://yourdomain.com/webhooks/stripe",
  "supported_cards": ["visa", "mastercard", "amex"]
}
```

#### 2. PayPal Integration
**Type**: `paypal`
**Icon**: Wallet
**Description**: PayPal account payments

**Configuration Steps**:
1. Create PayPal Business account
2. Get Client ID from PayPal Developer Dashboard
3. Configure webhook for payment notifications
4. Set fees (default: 3.49% + $0.49)

**Required Fields**:
- API Key: PayPal Client ID
- Webhook Secret: PayPal webhook secret
- Configuration JSON:
```json
{
  "client_id": "your_paypal_client_id",
  "sandbox": false,
  "webhook_id": "webhook_id_from_paypal"
}
```

#### 3. Bank Transfer (ACH/Wire)
**Type**: `bank_transfer`
**Icon**: Building
**Description**: Direct bank transfers

**Configuration Steps**:
1. Provide your business banking details
2. Set up manual verification process
3. Configure automatic email notifications
4. No processing fees (default)

**Required Fields**:
- Configuration JSON:
```json
{
  "bank_name": "Your Bank Name",
  "account_number": "****1234",
  "routing_number": "021000021",
  "account_holder": "NexaCore Innovations",
  "instructions": "Please include invoice number in transfer description"
}
```

#### 4. Mobile Money
**Type**: `mobile_money`
**Icon**: Smartphone
**Description**: M-Pesa, MTN Mobile Money, Airtel Money

**Configuration Steps**:
1. Register with mobile money providers
2. Get merchant codes for each provider
3. Set up callback URLs for payment confirmation
4. Configure fees (default: 1.5%)

**Required Fields**:
- API Key: Merchant code
- Configuration JSON:
```json
{
  "providers": ["mpesa", "mtn", "airtel"],
  "merchant_code": "your_merchant_code",
  "callback_url": "https://yourdomain.com/webhooks/mobile-money"
}
```

#### 5. Cryptocurrency
**Type**: `crypto`
**Icon**: Globe
**Description**: Bitcoin, Ethereum, USDC payments

**Configuration Steps**:
1. Set up crypto wallets for each currency
2. Configure wallet addresses
3. Set up blockchain monitoring
4. Network fees apply

**Required Fields**:
- Configuration JSON:
```json
{
  "supported_currencies": ["BTC", "ETH", "USDC"],
  "wallet_addresses": {
    "BTC": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "ETH": "0x742E5B3e9c6Ad70f42A8F5EcE79B43c0A1BfaE1f",
    "USDC": "0x742E5B3e9c6Ad70f42A8F5EcE79B43c0A1BfaE1f"
  },
  "confirmation_blocks": {
    "BTC": 3,
    "ETH": 12,
    "USDC": 12
  }
}
```

## Step-by-Step Configuration Process

### 1. Access Payment Configuration
1. Log in to Admin Dashboard
2. Navigate to Settings tab
3. Locate "Payment Methods" section (admin-only access)
4. Click "Add Payment Method"

### 2. Basic Configuration
1. **Payment Method Name**: Display name for clients (e.g., "Credit Card", "PayPal")
2. **Type**: Select from dropdown (card, paypal, bank_transfer, mobile_money, crypto)
3. **Description**: Brief description shown to clients
4. **Processing Time**: How long payments take (e.g., "Instant", "1-3 business days")
5. **Fees**: Fee structure (e.g., "2.9% + $0.30", "No fees")

### 3. Advanced Configuration
1. **API Key**: Your payment processor's API key (encrypted storage)
2. **Webhook Secret**: For secure payment notifications (encrypted)
3. **JSON Configuration**: Detailed settings specific to payment method
4. **Enable/Disable**: Toggle payment method availability

### 4. Testing and Verification
1. Save configuration
2. Test payment method with small amount
3. Verify webhook notifications work
4. Check client portal displays correctly
5. Monitor payment processing

## Security Features

### Encryption and Security
- All API keys stored encrypted in database
- Webhook secrets protected with industry standards
- API keys masked in admin interface (show only last 4 characters)
- Role-based access (admin-only for payment configuration)
- Multi-step security verification for sensitive operations

### Access Control
- Only admin users can configure payment methods
- Operations managers, project managers blocked from payment config
- Secure password verification for critical changes
- Audit logging for all payment configuration changes

## Client Experience

### What Clients See
1. **Invoice Payment Modal**: Shows only enabled payment methods
2. **Dynamic Options**: Payment methods update based on admin configuration
3. **Method Details**: Fees and processing times from admin settings
4. **Secure Processing**: All payments processed through configured systems
5. **Status Updates**: Real-time payment confirmations

### Payment Flow
1. Client receives invoice
2. Clicks "Pay Now" button
3. Sees only admin-enabled payment methods
4. Selects payment method
5. Enters payment details
6. Payment processed through configured system
7. Automatic notifications and project updates

## Troubleshooting

### Common Issues
1. **Payment method not showing**: Check if enabled in admin settings
2. **API errors**: Verify API keys are correct and not expired
3. **Webhook failures**: Check webhook URL is accessible
4. **Processing delays**: Review payment processor status

### Support and Maintenance
- Regularly update API keys before expiration
- Monitor payment success rates
- Review and update fees as needed
- Test integrations after any changes
- Keep backup payment methods active

## Best Practices

### Configuration Recommendations
1. **Multiple Methods**: Offer 2-3 payment options for flexibility
2. **Clear Descriptions**: Use client-friendly language
3. **Accurate Fees**: Keep fee information up to date
4. **Test Regularly**: Verify all methods work correctly
5. **Monitor Usage**: Track which methods clients prefer

### Security Best Practices
1. Use production API keys only in live environment
2. Regularly rotate webhook secrets
3. Monitor for suspicious payment activity
4. Keep payment processor integrations updated
5. Maintain PCI compliance where required

This comprehensive system ensures that your payment configuration is secure, flexible, and provides an excellent experience for both administrators and clients.