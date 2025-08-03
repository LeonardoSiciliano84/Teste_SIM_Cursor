#!/bin/bash
expect -c "
spawn npx drizzle-kit push
expect \"Is placa_tracao column\"
send \"\r\"
expect eof
"