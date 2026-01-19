#!/bin/bash
# Phase 5 Test Script - Quick validation

echo "🧪 Testing Phase 5 Implementation..."

# 1. Check if billing schema exists
echo "📊 Checking billing schema..."
if [ -f "scripts/billing-schema.sql" ]; then
    echo "✅ Billing schema found"
else
    echo "❌ Billing schema missing"
fi

# 2. Check if all CSS files exist
echo "🎨 Checking CSS files..."
css_files=("medical-colors.css" "medical-components.css" "medical-icons.css" "medical-animations.css")
for file in "${css_files[@]}"; do
    if [ -f "public/css/$file" ]; then
        echo "✅ $file found"
    else
        echo "❌ $file missing"
    fi
done

# 3. Check if JS files exist
echo "📱 Checking JavaScript files..."
js_files=("dark-mode.js" "ux-utils.js")
for file in "${js_files[@]}"; do
    if [ -f "public/js/$file" ]; then
        echo "✅ $file found"
    else
        echo "❌ $file missing"
    fi
done

# 4. Check if billing models/controllers exist
echo "🏗️ Checking billing backend..."
backend_files=("src/models/Billing.js" "src/controllers/BillingController.js" "src/routes/billingRoutes.js")
for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file found"
    else
        echo "❌ $file missing"
    fi
done

# 5. Start server for manual testing
echo "🚀 Starting server for manual testing..."
echo "Visit: http://localhost:3000/dashboard"
echo "Test features:"
echo "  - Dark mode toggle (Ctrl+Shift+D)"
echo "  - Medical UI components"
echo "  - Billing integration"
echo "  - Form validation"
echo ""
echo "Press Ctrl+C to stop server"

npm start