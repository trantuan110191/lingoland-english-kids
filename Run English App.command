#!/bin/zsh

APP_DIR="/Users/thuyanh/Desktop/Desktop Organized/Projects/3year english web"
PORT="8000"
LOCAL_URL="http://127.0.0.1:${PORT}/"
DEPLOY_URL="https://trantuan110191.github.io/lingoland-english-kids/"
LOG_FILE="${APP_DIR}/.vite-server.log"
PID_FILE="${APP_DIR}/.vite-server.pid"

cd "${APP_DIR}" || exit 1

if ! command -v npm >/dev/null 2>&1; then
  osascript -e 'display alert "Cannot run app" message "npm was not found on this Mac."'
  exit 1
fi

if [ ! -d "${APP_DIR}/node_modules" ]; then
  osascript -e 'display notification "Installing dependencies..." with title "LingoLand English app"'
  npm install > "${LOG_FILE}" 2>&1
  if [ $? -ne 0 ]; then
    osascript -e "display alert \"Cannot install dependencies\" message \"See ${LOG_FILE}\""
    exit 1
  fi
fi

if lsof -nP -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  open "${LOCAL_URL}"
else
  nohup npm run dev:phone -- --port "${PORT}" --strictPort > "${LOG_FILE}" 2>&1 &
  echo $! > "${PID_FILE}"

  for _ in {1..20}; do
    if curl -fsS "${LOCAL_URL}" >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done

  if ! curl -fsS "${LOCAL_URL}" >/dev/null 2>&1; then
    osascript -e "display alert \"Cannot start app\" message \"Port ${PORT} did not respond. See ${LOG_FILE}\""
    exit 1
  fi

  open "${LOCAL_URL}"
fi

printf "%s" "${DEPLOY_URL}" | pbcopy
osascript -e "display dialog \"Mac local: ${LOCAL_URL}\n\niPhone / online co dinh: ${DEPLOY_URL}\n\nLink iPhone da duoc copy vao clipboard. Link nay khong phu thuoc Terminal hay Cloudflare tunnel.\" buttons {\"OK\"} default button \"OK\""
