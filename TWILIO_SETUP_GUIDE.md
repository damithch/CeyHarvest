# 📱 CeyHarvest SMS Service - Twilio Free Tier Setup Guide

## 🎯 Current Configuration Status
✅ Backend SMS service implemented with Twilio integration
✅ Twilio credentials configured in application.properties
✅ Sri Lankan phone number validation implemented
✅ SMS test endpoints created

## 🔧 Twilio Free Tier Setup Steps

### Step 1: Verify Your Phone Numbers
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified-caller-ids
2. Click **"Add a new Caller ID"**
3. Enter your Sri Lankan phone number (e.g., +94771234567)
4. Choose verification method (SMS or Voice call)
5. Enter the verification code you receive
6. **Repeat for all phone numbers you want to test with**

### Step 2: Check Your Twilio Balance
1. Go to: https://console.twilio.com/us1/billing/billing-overview
2. View your trial credit balance
3. Free trial typically includes $15-20 in credits
4. SMS costs ~$0.0075 per message

### Step 3: Test Your SMS Service

#### Option A: Use Test Endpoint (Recommended)
```bash
# Check SMS service status
curl -X GET http://localhost:8080/api/test/sms-status

# Test SMS sending to a verified number
curl -X POST http://localhost:8080/api/test/sms \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+94771234567"}'
```

#### Option B: Use Registration Form
1. Go to your registration page
2. Select "Phone" registration
3. Enter a **verified** Sri Lankan phone number
4. Complete the registration process

## 🚨 Common Twilio Free Tier Issues & Solutions

### Issue 1: "Phone number not verified"
**Solution**: Add the phone number to verified caller IDs in Twilio console

### Issue 2: "Insufficient funds"
**Solution**: Check trial balance, upgrade account if needed

### Issue 3: "Invalid phone number"
**Solution**: Ensure Sri Lankan format (+94771234567)

### Issue 4: "SMS not received"
**Solutions**:
- Check phone number is verified in Twilio console
- Ensure phone has good signal
- Check spam/blocked messages
- Verify Twilio trial account is active

## 🔧 Configuration Files

### application.properties (Current)
```properties
# SMS Configuration (Twilio)
twilio.account.sid=AC77841e1ccb329f1bb5a42eddeb2f1d80
twilio.auth.token=f363dc22fe1c0b60ce62d79a890e1ecf
twilio.phone.number=+12202390514
sms.enabled=true
```

## 📞 Phone Number Formats Supported
- International: +94771234567
- Local with zero: 0771234567
- Without leading zero: 771234567

## 🔄 Development vs Production Modes

### Development Mode (SMS disabled)
- Shows verification codes in console
- No actual SMS sent
- Always returns success

### Production Mode (SMS enabled)
- Sends real SMS via Twilio
- Requires verified phone numbers (free tier)
- Uses actual Twilio credits

## 🧪 Testing Instructions

1. **Start the backend server**: `mvn spring-boot:run`
2. **Test SMS status**: Visit `http://localhost:8080/api/test/sms-status`
3. **Verify a phone number** in Twilio console
4. **Send test SMS**: Use the test endpoint with your verified number
5. **Check console output** for detailed logs

## 📱 Free Tier Limitations
- ✅ $15-20 trial credits included
- ⚠️ Only verified phone numbers can receive SMS
- ⚠️ Messages include "Sent from your Twilio trial account"
- ⚠️ Limited to trial account features

## 🚀 Upgrading to Paid Account
When ready for production:
1. Add payment method to Twilio account
2. Remove trial limitations
3. Send SMS to any valid phone number
4. Remove Twilio branding from messages

## 🔍 Troubleshooting Commands

```bash
# Check backend logs
tail -f backend/logs/application.log

# Test curl commands (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:8080/api/test/sms-status" -Method GET

# Test SMS sending
$body = @{phoneNumber="+94771234567"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/api/test/sms" -Method POST -Body $body -ContentType "application/json"
```

## ✅ Success Indicators
- SMS service status returns "configured: true"
- Test SMS endpoint returns "success: true"
- Phone receives verification code
- Console shows "✅ SMS sent successfully!"

Your SMS service is now ready for testing with Twilio free tier! 🎉
