<!DOCTYPE html>
<html>
<head>
    <title>{{ $subject }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8fafc; border-radius: 8px; padding: 24px; border: 1px solid #e2e8f0;">
        <h1 style="color: #2563eb; margin-top: 0;">{{ $subject }}</h1>
        <p>{{ $body }}</p>
    </div>
    <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">
        &copy; {{ date('Y') }} RealDeal. All rights reserved.
    </p>
</body>
</html>
