@echo off
echo 🔧 Installing missing dependencies...

echo Installing Joi for validation...
npm install joi

echo Installing nodemailer for notifications...
npm install nodemailer

echo ✅ Dependencies installed!
echo.
echo Now run: npm start
pause